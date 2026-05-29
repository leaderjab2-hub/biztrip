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

function normalizeFormDraft(entity, draft) {
  const next = cloneData(draft);
  if (entity === "meetings") {
    next.counterpartPeople = (next.counterpartPeople || []).filter(p => String(p.name || "").trim()).map(p => ({
      name: String(p.name || "").trim(),
      title: String(p.title || "").trim(),
      linkedin: String(p.linkedin || "").trim(),
    }));
    ["agenda", "talkingPoints", "cautions", "followUps"].forEach(key => {
      next[key] = (next[key] || []).map(v => String(v || "").trim()).filter(Boolean);
    });
  }
  if (entity === "flights") {
    next.passengers = window.personRefIds(next.passengers);
  }
  if (entity === "hotels") {
    next.guests = window.personRefIds(next.guests);
  }
  if (entity === "routes") {
    next.id = window.routeSegmentId?.(next) || next.id || window.localId("rou");
  }
  return next;
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
    placeId: "",
    placeName: "",
    placeMapUrl: "",
    placeNote: "",
    attendees: window.TRIP_DATA.PEOPLE.map(p => p.id),
    desc: "",
    meetingId: "",
    eventId: "",
    bufferMin: 10,
    ...defaults,
  };
  if (entity === "meetings") return { id, name: "", counterpart: "", counterpartPeople: [], objective: "", agenda: [], talkingPoints: [], cautions: [], followUps: [], memo: "", ...defaults };
  if (entity === "flights") return { id, type: "outbound", airline: "", flightNumber: "", dep: { airport: "", time: "", mapUrl: "" }, arr: { airport: "", time: "", mapUrl: "" }, durationMin: 0, passengers: window.TRIP_DATA.PEOPLE.map(p => p.id), bookingRef: "", memo: "", ...defaults };
  if (entity === "hotels") return { id, name: "", address: "", checkin: window.TRIP_DATA.TRIP.startDate, checkout: window.TRIP_DATA.TRIP.endDate, bookingRef: "", breakfast: false, guests: window.TRIP_DATA.PEOPLE.map(p => p.id), memo: "", mapUrl: "", locationNote: "", ...defaults };
  if (entity === "places") return { id, name: "", address: "", lat: null, lng: null, externalPlaceId: "", mapUrl: "", ...defaults };
  if (entity === "events") return { id, name: "", host: "", placeId: "", placeName: "", placeMapUrl: "", start: window.TRIP_DATA.TRIP.startDate, end: window.TRIP_DATA.TRIP.endDate, purpose: "", dressCode: "", sessions: [], memo: "", ...defaults };
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

function ListInput({ value, onChange, placeholder = "내용 입력" }) {
  const items = value || [];
  const updateAt = (idx, nextValue) => onChange(items.map((item, i) => i === idx ? nextValue : item));
  const removeAt = (idx) => onChange(items.filter((_, i) => i !== idx));
  return (
    <div className="list-input">
      {items.map((item, idx) => (
        <div key={idx} className="list-input-row">
          <input value={item || ""} placeholder={placeholder} onChange={e => updateAt(idx, e.target.value)} />
          <button type="button" className="icon-btn mini" onClick={() => removeAt(idx)} aria-label="삭제">
            <LIcon name="minus" size={13} />
          </button>
        </div>
      ))}
      <button type="button" className="adot-btn line" style={{ height: 32, padding: "0 12px", fontSize: 12, alignSelf: "flex-start" }} onClick={() => onChange([...items, ""])}>
        <LIcon name="plus" size={13} />추가
      </button>
    </div>
  );
}

