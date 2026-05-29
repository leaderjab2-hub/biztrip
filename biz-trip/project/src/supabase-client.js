// Supabase bridge for the static app.
// Set window.BIZTRIP_SUPABASE_ANON_KEY in config.js to enable live DB mode.

let BIZTRIP_SUPABASE_URL = window.BIZTRIP_SUPABASE_URL || "https://apfbqpembzexbphpbvyv.supabase.co";
let BIZTRIP_SUPABASE_ANON_KEY = window.BIZTRIP_SUPABASE_ANON_KEY || "";
const BIZTRIP_ID = "trip-computex-2026";

function createBiztripSupabase() {
  if (!BIZTRIP_SUPABASE_ANON_KEY || !window.supabase?.createClient) return null;
  return window.supabase.createClient(BIZTRIP_SUPABASE_URL, BIZTRIP_SUPABASE_ANON_KEY);
}

let biztripDb = createBiztripSupabase();

async function ensureSupabaseClient() {
  if (biztripDb) return biztripDb;
  try {
    const res = await fetch("/api/config", { cache: "no-store" });
    if (res.ok) {
      const cfg = await res.json();
      BIZTRIP_SUPABASE_URL = cfg.supabaseUrl || BIZTRIP_SUPABASE_URL;
      BIZTRIP_SUPABASE_ANON_KEY = cfg.supabaseAnonKey || BIZTRIP_SUPABASE_ANON_KEY;
      window.BIZTRIP_SUPABASE_URL = BIZTRIP_SUPABASE_URL;
      window.BIZTRIP_SUPABASE_ANON_KEY = BIZTRIP_SUPABASE_ANON_KEY;
      biztripDb = createBiztripSupabase();
      window.biztripDb = biztripDb;
    }
  } catch (err) {
    // Local static server has no /api/config; fallback to config.js/local data.
  }
  return biztripDb;
}

function isDbEnabled() {
  return Boolean(biztripDb);
}

function mapTrip(row) {
  return {
    id: row.id,
    title: row.title,
    purpose: row.purpose,
    organization: row.organization,
    country: row.country,
    city: row.city,
    startDate: row.start_date,
    endDate: row.end_date,
    localTz: row.local_tz,
    status: row.status,
    shareToken: row.share_token,
    ownerName: row.owner_name,
    updatedAt: row.updated_at,
  };
}

function mapPerson(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    type: row.type,
    initials: row.initials,
    color: row.color,
    email: row.email,
    phone: row.phone,
    memo: row.memo,
  };
}

function mapFlight(row) {
  return {
    id: row.id,
    type: row.type,
    airline: row.airline,
    flightNumber: row.flight_number,
    dep: row.dep || {},
    arr: row.arr || {},
    durationMin: row.duration_min,
    passengers: row.passengers || [],
    bookingRef: row.booking_ref,
    memo: row.memo,
  };
}

function parseEmbeddedMeta(text) {
  const source = String(text || "");
  const pick = (tag) => {
    const match = source.match(new RegExp(`\\[\\[${tag}\\]\\]([\\s\\S]*?)\\[\\[\\/${tag}\\]\\]`));
    return match ? match[1].trim() : "";
  };
  return {
    mapUrl: pick("MAP_URL"),
    locationNote: pick("LOCATION_NOTE"),
    body: source.replace(/\[\[(MAP_URL|LOCATION_NOTE)\]\][\s\S]*?\[\[\/\1\]\]\s*/g, "").trim(),
  };
}

function mapSchedule(row) {
  const description = String(row.description || "");
  const pick = (tag) => {
    const match = description.match(new RegExp(`\\[\\[${tag}\\]\\]([\\s\\S]*?)\\[\\[\\/${tag}\\]\\]`));
    return match ? match[1].trim() : "";
  };
  const placeNote = pick("PLACE_NOTE");
  const status = pick("SCHEDULE_STATUS") || "confirmed";
  const desc = description
    .replace(/\[\[(PLACE_NOTE|SCHEDULE_STATUS)\]\][\s\S]*?\[\[\/\1\]\]\s*/g, "")
    .trim();
  return {
    id: row.id,
    date: row.date,
    start: row.start_time,
    end: row.end_time,
    type: row.type,
    title: row.title,
    placeId: row.place_id,
    attendees: row.attendees || [],
    desc,
    placeNote,
    status,
    meetingId: row.meeting_id,
    eventId: row.event_id,
    bufferMin: row.buffer_min,
  };
}

