// Generic data admin: CRUD over Supabase-backed trip entities.

const ADMIN_ENTITIES = [
  { id: "people", label: "참석자", icon: "users", get: () => window.TRIP_DATA.PEOPLE },
  { id: "schedule", label: "일정", icon: "calendar-days", get: () => window.TRIP_DATA.SCHEDULE },
  { id: "meetings", label: "미팅", icon: "handshake", get: () => Object.entries(window.TRIP_DATA.MEETINGS).map(([id, m]) => ({ id, ...m })) },
  { id: "places", label: "장소", icon: "map-pin", get: () => Object.values(window.TRIP_DATA.PLACES) },
  { id: "events", label: "행사", icon: "ticket", get: () => Object.entries(window.TRIP_DATA.EVENTS).map(([id, e]) => ({ id, ...e })) },
  { id: "routes", label: "이동", icon: "route", get: () => window.TRIP_DATA.ROUTES },
];

function cloneForEdit(v) {
  return JSON.parse(JSON.stringify(v || {}));
}

function defaultItem(entity) {
  const id = window.localId(entity.slice(0, 1));
  if (entity === "people") return { id, name: "새 참석자", role: "", type: "member", initials: "N", color: "blue", email: "", phone: "", memo: "" };
  if (entity === "schedule") return { id, date: window.TRIP_DATA.DAYS[0]?.date, start: "09:00", end: "10:00", type: "meeting", title: "새 일정", placeId: "pl-unknown", attendees: window.TRIP_DATA.PEOPLE.map(p => p.id), desc: "", meetingId: null, bufferMin: 10 };
  if (entity === "meetings") return { id, name: "새 미팅", counterpart: "", counterpartPeople: [], objective: "", agenda: [], talkingPoints: [], cautions: [], followUps: [], memo: "" };
  if (entity === "places") return { id, name: "새 장소", address: "", lat: null, lng: null, externalPlaceId: "", mapUrl: "" };
  if (entity === "events") return { id, name: "새 행사", host: "", placeId: "pl-unknown", start: window.TRIP_DATA.TRIP.startDate, end: window.TRIP_DATA.TRIP.endDate, purpose: "", dressCode: "", sessions: [], memo: "" };
  if (entity === "routes") return { id, date: window.TRIP_DATA.DAYS[0]?.date, fromSched: "", toSched: "", from: "", to: "", mode: "driving", distance: 0, durationMin: 0, bufferMin: 10, dep: "", inferred: false };
  return { id };
}

function AdminJsonEditor({ value, onChange }) {
  const [raw, setRaw] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState("");
  useEffect(() => {
    setRaw(JSON.stringify(value, null, 2));
    setError("");
  }, [value?.id]);

  return (
    <div className="admin-json">
      <textarea
        value={raw}
        spellCheck={false}
        onChange={(e) => {
          const next = e.target.value;
          setRaw(next);
          try {
            const parsed = JSON.parse(next);
            setError("");
            onChange(parsed);
          } catch (err) {
            setError(err.message);
          }
        }}
      />
      {error && <div className="admin-error">JSON 오류: {error}</div>}
    </div>
  );
}

function WebAdminData({ onDataChanged }) {
  const [entity, setEntity] = useState("schedule");
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const spec = ADMIN_ENTITIES.find(e => e.id === entity);
  const items = spec.get();
  const selected = items.find(i => i.id === selectedId) || items[0] || null;

  useEffect(() => {
    const first = spec.get()[0];
    setSelectedId(first?.id || null);
    setDraft(first ? cloneForEdit(first) : null);
    setMessage("");
  }, [entity]);

  useEffect(() => {
    if (selected) setDraft(cloneForEdit(selected));
  }, [selectedId]);

  async function save() {
    if (!draft) return;
    setBusy(true);
    setMessage("");
    try {
      await window.upsertEntity(entity, draft);
      onDataChanged?.();
      setSelectedId(draft.id);
      setMessage("저장했습니다.");
    } catch (err) {
      setMessage(`저장 실패: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!draft?.id || !confirm(`${draft.title || draft.name || draft.id} 삭제할까요?`)) return;
    setBusy(true);
    setMessage("");
    try {
      await window.deleteEntity(entity, draft.id);
      onDataChanged?.();
      setSelectedId(null);
      setDraft(null);
      setMessage("삭제했습니다.");
    } catch (err) {
      setMessage(`삭제 실패: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="web-frame">
      <WebTopbar crumb={["출장", window.TRIP_DATA.TRIP.title, "데이터 편집"]} />
      <div className="layout">
        <WebSidebar active="admin" />
        <div className="content">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <div>
              <div className="h1">데이터 편집</div>
              <div style={{ font: "500 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 4 }}>
                Supabase에 저장된 출장 데이터를 직접 수정 · 추가 · 삭제
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span className={`tone-chip ${window.isDbEnabled() ? "tone-lime" : "tone-red"}`}>
                {window.isDbEnabled() ? "DB 연결됨" : "config.js anon key 필요"}
              </span>
            </div>
          </div>

          <div className="admin-tabs">
            {ADMIN_ENTITIES.map(e => (
              <button key={e.id} className={entity === e.id ? "active" : ""} onClick={() => setEntity(e.id)}>
                <LIcon name={e.icon} size={14} />{e.label}
              </button>
            ))}
          </div>

          <div className="admin-grid">
            <div className="card flush admin-list">
              <div className="ch">
                <LIcon name={spec.icon} size={16} />
                <span>{spec.label}</span>
                <span style={{ marginLeft: "auto", color: "var(--on-surface-neutral-50)", fontSize: 12 }}>{items.length}개</span>
              </div>
              <div className="admin-list-body">
                {items.map(item => (
                  <button key={item.id} className={selectedId === item.id ? "active" : ""} onClick={() => setSelectedId(item.id)}>
                    <span>{item.title || item.name || item.id}</span>
                    <small>{item.date || item.counterpart || item.type || item.id}</small>
                  </button>
                ))}
              </div>
              <div className="admin-list-actions">
                <button className="adot-btn line" onClick={() => { const item = defaultItem(entity); setSelectedId(item.id); setDraft(item); }}>
                  <LIcon name="plus" size={14} />새로 만들기
                </button>
              </div>
            </div>

            <div className="card flush admin-editor">
              <div className="ch">
                <LIcon name="pencil" size={16} />
                <span>{draft?.title || draft?.name || draft?.id || "선택 없음"}</span>
                {message && <span style={{ marginLeft: "auto", font: "500 12px/16px var(--font-pretendard)", color: message.includes("실패") ? "var(--red-500)" : "var(--blue-700)" }}>{message}</span>}
              </div>
              <div className="cb">
                {draft ? (
                  <>
                    <AdminJsonEditor value={draft} onChange={setDraft} />
                    <div className="admin-actions">
                      <button className="adot-btn primary" disabled={busy || !window.isDbEnabled()} onClick={save}>
                        <LIcon name="save" size={14} />저장
                      </button>
                      <button className="adot-btn line" disabled={busy || !window.isDbEnabled()} onClick={remove}>
                        <LIcon name="trash-2" size={14} />삭제
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 30, color: "var(--on-surface-neutral-50)" }}>왼쪽에서 항목을 선택하세요.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WebAdminData });
