// Web admin — Day route management screen

function RouteModeChip({ mode }) {
  const map = {
    driving: ["car", "차량"],
    walking: ["footprints", "도보"],
    transit: ["train", "대중교통"],
  };
  const [icon, label] = map[mode] || map.driving;
  return (
    <span className="tone-chip tone-sky" style={{ gap: 5 }}>
      <LIcon name={icon} size={11} />{label}
    </span>
  );
}

function RouteList({ date, personFilter }) {
  const routes = window.TD.getRoutesForDay(date, personFilter);
  if (!routes.length) {
    return (
      <div style={{ padding: 28, textAlign: "center", color: "var(--on-surface-neutral-50)", font: "500 13px/18px var(--font-pretendard)" }}>
        이 조건에서는 장소가 바뀌는 이동 구간이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {routes.map((route, idx) => {
        const from = window.TD.getPlace(route.from);
        const to = window.TD.getPlace(route.to);
        const fromSched = window.TRIP_DATA.SCHEDULE.find(s => s.id === route.fromSched);
        const toSched = window.TRIP_DATA.SCHEDULE.find(s => s.id === route.toSched);
        return (
          <div key={`${route.fromSched}-${route.toSched}`} className="route-row">
            <div className="route-index">{idx + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ font: "700 14px/18px var(--font-pretendard)" }}>{from?.name}</div>
                <LIcon name="arrow-right" size={14} color="var(--on-surface-neutral-40)" />
                <div style={{ font: "700 14px/18px var(--font-pretendard)" }}>{to?.name}</div>
                {route.inferred && <span className="tone-chip tone-neutral">로컬 추정</span>}
              </div>
              <div style={{ marginTop: 5, font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                {fromSched?.end || fromSched?.start} {fromSched?.title} 종료 후 → {toSched?.start} {toSched?.title}
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <RouteModeChip mode={route.mode} />
                <span className="route-metric">{route.durationMin}분</span>
                <span className="route-metric">{route.distance}km</span>
                <span className="route-metric">버퍼 {route.bufferMin}분</span>
                <span className="route-depart">권장 출발 {route.dep}</span>
              </div>
            </div>
            <div style={{ width: 176, display: "flex", gap: 8, flexShrink: 0 }}>
              <button className="adot-btn line" style={{ height: 32, padding: "0 10px", fontSize: 12, flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <LIcon name="map" size={12} />지도
              </button>
              <button className="adot-btn line" style={{ height: 32, padding: "0 10px", fontSize: 12, flex: 1 }}>수정</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WebRoutes({ day = "2026-06-11", accent = "mono" }) {
  const [date, setDate] = useState(day);
  const [filter, setFilter] = useState("all");
  useEffect(() => { setDate(day); }, [day]);

  const { DAYS, PEOPLE } = window.TRIP_DATA;
  const routes = window.TD.getRoutesForDay(date, filter);
  const totalMin = routes.reduce((sum, r) => sum + r.durationMin, 0);
  const totalKm = routes.reduce((sum, r) => sum + Number(r.distance || 0), 0);

  return (
    <div className={`web-frame accent-${accent}`}>
      <WebTopbar crumb={["출장", window.TRIP_DATA.TRIP.title, "이동 동선"]} />
      <div className="layout">
        <WebSidebar active="routes" />
        <div className="content">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <div>
              <div className="h1">Day별 이동 동선</div>
              <div style={{ font: "500 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 4 }}>
                장소가 바뀌는 일정 사이의 이동 시간과 권장 출발 시간을 확인
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="adot-btn line" style={{ height: 34, padding: "0 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <LIcon name="map" size={14} />전체 지도 열기
              </button>
              <button className="adot-btn primary" style={{ height: 34, padding: "0 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <LIcon name="refresh-cw" size={14} />다시 계산
              </button>
            </div>
          </div>

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
                <span style={{ opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>{d.date.slice(5).replace("-", "/")}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.45fr", gap: 16, minHeight: 0, flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
              <div className="card flush">
                <div className="ch">
                  <LIcon name="users" size={16} />
                  <span>참석자별 동선</span>
                </div>
                <div className="cb">
                  <PersonFilterChips filter={filter} onChange={setFilter} />
                  <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    <div className="mini-stat"><b>{routes.length}</b><span>구간</span></div>
                    <div className="mini-stat"><b>{totalMin}</b><span>분</span></div>
                    <div className="mini-stat"><b>{totalKm.toFixed(1)}</b><span>km</span></div>
                  </div>
                </div>
              </div>

              <div className="map-tile lg" style={{ flex: 1, minHeight: 330 }}>
                <div className="road" style={{ top: "24%", left: "12%", right: "8%", transform: "rotate(-5deg)" }} />
                <div className="road" style={{ top: "49%", left: "8%", right: "18%", transform: "rotate(7deg)" }} />
                <div className="road" style={{ top: "72%", left: "18%", right: "12%", transform: "rotate(-3deg)" }} />
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <polyline points="24,20 50,28 68,44 32,65 62,78" fill="none" stroke="#0052FF" strokeWidth="0.7" strokeDasharray="2 1.5" opacity="0.72" />
                </svg>
                {routes.slice(0, 5).map((r, idx) => {
                  const coords = [[24,20], [50,28], [68,44], [32,65], [62,78]][idx] || [50,50];
                  return (
                    <div key={idx} className={`pin ${idx > 0 ? "alt" : ""}`} style={{ left: `${coords[0]}%`, top: `${coords[1]}%` }}>
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card flush" style={{ overflow: "hidden", minHeight: 0 }}>
              <div className="ch">
                <LIcon name="route" size={16} />
                <span>이동 구간 목록</span>
                <span style={{ marginLeft: "auto", font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                  {filter === "all" ? "전체 일정" : PEOPLE.find(p => p.id === filter)?.name}
                </span>
              </div>
              <RouteList date={date} personFilter={filter} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WebRoutes, RouteList, RouteModeChip });