function mapMeeting(row) {
  return {
    name: row.name,
    counterpart: row.counterpart,
    counterpartPeople: row.counterpart_people || [],
    objective: row.objective,
    agenda: row.agenda || [],
    talkingPoints: row.talking_points || [],
    cautions: row.cautions || [],
    followUps: row.follow_ups || [],
    memo: row.memo,
  };
}

function mapEvent(row) {
  return {
    name: row.name,
    host: row.host,
    placeId: row.place_id,
    start: row.start_date,
    end: row.end_date,
    purpose: row.purpose,
    dressCode: row.dress_code,
    sessions: row.sessions || [],
    memo: row.memo,
  };
}

function mapRoute(row) {
  return {
    id: row.id,
    date: row.date,
    fromSched: row.from_sched,
    toSched: row.to_sched,
    from: row.from_place,
    to: row.to_place,
    mode: row.mode,
    distance: Number(row.distance || 0),
    durationMin: row.duration_min,
    bufferMin: row.buffer_min,
    dep: row.dep,
    inferred: row.inferred,
  };
}

function rebuildHelpers(data) {
  window.TRIP_DATA = data;
  window.TD = {
    ...window.TD,
    getPerson: (id) => data.PEOPLE.find(p => p.id === id),
    getPlace: (id) => data.PLACES[id],
    getDayItems: (date) => data.SCHEDULE.filter(s => s.date === date).sort((a,b) => a.start.localeCompare(b.start)),
    getConfirmedDayItems: (date) => data.SCHEDULE.filter(s => s.date === date && (s.status || "confirmed") === "confirmed").sort((a,b) => a.start.localeCompare(b.start)),
    getPersonItems: (date, personId) => data.SCHEDULE.filter(s => s.date === date && s.attendees.includes(personId)).sort((a,b) => a.start.localeCompare(b.start)),
    getConfirmedPersonItems: (date, personId) => data.SCHEDULE.filter(s => s.date === date && s.attendees.includes(personId) && (s.status || "confirmed") === "confirmed").sort((a,b) => a.start.localeCompare(b.start)),
    getTripStats: () => ({
      people: data.PEOPLE.length,
      meetings: Object.keys(data.MEETINGS).length,
      events: Object.keys(data.EVENTS).length,
      routes: data.ROUTES.length,
      scheduleItems: data.SCHEDULE.length,
    }),
    getRoutesForDay: (date, personId = "all") => {
      const items = personId === "all"
        ? data.SCHEDULE.filter(s => s.date === date && (s.status || "confirmed") === "confirmed").sort((a, b) => a.start.localeCompare(b.start))
        : data.SCHEDULE.filter(s => s.date === date && s.attendees.includes(personId) && (s.status || "confirmed") === "confirmed").sort((a, b) => a.start.localeCompare(b.start));
      const segments = [];
      for (let i = 0; i < items.length - 1; i++) {
        const from = items[i];
        const to = items[i + 1];
        if (!from.placeId || !to.placeId || from.placeId === to.placeId) continue;
        const explicit = data.ROUTES.find(r => r.date === date && r.fromSched === from.id && r.toSched === to.id);
        if (explicit) {
          segments.push(explicit);
          continue;
        }
        const gap = Math.max(10, window.diffMin(from.end || from.start, to.start));
        const durationMin = Math.min(28, Math.max(8, Math.round(gap * 0.35)));
        const bufferMin = 10;
        segments.push({
          date,
          fromSched: from.id,
          toSched: to.id,
          from: from.placeId,
          to: to.placeId,
          mode: gap <= 45 ? "walking" : "driving",
          distance: gap <= 45 ? 0.9 : 5.0,
          durationMin,
          bufferMin,
          dep: window.minToHHMM(window.hhmmToMin(to.start) - durationMin - bufferMin),
          inferred: true,
        });
      }
      return segments;
    },
  };
  return data;
}

