// Web admin — Trip dashboard (overview)
// 1280 wide, ~960 tall

function WebSidebar({ active = "dashboard" }) {
  const { PEOPLE, FLIGHTS, HOTEL, SCHEDULE, MEETINGS, EVENTS } = window.TRIP_DATA;
  const items = [
    { id: "dashboard",  label: "개요",          icon: "layout-dashboard", count: null, href: "/dashboard" },
    { id: "people",     label: "참석자",        icon: "users",            count: PEOPLE.length, href: "/dashboard" },
    { id: "flights",    label: "항공편",        icon: "plane",            count: FLIGHTS.length, href: "/dashboard" },
    { id: "hotels",     label: "호텔",          icon: "bed-double",       count: HOTEL ? 1 : 0, href: "/dashboard" },
    { id: "itinerary",  label: "Day별 일정",    icon: "calendar-days",    count: SCHEDULE.length, href: "/itinerary" },
    { id: "meetings",   label: "미팅",          icon: "handshake",        count: Object.keys(MEETINGS).length, href: "/meeting/m-smci-exec" },
    { id: "events",     label: "행사",          icon: "ticket",           count: Object.keys(EVENTS).length, href: "/dashboard" },
    { id: "routes",     label: "이동 동선",     icon: "route",            count: null, href: "/routes" },
    { id: "admin",      label: "데이터 편집",   icon: "database",         count: null, href: "/admin" },
    { id: "report",     label: "브리핑 리포트", icon: "file-text",        count: null, href: "/share?screen=briefing&personId=p-my&day=2026-06-01&now=10:42" },
    { id: "share",      label: "공유 링크",     icon: "share-2",          count: null, href: "/share?personId=p-my&day=2026-06-01&now=10:42" },
  ];
  return (
    <div className="sidebar">
      <div className="group">출장 관리</div>
      {items.slice(0, 9).map(it => (
        <div key={it.id} className={`nav-item ${active === it.id ? "active" : ""}`} onClick={() => window.location.hash = it.href}>
          <LIcon name={it.icon} size={16} />
          <span>{it.label}</span>
          {it.count != null && <span className="count">{it.count}</span>}
        </div>
      ))}
      <div className="group">공유</div>
      {items.slice(9).map(it => (
        <div key={it.id} className={`nav-item ${active === it.id ? "active" : ""}`} onClick={() => window.location.hash = it.href}>
          <LIcon name={it.icon} size={16} />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function WebTopbar({ crumb, onEdit }) {
  const crumbs = crumb || ["출장", window.TRIP_DATA.TRIP.title];
  return (
    <div className="topbar">
      <div className="brand"><span className="dot" />Trip Planner</div>
      <div style={{ width: 1, height: 20, background: "var(--divider-20)" }} />
      <div className="crumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <LIcon name="chevron-right" size={14} />}
            <span style={i === crumbs.length - 1 ? { color: "var(--on-surface-neutral-90)", fontWeight: 600 } : null}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <button className="adot-btn line" style={{ height: 34, padding: "0 14px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <LIcon name="share-2" size={14} />공유 링크
        </button>
        <button className="adot-btn primary" style={{ height: 34, padding: "0 14px", fontSize: 13 }} onClick={onEdit}>편집</button>
        <div className="avatar sm" style={{ background: "var(--surface-neutral-80)", color: "#fff" }}>나</div>
      </div>
    </div>
  );
}

function WebDashboard({ accent = "mono", onDataChanged }) {
  const { TRIP, PEOPLE, FLIGHTS, HOTEL, DAYS, SCHEDULE, MEETINGS, EVENTS } = window.TRIP_DATA;
  const totalEvents = Object.keys(EVENTS).length;
  const totalMeetings = Object.keys(MEETINGS).length;
  const totalRoutes = window.TRIP_DATA.ROUTES.length;
  const [editor, setEditor] = useState(null);
  const openEditor = (entity, item, title, defaults) => setEditor({ entity, item, title, defaults });

  return (
    <div className={`web-frame accent-${accent}`}>
      <WebTopbar onEdit={() => openEditor("trip", TRIP, "출장 개요 수정")} />
      <div className="layout">
        <WebSidebar active="dashboard" />
        <div className="content">
          {/* Title block */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <StatusChip status={TRIP.status} />
                <span className="tone-chip tone-neutral">6/1–6/4</span>
                <span style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                  최근 수정 12분 전 · 나
                </span>
              </div>
              <div className="h1">{TRIP.title}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 14, alignItems: "center", color: "var(--on-surface-neutral-60)", font: "500 13px/18px var(--font-pretendard)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <LIcon name="map-pin" size={14} />{TRIP.country} · {TRIP.city}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <LIcon name="calendar" size={14} />{TRIP.startDate} ~ {TRIP.endDate} (3박 4일)
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <LIcon name="globe" size={14} />{TRIP.localTz} (GMT+8)
                </span>
              </div>
              <div style={{ marginTop: 8, font: "400 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-60)" }}>
                {TRIP.purpose}
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            {[
              { lbl: "참석자",  val: PEOPLE.length, sub: `임원 ${PEOPLE.filter(p => p.type === "executive").length} · 구성원 ${PEOPLE.filter(p => p.type === "member").length}` },
              { lbl: "Day",     val: DAYS.length, sub: `${TRIP.startDate.slice(5)} → ${TRIP.endDate.slice(5)}` },
              { lbl: "일정",    val: SCHEDULE.length, sub: `미팅 ${totalMeetings} · 행사 ${totalEvents}` },
              { lbl: "이동 구간", val: totalRoutes, sub: "Day 2 기준" },
              { lbl: "항공편",   val: FLIGHTS.length, sub: FLIGHTS.map(f => f.flightNumber).join(" / ") },
              { lbl: "호텔",     val: 1, sub: HOTEL.name },
            ].map((s, i) => (
              <div key={i} className="card stat" style={{ padding: 16 }}>
                <div className="lbl">{s.lbl}</div>
                <div className="val">{s.val}</div>
                <div className="sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Two-col main */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, minHeight: 0, flex: 1 }}>
            {/* Left — Days at a glance */}
            <div className="card flush" style={{ display: "flex", flexDirection: "column" }}>
              <div className="ch">
                <LIcon name="calendar-days" size={16} />
                <span>Day별 일정 한눈에</span>
                <span style={{ marginLeft: "auto", font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                  현지 시간 기준 ({TRIP.localTz})
                </span>
              </div>
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                {DAYS.map(d => {
                  const items = window.TD.getDayItems(d.date);
                  const meetings = items.filter(i => i.type === "meeting").length;
                  const events = items.filter(i => i.type === "event").length;
                  return (
                    <div key={d.date} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 64, flexShrink: 0 }}>
                        <div style={{ font: "700 18px/22px var(--font-pretendard)" }}>{d.label}</div>
                        <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>
                          {d.date.slice(5).replace("-", "/")} ({d.weekday})
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "600 14px/18px var(--font-pretendard)" }}>{d.title}</div>
                        <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {items.slice(0, 8).map(it => (
                            <button key={it.id} className={`tone-chip tone-${window.TD.typeMeta[it.type].tone} chip-button`} style={{ height: 20 }} onClick={() => openEditor("schedule", it, "일정 수정")}>
                              <span style={{ fontVariantNumeric: "tabular-nums" }}>{it.start}</span>
                              <span style={{ opacity: 0.7, marginLeft: 4 }}>{it.title.length > 14 ? it.title.slice(0, 14) + "…" : it.title}</span>
                            </button>
                          ))}
                        </div>
                        <div style={{ marginTop: 6, font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                          {items.length}개 일정 · 미팅 {meetings} · 행사 {events}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Participants + Logistics */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
              <div className="card flush">
                <div className="ch">
                  <LIcon name="users" size={16} />
                  <span>참석자</span>
                  <span style={{ marginLeft: "auto", font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                    총 {PEOPLE.length}명
                  </span>
                  <button className="icon-btn mini" onClick={() => openEditor("people", null, "참석자 추가")}>
                    <LIcon name="plus" size={13} />
                  </button>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {PEOPLE.map(p => {
                    const myItems = SCHEDULE.filter(s => s.attendees.includes(p.id) && s.type === "meeting").length;
                    return (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px" }}>
                        <Avatar person={p} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ font: "600 13px/16px var(--font-pretendard)" }}>{p.name} <span style={{ fontWeight: 500, color: "var(--on-surface-neutral-50)" }}>· {p.role}</span></div>
                          <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                            {p.type === "executive" ? "임원" : "구성원"} · 미팅 {myItems}건
                          </div>
                        </div>
                        <button className="icon-btn mini" onClick={() => openEditor("people", p, "참석자 수정")}>
                          <LIcon name="pencil" size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card flush">
                <div className="ch">
                  <LIcon name="plane" size={16} />
                  <span>항공 · 호텔</span>
                </div>
                <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {FLIGHTS.map(f => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-neutral-10)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <LIcon name={f.type === "outbound" ? "plane-takeoff" : "plane-landing"} size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "600 13px/16px var(--font-pretendard)" }}>{f.airline} {f.flightNumber}</div>
                        <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", fontVariantNumeric: "tabular-nums" }}>
                          {f.dep.airport} {f.dep.time.slice(5).replace("-", "/")} {f.dep.time.slice(11)} → {f.arr.airport} {f.arr.time.slice(11)}
                        </div>
                      </div>
                      <span className="tone-chip tone-neutral">{f.passengers.length}명</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--divider-10)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-neutral-10)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <LIcon name="bed-double" size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: "600 13px/16px var(--font-pretendard)" }}>{HOTEL.name}</div>
                      <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                        {HOTEL.checkin.slice(5)} → {HOTEL.checkout} · 3박
                      </div>
                    </div>
                    <span className="tone-chip tone-neutral">{HOTEL.guests.length}객실</span>
                  </div>
                </div>
              </div>

              <div className="card flush">
                <div className="ch">
                  <LIcon name="ticket" size={16} />
                  <span>행사</span>
                  <button className="icon-btn mini" style={{ marginLeft: "auto" }} onClick={() => openEditor("events", null, "행사 추가")}>
                    <LIcon name="plus" size={13} />
                  </button>
                </div>
                <div style={{ padding: "12px 18px" }}>
                  {Object.entries(EVENTS).map(([id, e]) => (
                    <div key={id} className="editable-row">
                      <div style={{ font: "600 13px/16px var(--font-pretendard)" }}>{e.name}</div>
                      <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>
                        {e.host} · {e.start.slice(5).replace("-", "/")} – {e.end.slice(5).replace("-", "/")} · 세션 {e.sessions.length}
                      </div>
                      <div style={{ marginTop: 6, font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-60)" }}>
                        Dress: {e.dressCode}
                      </div>
                      <button className="icon-btn mini" onClick={() => openEditor("events", { id, ...e }, "행사 수정")}>
                        <LIcon name="pencil" size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {editor && (
        <WebEntityEditor
          entity={editor.entity}
          item={editor.item}
          title={editor.title}
          defaults={editor.defaults}
          allowDelete={editor.entity !== "trip"}
          onClose={() => setEditor(null)}
          onSaved={onDataChanged}
        />
      )}
    </div>
  );
}

Object.assign(window, { WebDashboard, WebSidebar, WebTopbar });
