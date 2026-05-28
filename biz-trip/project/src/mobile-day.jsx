// Mobile share — Day detail with route segments inline

function MobileDay({ personId = "p-ceo", date = "2026-06-11", onChangeDay }) {
  const items = window.TD.getPersonItems(date, personId);
  const person = window.TD.getPerson(personId);
  const day = window.TRIP_DATA.DAYS.find(d => d.date === date);
  const allDays = window.TRIP_DATA.DAYS;
  const placeStops = items
    .map(item => item.placeId ? window.TD.getPlace(item.placeId) : null)
    .filter(Boolean)
    .filter((place, idx, arr) => idx === 0 || place.id !== arr[idx - 1].id);
  const knownPlaceStops = placeStops.filter(place => place.id !== "pl-unknown");
  const firstPlace = knownPlaceStops[0];
  const lastPlace = knownPlaceStops[knownPlaceStops.length - 1];
  const explicitRoutes = window.TD.getRoutesForDay(date, personId).filter(route => !route.inferred);

  return (
    <div className="m-screen">
      <div className="m-header">
        <div className="m-h-eyebrow">
          <LIcon name="calendar-days" size={12} />
          <span>일정</span>
          <span style={{ marginLeft: "auto", color: "var(--on-surface-neutral-50)", textTransform: "none", letterSpacing: 0 }}>{person.name}</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ font: "700 24px/30px var(--font-pretendard)", letterSpacing: "-0.02em" }}>
            {day?.label} <span style={{ font: "500 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>· {day?.title}</span>
          </div>
          <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>
            {date.replace(/-/g, ".")} ({day?.weekday}) · 일정 {items.length}건
          </div>
        </div>
        <div className="m-day-tabs">
          {allDays.map(d => (
            <button
              key={d.date}
              type="button"
              className={d.date === date ? "active" : ""}
              onClick={() => onChangeDay?.(d.date)}
            >
              <b>{d.label.replace("Day ", "D")}</b>
              <span>{d.date.slice(5).replace("-", "/")}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 18px 0" }}>
        <div className="m-card" style={{ margin: 0 }}>
          <div className="m-card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface-neutral-10)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <LIcon name="route" size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "700 14px/18px var(--font-pretendard)" }}>동선 요약</div>
                <div style={{ marginTop: 2, font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                  {firstPlace && lastPlace ? `${firstPlace.name} → ${lastPlace.name}` : "장소 정보 확인 필요"}
                </div>
              </div>
              <span className="tone-chip tone-neutral">{knownPlaceStops.length}개 장소</span>
            </div>
            {knownPlaceStops.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
                {knownPlaceStops.map((place, idx) => (
                  <button key={`${place.id}-${idx}`} type="button" onClick={() => window.openMapUrl(place.mapUrl, place.name)} style={{ flexShrink: 0, height: 30, padding: "0 10px", border: "1px solid var(--divider-10)", borderRadius: 8, background: "var(--bg-00)", font: "700 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-70)" }}>
                    {idx + 1}. {place.name}
                  </button>
                ))}
              </div>
            )}
            {explicitRoutes.length > 0 && (
              <div style={{ marginTop: 10, font: "500 11px/15px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                이동시간 {explicitRoutes.length}건 입력됨 · 일정 사이에 표시
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline with route segments */}
      <div className="m-section">시간순 일정</div>
      <div style={{ padding: "0 18px 20px" }}>
        {items.map((it, idx) => {
          const place = it.placeId ? window.TD.getPlace(it.placeId) : null;
          const next = items[idx + 1];
          const route = next ? window.routeBetween(date, it.id, next.id) : null;
          const visibleRoute = route && !route.inferred ? route : null;
          return (
            <React.Fragment key={it.id}>
              <div className="m-card" style={{ margin: 0, marginBottom: visibleRoute ? 0 : 10 }}>
                <div className="m-card-pad">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ font: "700 13px/16px var(--font-pretendard)", fontVariantNumeric: "tabular-nums" }}>
                      {it.start} – {it.end}
                    </span>
                    <TypeChip type={it.type} />
                  </div>
                  <div style={{ font: "600 15px/20px var(--font-pretendard)" }}>{it.title}</div>
                  {place && (
                    <button type="button" onClick={() => window.openMapUrl(place.mapUrl, `${place.name} ${it.placeNote || ""}`)} style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-60)", marginTop: 4, display: "flex", alignItems: "center", gap: 4, padding: 0, border: 0, background: "transparent", cursor: place.mapUrl ? "pointer" : "default" }}>
                      <LIcon name="map-pin" size={12} color="var(--on-surface-neutral-50)" />
                      {place.name}
                    </button>
                  )}
                  {it.placeNote && (
                    <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-60)", marginTop: 4 }}>
                      {it.placeNote}
                    </div>
                  )}
                  <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 4 }}>{it.desc}</div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <AvatarStack ids={it.attendees} size="sm" max={5} />
                    {it.type === "meeting" && (
                      <span style={{ font: "600 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-90)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        토킹 포인트
                        <LIcon name="chevron-right" size={14} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {visibleRoute && (
                <div style={{
                  margin: "0 0 10px",
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px",
                  background: "transparent",
                  position: "relative",
                }}>
                  <div style={{ width: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 2, height: 12, background: "var(--surface-neutral-30)" }} />
                    <div style={{
                      width: 24, height: 24, borderRadius: 9999, background: "var(--bg-oat-10)",
                      display: "grid", placeItems: "center", border: "1px solid var(--oatmeal-200)",
                    }}>
                      <LIcon name="car" size={12} color="var(--oatmeal-800)" />
                    </div>
                    <div style={{ width: 2, height: 12, background: "var(--surface-neutral-30)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: "600 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-80)" }}>
                      이동 {visibleRoute.durationMin}분 · {visibleRoute.distance}km
                    </div>
                    <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--blue-700)", marginTop: 2 }}>
                      권장 출발 {visibleRoute.dep} (버퍼 {visibleRoute.bufferMin}분)
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { MobileDay });