async function sbSelect(table, query = "*", order) {
  let req = biztripDb.from(table).select(query).eq("trip_id", BIZTRIP_ID);
  if (order) req = req.order(order.column, { ascending: order.ascending !== false });
  const { data, error } = await req;
  if (error) throw error;
  return data || [];
}

async function loadTripFromSupabase() {
  await ensureSupabaseClient();
  if (!isDbEnabled()) return null;
  const { data: trip, error: tripError } = await biztripDb.from("trips").select("*").eq("id", BIZTRIP_ID).single();
  if (tripError) throw tripError;

  const [people, places, flights, hotels, days, schedule, meetings, events, routes] = await Promise.all([
    sbSelect("people", "*", { column: "sort_order" }),
    sbSelect("places"),
    sbSelect("flights", "*", { column: "sort_order" }),
    sbSelect("hotels"),
    sbSelect("days", "*", { column: "sort_order" }),
    sbSelect("schedule_items", "*", { column: "sort_order" }),
    sbSelect("meetings"),
    sbSelect("events"),
    sbSelect("route_segments"),
  ]);

  const mappedPlaces = {};
  places.forEach(p => { mappedPlaces[p.id] = { id: p.id, name: p.name, address: p.address, lat: p.lat, lng: p.lng, externalPlaceId: p.external_place_id, mapUrl: p.map_url }; });
  const mappedMeetings = {};
  meetings.forEach(m => { mappedMeetings[m.id] = mapMeeting(m); });
  const mappedEvents = {};
  events.forEach(e => { mappedEvents[e.id] = mapEvent(e); });

  return rebuildHelpers({
    TRIPS: [mapTrip(trip)],
    TRIP: mapTrip(trip),
    PEOPLE: people.map(mapPerson),
    FLIGHTS: flights.map(mapFlight),
    HOTEL: hotels[0] ? (() => {
      const parsed = parseEmbeddedMeta(hotels[0].memo);
      return {
        id: hotels[0].id,
        name: hotels[0].name,
        address: hotels[0].address,
        checkin: hotels[0].checkin,
        checkout: hotels[0].checkout,
        bookingRef: hotels[0].booking_ref,
        breakfast: hotels[0].breakfast,
        guests: hotels[0].guests || [],
        memo: parsed.body,
        mapUrl: parsed.mapUrl,
        locationNote: parsed.locationNote,
      };
    })() : window.TRIP_DATA.HOTEL,
    PLACES: mappedPlaces,
    DAYS: days.map(d => ({ date: d.date, label: d.label, title: d.title, weekday: d.weekday })),
    SCHEDULE: schedule.map(mapSchedule),
    MEETINGS: mappedMeetings,
    EVENTS: mappedEvents,
    ROUTES: routes.map(mapRoute),
  });
}

function localId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function routeSegmentId(item) {
  if (item?.id) return item.id;
  const stable = [item?.date, item?.fromSched, item?.toSched].filter(Boolean).join("-");
  return stable ? `r-${stable.replace(/[^A-Za-z0-9_-]/g, "-")}` : localId("rou");
}

const tableIds = {
  trip: "trips",
  people: "people",
  places: "places",
  flights: "flights",
  hotels: "hotels",
  days: "days",
  schedule: "schedule_items",
  meetings: "meetings",
  events: "events",
  routes: "route_segments",
};

