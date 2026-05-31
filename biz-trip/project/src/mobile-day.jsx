// Mobile share — Day detail with route segments inline

function MobileDay({ personId = "p-roy", date = "2026-06-11", onChangeDay, onOpenMeeting }) {
  const rawItems = window.TD.getPersonItems(date, personId);
  const person = window.TD.getPerson(personId);
  const day = window.TRIP_DATA.DAYS.find(d => d.date === date);
  const allDays = window.TRIP_DATA.DAYS;
  const hotelPlaceId = "pl-caesar";
  const hotelPlace = window.TD.getPlace(hotelPlaceId);
  const localItems = rawItems.filter(item => item.type !== "flight" && item.placeId !== "pl-icn" && item.placeId !== "pl-tpe");
  const firstLocal = localItems[0];
  const lastLocal = localItems[localItems.length - 1];
  const hotelStart = firstLocal ? window.minToHHMM(Math.max(0, window.hhmmToMin(firstLocal.start) - 30)) : "11:00";
  const hotelEnd = lastLocal ? window.minToHHMM(window.hhmmToMin(lastLocal.end || lastLocal.start) + 30) : "12:00";
  const startAnchor = firstLocal?.placeId === hotelPlaceId ? [] : [{
    id: `hotel-start-${date}`,
    date,
    start: hotelStart,
    end: firstLocal ? firstLocal.start : "12:00",
    type: "hotel",
    title: firstLocal ? "호텔 출발" : "호텔 체크아웃",
    placeId: hotelPlaceId,
    attendees: [personId],
    desc: hotelPlace?.name || "호텔",
    synthetic: true,
  }];
  const endAnchor = lastLocal?.placeId === hotelPlaceId ? [] : [{
    id: `hotel-end-${date}`,
    date,
    start: lastLocal ? lastLocal.end : "12:00",
    end: hotelEnd,
    type: "hotel",
    title: lastLocal ? "호텔 복귀" : "호텔 대기",
    placeId: hotelPlaceId,
    attendees: [personId],
    desc: hotelPlace?.name || "호텔",
    synthetic: true,
  }];
  const items = [...startAnchor, ...localItems, ...endAnchor];
  const placeStops = items
    .map(item => item.placeId ? window.TD.getPlace(item.placeId) : null)
    .filter(Boolean)
    .filter((place, idx, arr) => idx === 0 || place.id !== arr[idx - 1].id);
  const knownPlaceStops = placeStops.filter(place => place.id !== "pl-unknown");
  const firstPlace = knownPlaceStops[0];
  const lastPlace = knownPlaceStops[knownPlaceStops.length - 1];

  return (
    <div className="m-screen">
      <div className="m-header m-day-sticky">
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
            {date.replace(/-/g, ".")} ({day?.weekday}) · 현지 일정 {localItems.length}건
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
              <div className="m-place-strip">
                {knownPlaceStops.map((place, idx) => (
                  <button key={`${place.id}-${idx}`} type="button" onClick={() => window.openMapUrl(place.mapUrl, place.name)}>
                    <span>{idx + 1}</span>
                    <b>{place.name}</b>
                    <LIcon name="map" size={12} />
                  </button>
                ))}
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
          return (
            <React.Fragment key={it.id}>
              <div className={`m-card ${it.synthetic ? "m-hotel-anchor" : ""} ${it.type === "meeting" ? "m-meeting-schedule-card" : ""}`} style={{ margin: 0, marginBottom: 10 }}>
                <div className="m-card-pad">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ font: "700 13px/16px var(--font-pretendard)", fontVariantNumeric: "tabular-nums" }}>
                      {it.start} – {it.end}
                    </span>
                    <TypeChip type={it.type} />
                  </div>
                  <div style={{ font: "600 15px/20px var(--font-pretendard)" }}>{it.title}</div>
                  {place && (
                    <button type="button" className="m-map-link" onClick={() => window.openMapUrl(place.mapUrl, `${place.name} ${it.placeNote || ""}`)}>
                      <span>
                        <LIcon name="map-pin" size={13} />
                        <b>{place.name}</b>
                      </span>
                      <em>지도 열기</em>
                      <LIcon name="external-link" size={12} />
                    </button>
                  )}
                  {it.placeNote && (
                    <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-60)", marginTop: 4 }}>
                      {it.placeNote}
                    </div>
                  )}
                  {!it.synthetic && <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 4 }}>{it.desc}</div>}
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <AvatarStack ids={it.attendees} size="sm" max={5} />
                    {it.type === "meeting" && it.meetingId && (
                      <button type="button" onClick={() => onOpenMeeting?.(it.meetingId)} style={{ border: 0, background: "transparent", padding: 0, font: "600 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-90)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        토킹 포인트
                        <LIcon name="chevron-right" size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { MobileDay });
