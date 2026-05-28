// Mobile share — Day detail with route segments inline + map

function MobileDay({ personId = "p-ceo", date = "2026-06-11" }) {
  const items = window.TD.getPersonItems(date, personId);
  const person = window.TD.getPerson(personId);
  const day = window.TRIP_DATA.DAYS.find(d => d.date === date);
  const allDays = window.TRIP_DATA.DAYS;

  return (
    <div className="m-screen">
      {/* Header */}
      <div className="m-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LIcon name="chevron-left" size={22} />
          <div style={{ flex: 1, textAlign: "center", font: "600 15px/18px var(--font-pretendard)" }}>{person.name} 일정</div>
          <LIcon name="share-2" size={18} />
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ font: "700 24px/30px var(--font-pretendard)", letterSpacing: "-0.02em" }}>
            {day?.label} <span style={{ font: "500 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>· {day?.title}</span>
          </div>
          <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>
            {date.replace(/-/g, ".")} ({day?.weekday}) · 일정 {items.length}건
          </div>
        </div>
        {/* Day pill chips */}
        <div style={{ marginTop: 12, display: "flex", gap: 6, overflowX: "auto" }}>
          {allDays.map(d => (
            <div key={d.date} className="tone-chip" style={{
              height: 28, padding: "0 12px", flexShrink: 0,
              background: d.date === date ? "var(--on-surface-neutral-100)" : "var(--surface-neutral-10)",
              color: d.date === date ? "#fff" : "var(--on-surface-neutral-80)",
              fontWeight: 600,
            }}>
              {d.label} · {d.date.slice(5).replace("-", "/")}
            </div>
          ))}
        </div>
      </div>

      {/* Today's mini-map */}
      <div style={{ padding: "14px 18px 0" }}>
        <div className="map-tile lg">
          {/* roads */}
          <div className="road" style={{ top: "30%", left: "15%", right: "10%", transform: "rotate(-6deg)" }} />
          <div className="road" style={{ top: "55%", left: "20%", right: "20%", transform: "rotate(4deg)" }} />
          <div className="road" style={{ top: "75%", left: "10%", right: "25%", transform: "rotate(-2deg)" }} />
          {/* numbered pins for route */}
          <div className="pin" style={{ top: "18%", left: "22%" }}>1</div>
          <div className="pin alt" style={{ top: "26%", left: "50%" }}>2</div>
          <div className="pin alt" style={{ top: "44%", left: "62%" }}>3</div>
          <div className="pin alt" style={{ top: "62%", left: "30%" }}>4</div>
          <div className="pin alt" style={{ top: "75%", left: "58%" }}>5</div>
          {/* path */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <polyline points="22,20 50,28 62,46 30,64 58,77" fill="none" stroke="#0052FF" strokeWidth="0.6" strokeDasharray="2 1.5" opacity="0.6" />
          </svg>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button className="m-cta line sm" style={{ flex: 1, gap: 6 }} onClick={() => {
            const first = items.find(it => it.placeId && window.TD.getPlace(it.placeId)?.mapUrl);
            if (first) {
              const place = window.TD.getPlace(first.placeId);
              window.openMapUrl(place?.mapUrl, `${place?.name || ""} ${first.placeNote || ""}`);
            }
          }}>
            <LIcon name="map" size={14} />Google Maps
          </button>
          <button className="m-cta line sm" style={{ flex: 1 }}>경로 공유</button>
        </div>
      </div>

      {/* Timeline with route segments */}
      <div className="m-section">시간순 일정</div>
      <div style={{ padding: "0 18px 20px" }}>
        {items.map((it, idx) => {
          const place = it.placeId ? window.TD.getPlace(it.placeId) : null;
          const next = items[idx + 1];
          const route = next ? window.routeBetween(date, it.id, next.id) : null;
          return (
            <React.Fragment key={it.id}>
              <div className="m-card" style={{ margin: 0, marginBottom: route ? 0 : 10 }}>
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
              {route && (
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
                      이동 {route.durationMin}분 · {route.distance}km
                    </div>
                    <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--blue-700)", marginTop: 2 }}>
                      권장 출발 {route.dep} (버퍼 {route.bufferMin}분)
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
