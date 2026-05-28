// Mobile share — "Today" screen (on-the-go view)
// Hero card: NEXT-UP item with route + recommended departure
// Then full timeline of today

function MobileToday({ personId = "p-ceo", date = "2026-06-11", nowHHMM = "10:42" }) {
  const items = window.TD.getPersonItems(date, personId);
  const person = window.TD.getPerson(personId);
  const day = window.TRIP_DATA.DAYS.find(d => d.date === date);

  const current = window.currentFor(date, personId, nowHHMM);
  const next = window.nextUpFor(date, personId, nowHHMM);
  const past = items.filter(i => (i.end || i.start) <= nowHHMM);
  const upcoming = items.filter(i => i.start > nowHHMM);

  // Find the route segment leading TO the next item (if any prior item exists)
  let nextRoute = null;
  if (next) {
    const prev = items[items.findIndex(i => i.id === next.id) - 1];
    if (prev) nextRoute = window.routeBetween(date, prev.id, next.id);
  }

  const heroItem = next || current;
  const heroPlace = heroItem?.placeId ? window.TD.getPlace(heroItem.placeId) : null;

  return (
    <div className="m-screen">
      {/* Header */}
      <div className="m-header">
        <div className="m-h-eyebrow">
          <Avatar person={person} size="sm" />
          <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--on-surface-neutral-80)", fontWeight: 600 }}>{person.name}</span>
          <span style={{ marginLeft: "auto", color: "var(--on-surface-neutral-50)" }}>현재 {nowHHMM} · GMT+8</span>
        </div>
        <div className="m-h-title" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          오늘
          <span style={{ font: "500 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
            {day?.label} · {date.slice(5).replace("-", "/")} ({day?.weekday})
          </span>
        </div>
        <div className="m-h-sub" style={{ marginTop: 6 }}>
          <span>{day?.title}</span>
          <span className="tick-dot" />
          <span>일정 {items.length}건 · 완료 {past.length}</span>
        </div>
      </div>

      {/* Hero: NEXT UP */}
      {heroItem && (
        <div style={{ padding: "14px 18px 6px" }}>
          <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", letterSpacing: 0.04, textTransform: "uppercase", marginBottom: 8 }}>
            {current ? "지금 진행 중" : "다음 일정"}
          </div>
          <div className="m-card now" style={{ margin: 0 }}>
            <div className="m-card-pad">
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <TypeChip type={heroItem.type} />
                <span style={{ font: "600 13px/16px var(--font-pretendard)", fontVariantNumeric: "tabular-nums" }}>{heroItem.start} – {heroItem.end}</span>
                {nextRoute && (
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, font: "600 12px/16px var(--font-pretendard)", color: "var(--blue-700)" }}>
                    <LIcon name="clock" size={12} color="var(--blue-700)" />
                    출발 {nextRoute.dep}
                  </span>
                )}
              </div>
              <div style={{ font: "700 20px/26px var(--font-pretendard)", letterSpacing: "-0.02em" }}>{heroItem.title}</div>
              {heroPlace && (
                <div style={{ font: "500 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-60)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <LIcon name="map-pin" size={12} color="var(--on-surface-neutral-60)" />
                  {heroPlace.name}
                </div>
              )}
              {heroItem.placeNote && (
                <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-60)", marginTop: 4 }}>
                  {heroItem.placeNote}
                </div>
              )}
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <AvatarStack ids={heroItem.attendees} size="sm" max={4} />
                <span style={{ font: "500 12px/22px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                  {heroItem.attendees.map(id => window.TD.getPerson(id)?.role || "").filter(Boolean).slice(0, 3).join(", ")}
                </span>
              </div>

              {nextRoute && (
                <div style={{ marginTop: 12, padding: 12, background: "var(--bg-oat-10)", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, font: "500 11px/14px var(--font-pretendard)", color: "var(--oatmeal-800)", textTransform: "uppercase", letterSpacing: 0.04 }}>
                    <LIcon name="navigation" size={11} color="var(--oatmeal-800)" />
                    이동
                  </div>
                  <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 10 }}>
                    <div style={{ font: "700 18px/22px var(--font-pretendard)", color: "var(--oatmeal-900)", fontVariantNumeric: "tabular-nums" }}>
                      차량 {nextRoute.durationMin}분
                    </div>
                    <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--oatmeal-700)" }}>
                      {nextRoute.distance}km · 버퍼 {nextRoute.bufferMin}분
                    </div>
                  </div>
                  <div style={{ marginTop: 4, font: "500 12px/16px var(--font-pretendard)", color: "var(--oatmeal-800)" }}>
                    {window.TD.getPlace(nextRoute.from)?.name} → {window.TD.getPlace(nextRoute.to)?.name}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="m-cta sm" style={{ flex: 1, gap: 6 }}>
                  <LIcon name="map" size={14} color="#fff" />지도 열기
                </button>
                {heroItem.type === "meeting" && (
                  <button className="m-cta sm line" style={{ flex: 1, gap: 6 }}>
                    <LIcon name="megaphone" size={14} />토킹 포인트
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full day timeline */}
      <div className="m-section">
        <span>오늘 일정</span>
        <span className="m-section-act">전체 보기</span>
      </div>

      <div className="m-card">
        <div style={{ padding: "4px 0" }}>
          {items.map((it, idx) => {
            const isPast = (it.end || it.start) <= nowHHMM;
            const isNow = current?.id === it.id;
            const isNext = next?.id === it.id;
            const place = it.placeId ? window.TD.getPlace(it.placeId) : null;
            return (
              <div key={it.id} style={{
                display: "flex", gap: 12, padding: "12px 16px",
                borderBottom: idx < items.length - 1 ? "1px solid var(--divider-10)" : 0,
                opacity: isPast ? 0.45 : 1,
              }}>
                <div className="m-row-time">
                  {it.start}
                  <span className="end">{it.end}</span>
                </div>
                <div style={{ width: 14, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: 9999,
                    background: isNow ? "var(--blue-500)" : isPast ? "var(--surface-neutral-30)" : "var(--on-surface-neutral-100)",
                    boxShadow: isNext ? "0 0 0 4px rgba(0,0,0,0.08)" : "none",
                  }} />
                  {idx < items.length - 1 && (
                    <div style={{ flex: 1, width: 2, background: "var(--divider-20)", marginTop: 2 }} />
                  )}
                </div>
                <div className="m-row-body">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="m-row-title" style={{
                      textDecoration: isPast ? "line-through" : "none",
                      fontSize: isNow || isNext ? 15 : 14,
                    }}>
                      {it.title}
                    </div>
                    {isNow && <span className="tone-chip tone-blue">진행 중</span>}
                  </div>
                  <div className="m-row-meta">
                    <TypeChip type={it.type} />
                    {place && <span>{place.name}</span>}
                    {it.placeNote && <span>{it.placeNote}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}

Object.assign(window, { MobileToday });
