// Shared atoms for Trip Planner — Avatar, TypeChip, PersonRow, etc.

const { useState, useEffect, useMemo } = React;

function LIcon({ name, size = 18, color, style = {}, className = "" }) {
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  return <i data-lucide={name} className={className}
    style={{ width: size, height: size, color, flexShrink: 0, display: "inline-flex", ...style }} />;
}

function Avatar({ person, size = "" }) {
  if (!person) return null;
  return (
    <div className={`avatar ${size} ${person.color || ""}`} title={person.name}>
      {person.initials}
    </div>
  );
}

function AvatarStack({ ids, size = "sm", max = 4 }) {
  const people = (ids || []).map(id => window.TD.getPerson(id)).filter(Boolean);
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="avatar-stack">
      {shown.map(p => <Avatar key={p.id} person={p} size={size} />)}
      {rest > 0 && (
        <div className={`avatar ${size}`} style={{ background: "var(--surface-neutral-20)" }}>
          +{rest}
        </div>
      )}
    </div>
  );
}

function TypeChip({ type, label }) {
  const meta = window.TD.typeMeta[type] || window.TD.typeMeta.other;
  return <span className={`tone-chip tone-${meta.tone}`}>{label || meta.label}</span>;
}

function StatusChip({ status }) {
  const map = {
    draft:     { label: "작성중", tone: "neutral" },
    confirmed: { label: "확정",   tone: "blue"    },
    ongoing:   { label: "진행중", tone: "lime"    },
    completed: { label: "종료",   tone: "neutral" },
  };
  const m = map[status] || map.draft;
  return <span className={`tone-chip tone-${m.tone}`}>● {m.label}</span>;
}

// Compute next-up item for the executive given (date, personId, nowHHMM)
function nextUpFor(date, personId, nowHHMM) {
  const items = window.TD.getPersonItems(date, personId);
  for (const it of items) {
    if (it.start >= nowHHMM) return it;
  }
  return null;
}

function currentFor(date, personId, nowHHMM) {
  const items = window.TD.getPersonItems(date, personId);
  for (const it of items) {
    if (it.start <= nowHHMM && (it.end || "23:59") > nowHHMM) return it;
  }
  return null;
}

// Time math helper
function hhmmToMin(s) {
  if (!s) return 0;
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}
function minToHHMM(n) {
  n = ((n % 1440) + 1440) % 1440;
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}
function diffMin(a, b) { return Math.max(0, hhmmToMin(b) - hhmmToMin(a)); }

function personRefId(entry) {
  return typeof entry === "string" ? entry : (entry?.personId || entry?.id || "");
}

function personRefIds(value) {
  const refs = value || [];
  const explicitIds = refs.filter(entry => typeof entry === "string").filter(Boolean);
  const source = explicitIds.length ? explicitIds : refs.map(personRefId);
  return Array.from(new Set(source.filter(Boolean)));
}

// Route lookup
function routeBetween(date, fromSched, toSched) {
  return window.TRIP_DATA.ROUTES.find(r => r.date === date && r.fromSched === fromSched && r.toSched === toSched)
    || window.TD.getRoutesForDay(date).find(r => r.fromSched === fromSched && r.toSched === toSched);
}

function buildGoogleMapsSearchUrl(query) {
  const text = String(query || "").trim();
  if (!text) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
}

function normalizeMapUrl(url, fallbackQuery) {
  const text = String(url || "").trim();
  return text || buildGoogleMapsSearchUrl(fallbackQuery);
}

function resolveLinkedPlace(currentPlaceId, currentPlace, placeName, placeMapUrl) {
  const nextName = String(placeName || "").trim();
  if (!nextName) return { placeId: "", placeRow: null };

  const nextMapUrl = normalizeMapUrl(placeMapUrl, nextName);
  const currentName = String(currentPlace?.name || "").trim();
  const currentMapUrl = normalizeMapUrl(currentPlace?.mapUrl, currentName);
  const unchanged = Boolean(currentPlaceId) && currentName === nextName && currentMapUrl === nextMapUrl;
  const placeId = unchanged ? currentPlaceId : window.localId("pl");

  return {
    placeId,
    placeRow: {
      id: placeId,
      name: nextName,
      address: unchanged ? (currentPlace?.address || "") : "",
      lat: unchanged ? (currentPlace?.lat ?? null) : null,
      lng: unchanged ? (currentPlace?.lng ?? null) : null,
      externalPlaceId: unchanged ? (currentPlace?.externalPlaceId || "") : "",
      mapUrl: nextMapUrl,
    },
  };
}

function openMapUrl(url, fallbackQuery) {
  const target = normalizeMapUrl(url, fallbackQuery);
  if (!target) return;
  window.open(target, "_blank", "noopener,noreferrer");
}

Object.assign(window, {
  LIcon, Avatar, AvatarStack, TypeChip, StatusChip,
  nextUpFor, currentFor, hhmmToMin, minToHHMM, diffMin, routeBetween,
  personRefId, personRefIds, buildGoogleMapsSearchUrl, normalizeMapUrl, resolveLinkedPlace, openMapUrl,
});
