// Form-based editors for the manager-facing web pages.

function cloneData(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function linesToArray(value) {
  return String(value || "").split("\n").map(v => v.trim()).filter(Boolean);
}

function arrayToLines(value) {
  return (value || []).join("\n");
}

function peopleToLines(value) {
  return (value || []).map(p => `${p.name || ""}${p.title ? " | " + p.title : ""}`.trim()).join("\n");
}

function linesToPeople(value) {
  return String(value || "").split("\n").map(line => {
    const [name, ...rest] = line.split("|").map(v => v.trim());
    return name ? { name, title: rest.join(" | ") } : null;
  }).filter(Boolean);
}

function editorNewItem(entity, defaults = {}) {
  const id = window.localId?.(entity.slice(0, 3)) || `${entity}-${Date.now()}`;
  if (entity === "people") return { id, name: "", role: "", type: "member", initials: "", color: "blue", email: "", phone: "", memo: "", ...defaults };
  if (entity === "schedule") return {
    id,
    date: window.TRIP_DATA.DAYS[0]?.date,
    start: "09:00",
    end: "10:00",
    type: "meeting",
    title: "",
    placeId: "pl-unknown",
    placeNote: "",
    attendees: window.TRIP_DATA.PEOPLE.map(p => p.id),
    desc: "",
    meetingId: "",
    eventId: "",
    bufferMin: 10,
    ...defaults,
  };
  if (entity === "meetings") return { id, name: "", counterpart: "", counterpartPeople: [], objective: "", agenda: [], talkingPoints: [], cautions: [], followUps: [], memo: "", ...defaults };
  if (entity === "flights") return { id, type: "outbound", airline: "", flightNumber: "", dep: { airport: "", time: "" }, arr: { airport: "", time: "" }, durationMin: 0, passengers: window.TRIP_DATA.PEOPLE.map(p => p.id), bookingRef: "", memo: "", ...defaults };
  if (entity === "hotels") return { id, name: "", address: "", checkin: window.TRIP_DATA.TRIP.startDate, checkout: window.TRIP_DATA.TRIP.endDate, bookingRef: "", breakfast: false, guests: window.TRIP_DATA.PEOPLE.map(p => p.id), memo: "", ...defaults };
  if (entity === "places") return { id, name: "", address: "", lat: null, lng: null, externalPlaceId: "", mapUrl: "", ...defaults };
  if (entity === "events") return { id, name: "", host: "", placeId: "pl-unknown", start: window.TRIP_DATA.TRIP.startDate, end: window.TRIP_DATA.TRIP.endDate, purpose: "", dressCode: "", sessions: [], memo: "", ...defaults };
  if (entity === "routes") return { id, date: window.TRIP_DATA.DAYS[0]?.date, fromSched: "", toSched: "", from: "", to: "", mode: "driving", distance: 0, durationMin: 0, bufferMin: 10, dep: "", inferred: false, ...defaults };
  if (entity === "trip") return { ...window.TRIP_DATA.TRIP, ...defaults };
  return { id, ...defaults };
}

function FormField({ label, children, wide }) {
  return (
    <label className={`form-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value || ""} placeholder={placeholder || ""} onChange={e => onChange(e.target.value)} />;
}

function NumInput({ value, onChange }) {
  return <input type="number" value={value ?? ""} onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
}

function TextAreaInput({ value, onChange, rows = 4, placeholder }) {
  return <textarea rows={rows} value={value || ""} placeholder={placeholder || ""} onChange={e => onChange(e.target.value)} />;
}

function SelectInput({ value, onChange, options }) {
  return (
    <select value={value || ""} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function AttendeePicker({ value, onChange }) {
  const selected = new Set(value || []);
  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange(Array.from(next));
  };
  return (
    <div className="form-check-grid">
      {window.TRIP_DATA.PEOPLE.map(p => (
        <button type="button" key={p.id} className={selected.has(p.id) ? "on" : ""} onClick={() => toggle(p.id)}>
          <Avatar person={p} size="sm" />
          <span>{p.name}</span>
        </button>
      ))}
    </div>
  );
}

function googlePlaceToItem(place) {
  const placeId = place.place_id || "";
  const slug = placeId
    ? placeId.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42)
    : (place.name || "place").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42);
  const loc = place.geometry?.location;
  return {
    id: `pl-g-${slug || Date.now()}`,
    name: place.name || "새 장소",
    address: place.formatted_address || "",
    lat: loc ? loc.lat() : null,
    lng: loc ? loc.lng() : null,
    externalPlaceId: placeId,
    mapUrl: place.url || (placeId ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || "")}&query_place_id=${encodeURIComponent(placeId)}` : ""),
  };
}

function GooglePlaceSearch({ onPlaceSaved }) {
  const inputRef = React.useRef(null);
  const autocompleteRef = React.useRef(null);
  const [status, setStatus] = useState(window.isGoogleMapsEnabled?.() ? "Google 장소 검색 준비 중" : "Google Maps API 키 필요");

  React.useEffect(() => {
    let mounted = true;
    async function boot() {
      const maps = await window.ensureGoogleMaps?.();
      if (!mounted) return;
      if (!maps?.places) {
        setStatus("Google Maps API 키를 Vercel 환경변수에 넣으면 검색이 켜집니다.");
        return;
      }
      autocompleteRef.current = new maps.places.Autocomplete(inputRef.current, {
        fields: ["place_id", "name", "formatted_address", "geometry", "url"],
        componentRestrictions: { country: ["tw", "kr"] },
      });
      autocompleteRef.current.addListener("place_changed", async () => {
        const place = autocompleteRef.current.getPlace();
        if (!place?.place_id) {
          setStatus("검색 결과에서 장소를 선택해 주세요.");
          return;
        }
        const item = googlePlaceToItem(place);
        setStatus("장소 저장 중");
        try {
          if (window.isDbEnabled?.()) await window.upsertEntity("places", item);
          onPlaceSaved(item);
          setStatus(`${item.name} 저장됨`);
        } catch (err) {
          setStatus(err.message || "장소 저장 실패");
        }
      });
      setStatus("장소명을 검색하세요.");
    }
    boot();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="google-place-search">
      <div className="google-place-input">
        <LIcon name="search" size={14} />
        <input ref={inputRef} placeholder="Google Maps에서 장소 검색" disabled={!window.isGoogleMapsEnabled?.()} />
      </div>
      <div className="google-place-status">{status}</div>
    </div>
  );
}

function PlacePicker({ value, onChange }) {
  const place = value ? window.TD.getPlace(value) : null;
  return (
    <div className="place-picker" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {place ? (
        <div style={{ border: "1px solid var(--divider-10)", borderRadius: 12, padding: "12px 14px", background: "var(--surface-neutral-0)", display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9999, background: "var(--surface-neutral-10)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <LIcon name="map-pin" size={14} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "600 13px/18px var(--font-pretendard)" }}>{place.name}</div>
            {place.address && <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>{place.address}</div>}
          </div>
          <button type="button" className="adot-btn line" style={{ height: 30, padding: "0 10px", fontSize: 12, flexShrink: 0 }} onClick={() => onChange("")}>
            지우기
          </button>
        </div>
      ) : (
        <div style={{ border: "1px dashed var(--divider-20)", borderRadius: 12, padding: "12px 14px", font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
          아직 선택된 장소가 없습니다.
        </div>
      )}
      <GooglePlaceSearch onPlaceSaved={(place) => onChange(place.id)} />
    </div>
  );
}

function FormActions({ busy, canDelete, onCancel, onDelete, disabled }) {
  return (
    <div className="form-actions">
      {canDelete && (
        <button className="adot-btn line danger" type="button" disabled={busy || disabled} onClick={onDelete}>
          <LIcon name="trash-2" size={14} />삭제
        </button>
      )}
      <button className="adot-btn line" type="button" disabled={busy} onClick={onCancel}>취소</button>
      <button className="adot-btn primary" type="submit" disabled={busy || disabled}>
        <LIcon name="save" size={14} />{busy ? "저장 중" : "저장"}
      </button>
    </div>
  );
}

function EntityForm({ entity, draft, setDraft }) {
  const update = (key, value) => setDraft(d => ({ ...d, [key]: value }));
  const places = Object.values(window.TRIP_DATA.PLACES).map(p => ({ value: p.id, label: p.name }));
  const schedule = window.TRIP_DATA.SCHEDULE.map(s => ({ value: s.id, label: `${s.date.slice(5)} ${s.start} ${s.title}` }));
  const days = window.TRIP_DATA.DAYS.map(d => ({ value: d.date, label: `${d.label} · ${d.date.slice(5).replace("-", "/")}` }));

  if (entity === "trip") {
    return (
      <div className="form-grid">
        <FormField label="출장명" wide><TextInput value={draft.title} onChange={v => update("title", v)} /></FormField>
        <FormField label="목적" wide><TextAreaInput rows={3} value={draft.purpose} onChange={v => update("purpose", v)} /></FormField>
        <FormField label="국가"><TextInput value={draft.country} onChange={v => update("country", v)} /></FormField>
        <FormField label="도시"><TextInput value={draft.city} onChange={v => update("city", v)} /></FormField>
        <FormField label="시작일"><TextInput type="date" value={draft.startDate} onChange={v => update("startDate", v)} /></FormField>
        <FormField label="종료일"><TextInput type="date" value={draft.endDate} onChange={v => update("endDate", v)} /></FormField>
        <FormField label="상태"><SelectInput value={draft.status} onChange={v => update("status", v)} options={[{ value: "draft", label: "초안" }, { value: "confirmed", label: "확정" }]} /></FormField>
      </div>
    );
  }

  if (entity === "people") {
    return (
      <div className="form-grid">
        <FormField label="이름"><TextInput value={draft.name} onChange={v => update("name", v)} /></FormField>
        <FormField label="역할"><TextInput value={draft.role} onChange={v => update("role", v)} /></FormField>
        <FormField label="구분"><SelectInput value={draft.type} onChange={v => update("type", v)} options={[{ value: "executive", label: "임원" }, { value: "member", label: "구성원" }]} /></FormField>
        <FormField label="이니셜"><TextInput value={draft.initials} onChange={v => update("initials", v)} /></FormField>
        <FormField label="이메일"><TextInput value={draft.email} onChange={v => update("email", v)} /></FormField>
        <FormField label="전화"><TextInput value={draft.phone} onChange={v => update("phone", v)} /></FormField>
        <FormField label="메모" wide><TextAreaInput rows={3} value={draft.memo} onChange={v => update("memo", v)} /></FormField>
      </div>
    );
  }

  if (entity === "schedule") {
    return (
      <div className="form-grid">
        <FormField label="날짜"><SelectInput value={draft.date} onChange={v => update("date", v)} options={days} /></FormField>
        <FormField label="유형"><SelectInput value={draft.type} onChange={v => update("type", v)} options={[["meeting","미팅"],["event","행사"],["meal","식사"],["flight","항공"],["hotel","호텔"],["move","이동"],["personal","개인"]].map(([value,label]) => ({ value, label }))} /></FormField>
        <FormField label="시작"><TextInput type="time" value={draft.start} onChange={v => update("start", v)} /></FormField>
        <FormField label="종료"><TextInput type="time" value={draft.end} onChange={v => update("end", v)} /></FormField>
        <FormField label="제목" wide><TextInput value={draft.title} onChange={v => update("title", v)} /></FormField>
        <FormField label="장소" wide><PlacePicker value={draft.placeId} onChange={v => update("placeId", v)} /></FormField>
        <FormField label="상세 위치" wide><TextInput value={draft.placeNote} onChange={v => update("placeNote", v)} placeholder="예: 3층 Ballroom 앞, Hall 2 Booth R0302, 북문 Gate B" /></FormField>
        <FormField label="설명" wide><TextAreaInput rows={3} value={draft.desc} onChange={v => update("desc", v)} /></FormField>
        <FormField label="참석자" wide><AttendeePicker value={draft.attendees} onChange={v => update("attendees", v)} /></FormField>
      </div>
    );
  }

  if (entity === "flights") {
    const setNested = (key, field, value) => setDraft(d => ({ ...d, [key]: { ...(d[key] || {}), [field]: value } }));
    return (
      <div className="form-grid">
        <FormField label="구분"><SelectInput value={draft.type} onChange={v => update("type", v)} options={[{ value: "outbound", label: "출국" }, { value: "return", label: "귀국" }]} /></FormField>
        <FormField label="항공사"><TextInput value={draft.airline} onChange={v => update("airline", v)} /></FormField>
        <FormField label="편명"><TextInput value={draft.flightNumber} onChange={v => update("flightNumber", v)} /></FormField>
        <FormField label="예약번호"><TextInput value={draft.bookingRef} onChange={v => update("bookingRef", v)} /></FormField>
        <FormField label="출발 공항"><TextInput value={draft.dep?.airport} onChange={v => setNested("dep", "airport", v)} /></FormField>
        <FormField label="출발 시각"><TextInput type="datetime-local" value={draft.dep?.time} onChange={v => setNested("dep", "time", v)} /></FormField>
        <FormField label="도착 공항"><TextInput value={draft.arr?.airport} onChange={v => setNested("arr", "airport", v)} /></FormField>
        <FormField label="도착 시각"><TextInput type="datetime-local" value={draft.arr?.time} onChange={v => setNested("arr", "time", v)} /></FormField>
        <FormField label="탑승자" wide><AttendeePicker value={draft.passengers} onChange={v => update("passengers", v)} /></FormField>
        <FormField label="메모" wide><TextAreaInput rows={3} value={draft.memo} onChange={v => update("memo", v)} /></FormField>
      </div>
    );
  }

  if (entity === "hotels") {
    return (
      <div className="form-grid">
        <FormField label="호텔명" wide><TextInput value={draft.name} onChange={v => update("name", v)} /></FormField>
        <FormField label="주소" wide><TextInput value={draft.address} onChange={v => update("address", v)} /></FormField>
        <FormField label="체크인"><TextInput type="date" value={draft.checkin} onChange={v => update("checkin", v)} /></FormField>
        <FormField label="체크아웃"><TextInput type="date" value={draft.checkout} onChange={v => update("checkout", v)} /></FormField>
        <FormField label="예약번호"><TextInput value={draft.bookingRef} onChange={v => update("bookingRef", v)} /></FormField>
        <FormField label="조식"><SelectInput value={draft.breakfast ? "yes" : "no"} onChange={v => update("breakfast", v === "yes")} options={[{ value: "yes", label: "포함" }, { value: "no", label: "미포함" }]} /></FormField>
        <FormField label="투숙자" wide><AttendeePicker value={draft.guests} onChange={v => update("guests", v)} /></FormField>
        <FormField label="메모" wide><TextAreaInput rows={3} value={draft.memo} onChange={v => update("memo", v)} /></FormField>
      </div>
    );
  }

  if (entity === "meetings") {
    return (
      <div className="form-grid">
        <FormField label="미팅명" wide><TextInput value={draft.name} onChange={v => update("name", v)} /></FormField>
        <FormField label="상대 회사"><TextInput value={draft.counterpart} onChange={v => update("counterpart", v)} /></FormField>
        <FormField label="목적" wide><TextAreaInput rows={3} value={draft.objective} onChange={v => update("objective", v)} /></FormField>
        <FormField label="상대 참석자" wide><TextAreaInput rows={4} value={peopleToLines(draft.counterpartPeople)} onChange={v => update("counterpartPeople", linesToPeople(v))} placeholder="이름 | 직함" /></FormField>
        <FormField label="아젠다" wide><TextAreaInput rows={4} value={arrayToLines(draft.agenda)} onChange={v => update("agenda", linesToArray(v))} placeholder="한 줄에 하나씩" /></FormField>
        <FormField label="토킹 포인트" wide><TextAreaInput rows={4} value={arrayToLines(draft.talkingPoints)} onChange={v => update("talkingPoints", linesToArray(v))} /></FormField>
        <FormField label="주의사항" wide><TextAreaInput rows={3} value={arrayToLines(draft.cautions)} onChange={v => update("cautions", linesToArray(v))} /></FormField>
        <FormField label="후속 액션" wide><TextAreaInput rows={3} value={arrayToLines(draft.followUps)} onChange={v => update("followUps", linesToArray(v))} /></FormField>
      </div>
    );
  }

  if (entity === "events") {
    return (
      <div className="form-grid">
        <FormField label="행사명" wide><TextInput value={draft.name} onChange={v => update("name", v)} /></FormField>
        <FormField label="주최"><TextInput value={draft.host} onChange={v => update("host", v)} /></FormField>
        <FormField label="장소" wide><PlacePicker value={draft.placeId} onChange={v => update("placeId", v)} /></FormField>
        <FormField label="시작일"><TextInput type="date" value={draft.start} onChange={v => update("start", v)} /></FormField>
        <FormField label="종료일"><TextInput type="date" value={draft.end} onChange={v => update("end", v)} /></FormField>
        <FormField label="드레스코드"><TextInput value={draft.dressCode} onChange={v => update("dressCode", v)} /></FormField>
        <FormField label="목적" wide><TextAreaInput rows={3} value={draft.purpose} onChange={v => update("purpose", v)} /></FormField>
        <FormField label="세션" wide><TextAreaInput rows={4} value={arrayToLines(draft.sessions)} onChange={v => update("sessions", linesToArray(v))} /></FormField>
      </div>
    );
  }

  if (entity === "places") {
    return (
      <div className="form-grid">
        <FormField label="장소명" wide><TextInput value={draft.name} onChange={v => update("name", v)} /></FormField>
        <FormField label="주소" wide><TextInput value={draft.address} onChange={v => update("address", v)} /></FormField>
        <FormField label="지도 URL" wide><TextInput value={draft.mapUrl} onChange={v => update("mapUrl", v)} /></FormField>
      </div>
    );
  }

  if (entity === "routes") {
    return (
      <div className="form-grid">
        <FormField label="날짜"><SelectInput value={draft.date} onChange={v => update("date", v)} options={days} /></FormField>
        <FormField label="이동수단"><SelectInput value={draft.mode} onChange={v => update("mode", v)} options={[{ value: "driving", label: "차량" }, { value: "walking", label: "도보" }, { value: "transit", label: "대중교통" }]} /></FormField>
        <FormField label="이전 일정" wide><SelectInput value={draft.fromSched} onChange={v => update("fromSched", v)} options={schedule} /></FormField>
        <FormField label="다음 일정" wide><SelectInput value={draft.toSched} onChange={v => update("toSched", v)} options={schedule} /></FormField>
        <FormField label="출발 장소"><SelectInput value={draft.from} onChange={v => update("from", v)} options={places} /></FormField>
        <FormField label="도착 장소"><SelectInput value={draft.to} onChange={v => update("to", v)} options={places} /></FormField>
        <FormField label="거리 km"><NumInput value={draft.distance} onChange={v => update("distance", v)} /></FormField>
        <FormField label="이동 분"><NumInput value={draft.durationMin} onChange={v => update("durationMin", v)} /></FormField>
        <FormField label="버퍼 분"><NumInput value={draft.bufferMin} onChange={v => update("bufferMin", v)} /></FormField>
        <FormField label="권장 출발"><TextInput type="time" value={draft.dep} onChange={v => update("dep", v)} /></FormField>
      </div>
    );
  }

  return null;
}

function WebEntityEditor({ entity, item, title, defaults, onClose, onSaved, allowDelete = true }) {
  const [draft, setDraft] = useState(() => cloneData(item || editorNewItem(entity, defaults)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isNew = !item;
  const dbReady = window.isDbEnabled?.();

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await window.upsertEntity(entity, draft);
      await onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!draft.id || !confirm("정말 삭제할까요?")) return;
    setBusy(true);
    setError("");
    try {
      await window.deleteEntity(entity, draft.id);
      await onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <form className="form-modal" onSubmit={save}>
        <div className="form-modal-head">
          <div>
            <div className="form-modal-kicker">{isNew ? "새로 추가" : "내용 수정"}</div>
            <div className="form-modal-title">{title}</div>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="닫기">
            <LIcon name="x" size={18} />
          </button>
        </div>
        {!dbReady && (
          <div className="form-alert">DB 연결이 꺼져 있어 저장할 수 없습니다. Vercel 환경변수와 재배포 상태를 확인해 주세요.</div>
        )}
        <EntityForm entity={entity} draft={draft} setDraft={setDraft} />
        {error && <div className="form-error">{error}</div>}
        <FormActions busy={busy} disabled={!dbReady} canDelete={!isNew && allowDelete} onCancel={onClose} onDelete={remove} />
      </form>
    </div>
  );
}

Object.assign(window, { WebEntityEditor, editorNewItem });
