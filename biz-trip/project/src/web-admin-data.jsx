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
  return window.editorNewItem ? window.editorNewItem(entity) : { id: window.localId(entity.slice(0, 1)) };
}

function prepareAdminDraft(entity, item) {
  const base = cloneForEdit(item || defaultItem(entity));
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
  return base;
}

function WebAdminData({ onDataChanged }) {
  const [entity, setEntity] = useState("schedule");
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const spec = ADMIN_ENTITIES.find(e => e.id === entity);
  const items = spec.get();
  const selected = items.find(i => i.id === selectedId) || (!selectedId ? items[0] : null);

  useEffect(() => {
    const first = spec.get()[0];
    setSelectedId(first?.id || null);
    setDraft(first ? prepareAdminDraft(entity, first) : null);
    setMessage("");
  }, [entity]);

  useEffect(() => {
    if (selected) setDraft(prepareAdminDraft(entity, selected));
  }, [selectedId]);

  async function save(e) {
    e?.preventDefault?.();
    if (!draft) return;
    setBusy(true);
    setMessage("");
    try {
      let nextDraft = window.normalizeFormDraft ? window.normalizeFormDraft(entity, draft) : cloneForEdit(draft);
      if (entity === "schedule" || entity === "events") {
        const placeName = String(nextDraft.placeName || "").trim();
        if (placeName) {
          const placeId = nextDraft.placeId || window.localId("pl");
          const current = nextDraft.placeId ? window.TD.getPlace(nextDraft.placeId) : null;
          await window.upsertEntity("places", {
            id: placeId,
            name: placeName,
            address: current?.address || "",
            lat: current?.lat ?? null,
            lng: current?.lng ?? null,
            externalPlaceId: current?.externalPlaceId || "",
            mapUrl: window.normalizeMapUrl(nextDraft.placeMapUrl, placeName),
          });
          nextDraft.placeId = placeId;
        } else {
          nextDraft.placeId = "";
        }
      }
      await window.upsertEntity(entity, nextDraft);
      onDataChanged?.();
      setSelectedId(nextDraft.id);
      setMessage("저장했습니다. 임원 공유 페이지에 반영됩니다.");
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
                <button className="adot-btn line" onClick={() => { const item = prepareAdminDraft(entity, defaultItem(entity)); setSelectedId(item.id); setDraft(item); }}>
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
                  <form onSubmit={save}>
                    <EntityForm entity={entity} draft={draft} setDraft={setDraft} />
                    <div className="admin-actions">
                      <button className="adot-btn primary" type="submit" disabled={busy || !window.isDbEnabled()}>
                        <LIcon name="save" size={14} />저장
                      </button>
                      <button className="adot-btn line" type="button" disabled={busy || !window.isDbEnabled()} onClick={remove}>
                        <LIcon name="trash-2" size={14} />삭제
                      </button>
                    </div>
                  </form>
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