function toDbRow(entity, item) {
  if (entity === "trip") return { id: item.id, title: item.title, purpose: item.purpose, organization: item.organization, country: item.country, city: item.city, start_date: item.startDate, end_date: item.endDate, local_tz: item.localTz, status: item.status, share_token: item.shareToken, owner_name: item.ownerName };
  if (entity === "people") return { ...item, trip_id: BIZTRIP_ID };
  if (entity === "places") return { id: item.id, trip_id: BIZTRIP_ID, name: item.name, address: item.address, lat: item.lat, lng: item.lng, external_place_id: item.externalPlaceId, map_url: item.mapUrl };
  if (entity === "flights") return { id: item.id, trip_id: BIZTRIP_ID, type: item.type, airline: item.airline, flight_number: item.flightNumber, dep: item.dep || {}, arr: item.arr || {}, duration_min: item.durationMin || 0, passengers: item.passengers || [], booking_ref: item.bookingRef, memo: item.memo };
  if (entity === "hotels") {
    const memo = [
      item.mapUrl ? `[[MAP_URL]]${String(item.mapUrl).trim()}[[/MAP_URL]]` : "",
      item.locationNote ? `[[LOCATION_NOTE]]${String(item.locationNote).trim()}[[/LOCATION_NOTE]]` : "",
      item.memo || "",
    ].filter(Boolean).join("\n\n").trim();
    return { id: item.id, trip_id: BIZTRIP_ID, name: item.name, address: item.address, checkin: item.checkin, checkout: item.checkout, booking_ref: item.bookingRef, breakfast: Boolean(item.breakfast), guests: item.guests || [], memo };
  }
  if (entity === "schedule") {
    const placeBlock = item.placeNote ? `[[PLACE_NOTE]]${String(item.placeNote).trim()}[[/PLACE_NOTE]]` : "";
    const statusBlock = `[[SCHEDULE_STATUS]]${String(item.status || "confirmed").trim()}[[/SCHEDULE_STATUS]]`;
    const description = [statusBlock, placeBlock, item.desc || ""].filter(Boolean).join("\n\n").trim();
    return { id: item.id, trip_id: BIZTRIP_ID, date: item.date, start_time: item.start, end_time: item.end, type: item.type, title: item.title, place_id: item.placeId, attendees: item.attendees || [], description, meeting_id: item.meetingId, event_id: item.eventId, buffer_min: item.bufferMin || 10 };
  }
  if (entity === "meetings") return { id: item.id, trip_id: BIZTRIP_ID, name: item.name, counterpart: item.counterpart, counterpart_people: item.counterpartPeople || [], objective: item.objective, agenda: item.agenda || [], talking_points: item.talkingPoints || [], cautions: item.cautions || [], follow_ups: item.followUps || [], memo: item.memo };
  if (entity === "events") return { id: item.id, trip_id: BIZTRIP_ID, name: item.name, host: item.host, place_id: item.placeId, start_date: item.start, end_date: item.end, purpose: item.purpose, dress_code: item.dressCode, sessions: item.sessions || [], memo: item.memo };
  if (entity === "routes") return { id: routeSegmentId(item), trip_id: BIZTRIP_ID, date: item.date, from_sched: item.fromSched, to_sched: item.toSched, from_place: item.from, to_place: item.to, mode: item.mode, distance: item.distance, duration_min: item.durationMin, buffer_min: item.bufferMin, dep: item.dep, inferred: item.inferred || false };
  return { ...item, trip_id: BIZTRIP_ID };
}

async function upsertEntity(entity, item) {
  await ensureSupabaseClient();
  if (!isDbEnabled()) throw new Error("Supabase anon key is missing.");
  const table = tableIds[entity];
  const row = toDbRow(entity, item);
  const { error } = await biztripDb.from(table).upsert(row);
  if (error) throw error;
  return loadTripFromSupabase();
}

async function deleteEntity(entity, id) {
  await ensureSupabaseClient();
  if (!isDbEnabled()) throw new Error("Supabase anon key is missing.");
  const table = tableIds[entity];
  const { error } = await biztripDb.from(table).delete().eq(entity === "days" ? "date" : "id", id);
  if (error) throw error;
  return loadTripFromSupabase();
}

async function replaceRoutesForDay(date, items) {
  await ensureSupabaseClient();
  if (!isDbEnabled()) throw new Error("Supabase anon key is missing.");
  const { error: deleteError } = await biztripDb.from("route_segments").delete().eq("trip_id", BIZTRIP_ID).eq("date", date);
  if (deleteError) throw deleteError;
  if (items?.length) {
    const rows = items.map((item) => toDbRow("routes", item));
    const { error: insertError } = await biztripDb.from("route_segments").upsert(rows);
    if (insertError) throw insertError;
  }
  return loadTripFromSupabase();
}

Object.assign(window, {
  BIZTRIP_SUPABASE_URL,
  BIZTRIP_SUPABASE_ANON_KEY,
  biztripDb,
  ensureSupabaseClient,
  isDbEnabled,
  loadTripFromSupabase,
  upsertEntity,
  deleteEntity,
  replaceRoutesForDay,
  localId,
  routeSegmentId,
});