function PeopleListInput({ value, onChange }) {
  const people = value || [];
  const updateAt = (idx, key, nextValue) => onChange(people.map((item, i) => i === idx ? { ...item, [key]: nextValue } : item));
  const removeAt = (idx) => onChange(people.filter((_, i) => i !== idx));
  return (
    <div className="list-input">
      {people.map((person, idx) => (
        <div key={idx} className="list-input-row three">
          <input value={person.name || ""} placeholder="이름" onChange={e => updateAt(idx, "name", e.target.value)} />
          <input value={person.title || ""} placeholder="직함" onChange={e => updateAt(idx, "title", e.target.value)} />
          <input value={person.linkedin || ""} placeholder="LinkedIn URL" onChange={e => updateAt(idx, "linkedin", e.target.value)} />
          <button type="button" className="icon-btn mini" onClick={() => removeAt(idx)} aria-label="삭제">
            <LIcon name="minus" size={13} />
          </button>
        </div>
      ))}
      <button type="button" className="adot-btn line" style={{ height: 32, padding: "0 12px", fontSize: 12, alignSelf: "flex-start" }} onClick={() => onChange([...people, { name: "", title: "", linkedin: "" }])}>
        <LIcon name="plus" size={13} />참석자 추가
      </button>
    </div>
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

function PlacePicker({ nameValue, mapUrlValue, onNameChange, onMapUrlChange, placeholder = "예: Caesar Park Taipei" }) {
  const previewUrl = window.normalizeMapUrl(mapUrlValue, nameValue);
  return (
    <div className="place-picker" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <TextInput value={nameValue} onChange={onNameChange} placeholder={placeholder} />
      <TextInput value={mapUrlValue} onChange={onMapUrlChange} placeholder="Google Maps 링크를 붙여 넣거나 비워두면 장소명으로 자동 생성" />
      {previewUrl && (
        <button type="button" className="adot-btn line" style={{ height: 32, padding: "0 12px", fontSize: 12, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => window.openMapUrl(mapUrlValue, nameValue)}>
          <LIcon name="map" size={13} />Google Maps 미리보기
        </button>
      )}
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
  const places = [{ value: "", label: "장소 선택 또는 직접 입력" }, ...Object.values(window.TRIP_DATA.PLACES).map(p => ({ value: p.id, label: p.name }))];
  const schedule = window.TRIP_DATA.SCHEDULE.map(s => ({ value: s.id, label: `${s.date.slice(5)} ${s.start} ${s.title}` }));
  const days = window.TRIP_DATA.DAYS.map(d => ({ value: d.date, label: `${d.label} · ${d.date.slice(5).replace("-", "/")}` }));
  const meetings = [{ value: "", label: "미팅 연결 안 함" }, ...Object.entries(window.TRIP_DATA.MEETINGS).map(([id, m]) => ({ value: id, label: m.name }))];
  const events = [{ value: "", label: "행사 연결 안 함" }, ...Object.entries(window.TRIP_DATA.EVENTS || {}).map(([id, e]) => ({ value: id, label: e.name }))];

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
    const pickPlace = (placeId) => {
      const place = placeId ? window.TD.getPlace(placeId) : null;
      setDraft(d => ({
        ...d,
        placeId,
        placeName: place?.name || d.placeName || "",
        placeMapUrl: place?.mapUrl || d.placeMapUrl || "",
      }));
    };
    return (
      <div className="form-grid">
        <FormField label="날짜"><SelectInput value={draft.date} onChange={v => update("date", v)} options={days} /></FormField>
        <FormField label="유형"><SelectInput value={draft.type} onChange={v => update("type", v)} options={[["meeting","미팅"],["event","행사"],["meal","식사"],["flight","항공"],["hotel","호텔"],["transfer","이동"],["personal","개인"]].map(([value,label]) => ({ value, label }))} /></FormField>
        <FormField label="시작"><TextInput type="time" value={draft.start} onChange={v => update("start", v)} /></FormField>
        <FormField label="종료"><TextInput type="time" value={draft.end} onChange={v => update("end", v)} /></FormField>
        <FormField label="제목" wide><TextInput value={draft.title} onChange={v => update("title", v)} /></FormField>
        <FormField label="기존 장소" wide><SelectInput value={draft.placeId} onChange={pickPlace} options={places} /></FormField>
        <FormField label="장소" wide><PlacePicker nameValue={draft.placeName} mapUrlValue={draft.placeMapUrl} onNameChange={v => update("placeName", v)} onMapUrlChange={v => update("placeMapUrl", v)} /></FormField>
        <FormField label="상세 위치" wide><TextInput value={draft.placeNote} onChange={v => update("placeNote", v)} placeholder="예: 3층 Ballroom 앞, Hall 2 Booth R0302, 북문 Gate B" /></FormField>
        {draft.type === "meeting" && <FormField label="미팅 연결" wide><SelectInput value={draft.meetingId} onChange={v => update("meetingId", v)} options={meetings} /></FormField>}
        {draft.type === "event" && <FormField label="행사 연결" wide><SelectInput value={draft.eventId} onChange={v => update("eventId", v)} options={events} /></FormField>}
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
        <FormField label="출발 지도 링크" wide><TextInput value={draft.dep?.mapUrl} onChange={v => setNested("dep", "mapUrl", v)} placeholder="Google Maps 링크 또는 공항명 검색 링크" /></FormField>
        <FormField label="도착 공항"><TextInput value={draft.arr?.airport} onChange={v => setNested("arr", "airport", v)} /></FormField>
        <FormField label="도착 시각"><TextInput type="datetime-local" value={draft.arr?.time} onChange={v => setNested("arr", "time", v)} /></FormField>
        <FormField label="도착 지도 링크" wide><TextInput value={draft.arr?.mapUrl} onChange={v => setNested("arr", "mapUrl", v)} placeholder="Google Maps 링크 또는 공항명 검색 링크" /></FormField>
        <FormField label="탑승자" wide><AttendeePicker value={window.personRefIds(draft.passengers)} onChange={v => update("passengers", v)} /></FormField>
        <FormField label="메모" wide><TextAreaInput rows={3} value={draft.memo} onChange={v => update("memo", v)} /></FormField>
      </div>
    );
  }

  if (entity === "hotels") {
    return (
      <div className="form-grid">
        <FormField label="호텔명" wide><TextInput value={draft.name} onChange={v => update("name", v)} /></FormField>
        <FormField label="주소" wide><TextInput value={draft.address} onChange={v => update("address", v)} /></FormField>
        <FormField label="상세 위치" wide><TextInput value={draft.locationNote} onChange={v => update("locationNote", v)} placeholder="예: 로비 오른쪽 엘리베이터, 12층 라운지 앞" /></FormField>
        <FormField label="지도 링크" wide><TextInput value={draft.mapUrl} onChange={v => update("mapUrl", v)} placeholder="Google Maps 링크 또는 호텔명 검색 링크" /></FormField>
        <FormField label="체크인"><TextInput type="date" value={draft.checkin} onChange={v => update("checkin", v)} /></FormField>
        <FormField label="체크아웃"><TextInput type="date" value={draft.checkout} onChange={v => update("checkout", v)} /></FormField>
        <FormField label="예약번호"><TextInput value={draft.bookingRef} onChange={v => update("bookingRef", v)} /></FormField>
        <FormField label="조식"><SelectInput value={draft.breakfast ? "yes" : "no"} onChange={v => update("breakfast", v === "yes")} options={[{ value: "yes", label: "포함" }, { value: "no", label: "미포함" }]} /></FormField>
        <FormField label="투숙자" wide><AttendeePicker value={window.personRefIds(draft.guests)} onChange={v => update("guests", v)} /></FormField>
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
        <FormField label="상대 참석자" wide><PeopleListInput value={draft.counterpartPeople} onChange={v => update("counterpartPeople", v)} /></FormField>
        <FormField label="아젠다" wide><ListInput value={draft.agenda} onChange={v => update("agenda", v)} placeholder="아젠다" /></FormField>
        <FormField label="토킹 포인트" wide><ListInput value={draft.talkingPoints} onChange={v => update("talkingPoints", v)} placeholder="토킹 포인트" /></FormField>
        <FormField label="주의사항" wide><ListInput value={draft.cautions} onChange={v => update("cautions", v)} placeholder="주의사항" /></FormField>
        <FormField label="후속 액션" wide><ListInput value={draft.followUps} onChange={v => update("followUps", v)} placeholder="후속 액션" /></FormField>
      </div>
    );
  }

  if (entity === "events") {
    return (
      <div className="form-grid">
        <FormField label="행사명" wide><TextInput value={draft.name} onChange={v => update("name", v)} /></FormField>
        <FormField label="주최"><TextInput value={draft.host} onChange={v => update("host", v)} /></FormField>
        <FormField label="장소" wide><PlacePicker nameValue={draft.placeName} mapUrlValue={draft.placeMapUrl} onNameChange={v => update("placeName", v)} onMapUrlChange={v => update("placeMapUrl", v)} /></FormField>
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
  const [draft, setDraft] = useState(() => {
    const base = cloneData(item || editorNewItem(entity, defaults));
    if (entity === "schedule" || entity === "events") {
      const place = base.placeId ? window.TD.getPlace(base.placeId) : null;
      return { ...base, placeName: base.placeName || place?.name || "", placeMapUrl: base.placeMapUrl || place?.mapUrl || "" };
    }
    if (entity === "flights") {
      return { ...base, dep: { mapUrl: "", ...(base.dep || {}) }, arr: { mapUrl: "", ...(base.arr || {}) }, passengers: window.personRefIds(base.passengers) };
    }
    if (entity === "hotels") {
      return { ...base, guests: window.personRefIds(base.guests) };
    }
    if (entity === "routes") {
      return { ...base, id: window.routeSegmentId?.(base) || base.id || window.localId("rou") };
    }
    return base;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isNew = !item;
  const dbReady = window.isDbEnabled?.();

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let nextDraft = normalizeFormDraft(entity, draft);
      if (entity === "schedule" || entity === "events") {
        const current = nextDraft.placeId ? window.TD.getPlace(nextDraft.placeId) : null;
        const placeMeta = window.resolveLinkedPlace(nextDraft.placeId, current, nextDraft.placeName, nextDraft.placeMapUrl);
        if (placeMeta.placeRow) {
          await window.upsertEntity("places", placeMeta.placeRow);
          nextDraft.placeId = placeMeta.placeId;
        } else {
          nextDraft.placeId = "";
        }
      }
      await window.upsertEntity(entity, nextDraft);
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

Object.assign(window, { WebEntityEditor, editorNewItem, normalizeFormDraft });
