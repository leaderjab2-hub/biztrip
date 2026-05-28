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
    attendees: window.TRIP_DATA.PEOPLE.map(p => p.id),
    desc: "",
    meetingId: "",
    eventId: "",
    bufferMin: 10,
    ...defaults,
  };
  if (entity === "meetings") return { id, name: "", counterpart: "", counterpartPeople: [], objective: "", agenda: [], talkingPoints: [], cautions: [], followUps: [], memo: "", ...defaults };
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
        <FormField label="장소" wide><SelectInput value={draft.placeId} onChange={v => update("placeId", v)} options={[{ value: "", label: "장소 없음" }, ...places]} /></FormField>
        <FormField label="설명" wide><TextAreaInput rows={3} value={draft.desc} onChange={v => update("desc", v)} /></FormField>
        <FormField label="참석자" wide><AttendeePicker value={draft.attendees} onChange={v => update("attendees", v)} /></FormField>
        <FormField label="미팅 ID"><TextInput value={draft.meetingId} onChange={v => update("meetingId", v)} placeholder="m-..." /></FormField>
        <FormField label="이벤트 ID"><TextInput value={draft.eventId} onChange={v => update("eventId", v)} placeholder="e-..." /></FormField>
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
        <FormField label="장소"><SelectInput value={draft.placeId} onChange={v => update("placeId", v)} options={places} /></FormField>
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
