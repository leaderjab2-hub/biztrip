// Web admin — Day-by-day itinerary editor
// Shows table view with inline travel rows + person filter + buffer/route info

function PersonFilterChips({ filter, onChange }) {
  const { PEOPLE } = window.TRIP_DATA;
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginRight: 4 }}>참석자</span>
      <button
        className="tone-chip"
        style={{
          height: 28, padding: "0 12px", border: 0, cursor: "pointer",
          background: filter === "all" ? "var(--on-surface-neutral-100)" : "var(--surface-neutral-10)",
          color: filter === "all" ? "#fff" : "var(--on-surface-neutral-80)",
        }}
        onClick={() => onChange("all")}
      >전체</button>
      {PEOPLE.map(p => (
        <button
          key={p.id}
          className="tone-chip"
          style={{
            height: 28, padding: "0 8px 0 6px", border: 0, cursor: "pointer", gap: 6,
            background: filter === p.id ? "var(--on-surface-neutral-100)" : "var(--surface-neutral-10)",
            color: filter === p.id ? "#fff" : "var(--on-surface-neutral-80)",
          }}
          onClick={() => onChange(p.id)}
        >
          <Avatar person={p} size="sm" />
          {p.name}
        </button>
      ))}
    </div>
  );
}

function ItineraryTable({ date, personFilter, onEdit }) {
  const items = personFilter === "all"
    ? window.TD.getDayItems(date)
    : window.TD.getPersonItems(date, personFilter);

  // Build a list with interleaved travel rows
  const rows = [];
  for (let i = 0; i < items.length; i++) {
    rows.push({ kind: "item", it: items[i] });
    const next = items[i + 1];
    const currentConfirmed = (items[i].status || "confirmed") === "confirmed";
    const nextConfirmed = (next?.status || "confirmed") === "confirmed";
    if (next && currentConfirmed && nextConfirmed && items[i].placeId && next.placeId && items[i].placeId !== next.placeId) {
      const route = window.routeBetween(date, items[i].id, next.id);
      if (route) {
        rows.push({ kind: "travel", route });
      } else {
        // generic gap
        const gap = window.diffMin(items[i].end || items[i].start, next.start);
        if (gap > 0) rows.push({ kind: "gap", min: gap });
      }
    }
  }

  return (
    <table className="itin-table">
      <colgroup>
        <col style={{ width: 110 }} />
        <col style={{ width: 80 }} />
        <col />
        <col style={{ width: 180 }} />
        <col style={{ width: 180 }} />
        <col style={{ width: 72 }} />
      </colgroup>
      <thead>
        <tr>
          <th>시간</th>
          <th>유형</th>
          <th>일정</th>
          <th>참석자</th>
          <th>장소</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => {
          if (r.kind === "travel") {
            const fromP = window.TD.getPlace(r.route.from);
            const toP   = window.TD.getPlace(r.route.to);
            return (
              <tr key={idx} className="travel-row">
                <td colSpan={6}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <LIcon name="navigation" size={12} color="var(--on-surface-neutral-50)" />
                    <span><b style={{ color: "var(--on-surface-neutral-80)", fontWeight: 600 }}>{fromP?.name}</b> → <b style={{ color: "var(--on-surface-neutral-80)", fontWeight: 600 }}>{toP?.name}</b></span>
                    <span className="vline" />
                    <span>차량 {r.route.durationMin}분 ({r.route.distance}km)</span>
                    <span className="vline" />
                    <span>버퍼 {r.route.bufferMin}분</span>
                    <span className="vline" />
                    <span style={{ color: "var(--blue-700)", fontWeight: 600 }}>권장 출발 {r.route.dep}</span>
                  </span>
                </td>
              </tr>
            );
          }
          if (r.kind === "gap") {
            return (
              <tr key={idx} className="travel-row">
                <td colSpan={6} style={{ color: "var(--on-surface-neutral-50)" }}>
                  <LIcon name="clock" size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  여유 시간 {r.min}분
                </td>
              </tr>
            );
          }
          const it = r.it;
          const place = it.placeId ? window.TD.getPlace(it.placeId) : null;
          return (
            <tr key={idx} className={it.type === "meeting" ? "has-meeting" : ""} style={it.status === "planned" ? { opacity: 0.72 } : null}>
              <td className="time">
                {it.start}{it.end ? <span style={{ color: "var(--on-surface-neutral-50)", fontWeight: 400 }}> – {it.end}</span> : null}
              </td>
              <td>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                  <TypeChip type={it.type} />
                  <StatusChip status={it.status || "confirmed"} />
                </div>
              </td>
              <td>
                <div className="ttl">{it.title}</div>
                <div className="sub">{it.desc}</div>
              </td>
              <td>
                <AvatarStack ids={it.attendees} size="sm" max={5} />
              </td>
              <td>
                {place ? (
                  <>
                    <button type="button" style={{ font: "600 13px/18px var(--font-pretendard)", padding: 0, border: 0, background: "transparent", textAlign: "left", cursor: place.mapUrl ? "pointer" : "default" }} onClick={() => place.mapUrl && window.openMapUrl(place.mapUrl, `${place.name} ${it.placeNote || ""}`)}>
                      {place.name}
                    </button>
                    {it.placeNote ? <div className="placeAddr" style={{ color: "var(--on-surface-neutral-70)" }}>{it.placeNote}</div> : null}
                    <div className="placeAddr">{place.address}</div>
                  </>
                ) : <span style={{ color: "var(--on-surface-neutral-50)", fontSize: 12 }}>—</span>}
              </td>
              <td>
                <button className="adot-btn line table-action" onClick={() => onEdit?.(it)}>
                  <LIcon name="pencil" size={12} />수정
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function WebItinerary({ day = "2026-06-11", personFilter: pf = "all", accent = "mono", onDataChanged }) {
  const [date, setDate] = useState(day);
  const [filter, setFilter] = useState(pf);
  const [editor, setEditor] = useState(null);
  useEffect(() => { setDate(day); }, [day]);
  useEffect(() => { setFilter(pf); }, [pf]);

  const { DAYS, PEOPLE } = window.TRIP_DATA;
  const items = filter === "all" ? window.TD.getDayItems(date) : window.TD.getPersonItems(date, filter);
  const meetingsCt = items.filter(i => i.type === "meeting").length;
  const eventsCt   = items.filter(i => i.type === "event").length;
  const mealsCt    = items.filter(i => i.type === "meal").length;

  return (
    <div className={`web-frame accent-${accent}`}>
      <WebTopbar crumb={["출장", window.TRIP_DATA.TRIP.title, "Day별 일정"]} onEdit={() => setEditor({ item: null, defaults: { date } })} />
      <div className="layout">
        <WebSidebar active="itinerary" />
        <div className="content">
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <div>
              <div className="h1">Day별 일정</div>
              <div style={{ font: "500 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 4 }}>
                각 일정마다 참석자를 다르게 지정 · 장소 입력 시 이동 시간 자동 계산
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <button className="adot-btn line" style={{ height: 34, padding: "0 12px", fontSize: 13, display: "inline-flex", gap: 6, alignItems: "center" }}>
                <LIcon name="refresh-cw" size={14} />이동 시간 다시 계산
              </button>
              <button className="adot-btn primary" style={{ height: 34, padding: "0 12px", fontSize: 13, display: "inline-flex", gap: 6, alignItems: "center" }} onClick={() => setEditor({ item: null, defaults: { date } })}>
                <LIcon name="plus" size={14} />일정 추가
              </button>
            </div>
          </div>

          {/* Day tabs */}
          <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--surface-neutral-10)", borderRadius: 10, alignSelf: "flex-start" }}>
            {DAYS.map(d => (
              <button
                key={d.date}
                onClick={() => setDate(d.date)}
                style={{
                  height: 32, padding: "0 14px", borderRadius: 8, border: 0,
                  font: "500 13px/16px var(--font-pretendard)", cursor: "pointer",
                  background: d.date === date ? "var(--on-surface-neutral-100)" : "transparent",
                  color: d.date === date ? "#fff" : "var(--on-surface-neutral-80)",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <span>{d.label}</span>
                <span style={{ opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>
                  {d.date.slice(5).replace("-", "/")}
                </span>
              </button>
            ))}
          </div>

          {/* Filters + summary */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <PersonFilterChips filter={filter} onChange={setFilter} />
            <div style={{ marginLeft: "auto", display: "flex", gap: 14, font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-60)" }}>
              <span>{items.length}개 일정</span>
              <span>· 미팅 {meetingsCt}</span>
              <span>· 식사 {mealsCt}</span>
              <span>· 행사 {eventsCt}</span>
            </div>
          </div>

          {/* Table */}
          <div className="card flush" style={{ overflow: "hidden", flex: 1 }}>
            <ItineraryTable date={date} personFilter={filter} onEdit={(item) => setEditor({ item })} />
          </div>
        </div>
      </div>
      {editor && (
        <WebEntityEditor
          entity="schedule"
          item={editor.item}
          title={editor.item ? "일정 수정" : "일정 추가"}
          defaults={editor.defaults}
          onClose={() => setEditor(null)}
          onSaved={onDataChanged}
        />
      )}
    </div>
  );
}

Object.assign(window, { WebItinerary, ItineraryTable, PersonFilterChips });
