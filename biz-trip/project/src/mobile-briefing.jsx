// Mobile share — Pre-trip briefing (full trip overview at a glance)

function MobileBriefing({ personId = "p-ceo", onOpenDays, onOpenMeetings, onOpenMeeting }) {
  const { TRIP, HOTEL, FLIGHTS, DAYS, SCHEDULE, MEETINGS } = window.TRIP_DATA;
  const person = window.TD.getPerson(personId);
  const passengerMatches = (entry) => entry === personId || entry?.personId === personId;
  const myFlights = FLIGHTS.filter(f => (f.passengers || []).some(passengerMatches));
  const flights = myFlights.length ? myFlights : FLIGHTS;
  const myHotel = (HOTEL.guests || []).find(passengerMatches);
  const meetingCount = SCHEDULE.filter(item => item.type === "meeting" && (item.attendees || []).includes(personId)).length;
  const keyMeetings = Object.entries(MEETINGS).map(([id, meeting]) => {
    const sched = SCHEDULE.find(item => item.meetingId === id);
    return { id, meeting, sched };
  }).filter(row => row.sched && (row.sched.attendees || []).includes(personId)).slice(0, 3);

  return (
    <div className="m-screen">
      <div className="m-header" style={{ paddingBottom: 18, background: "var(--bg-00)" }}>
        <div className="m-h-eyebrow">
          <LIcon name="briefcase" size={12} />
          <span>출장 브리핑</span>
          <span style={{ marginLeft: "auto", color: "var(--blue-700)", textTransform: "none", letterSpacing: 0 }}>6/1–6/4</span>
        </div>
        <div className="m-h-title">{TRIP.title}</div>
        <div className="m-h-sub">
          <LIcon name="map-pin" size={12} />
          <span>{TRIP.city}, {TRIP.country}</span>
          <span className="tick-dot" />
          <span>{TRIP.startDate.slice(5).replace("-", "/")} ~ {TRIP.endDate.slice(5).replace("-", "/")}</span>
        </div>
        <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "var(--surface-neutral-10)", display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar person={person} size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "600 14px/18px var(--font-pretendard)" }}>{person.name} · {person.role}</div>
            <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>
              본인 일정만 표시 · 모바일 공유 링크
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <div className="m-brief-stat"><b>{DAYS.length}</b><span>일</span></div>
          <div className="m-brief-stat"><b>{meetingCount}</b><span>미팅</span></div>
          <div className="m-brief-stat"><b>{flights.length}</b><span>항공</span></div>
        </div>
      </div>

      {/* Outbound flight card */}
      <div className="m-section">출국 항공편</div>
      {flights.filter(f => f.type === "outbound").map(f => {
        const seat = (f.passengers || []).find(passengerMatches)?.seat || "확인 필요";
        return (
          <div key={f.id} className="m-card">
            <div className="m-card-pad" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface-neutral-10)", display: "grid", placeItems: "center" }}>
                <LIcon name="plane-takeoff" size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "600 14px/18px var(--font-pretendard)" }}>{f.airline} {f.flightNumber}</div>
                <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>좌석 {seat} · 6h 30m</div>
              </div>
              <span className="tone-chip tone-neutral">예약 {f.bookingRef}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--divider-10)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ font: "700 22px/26px var(--font-pretendard)", fontVariantNumeric: "tabular-nums" }}>{f.dep.time.slice(11)}</div>
                <div style={{ font: "600 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-60)" }}>{f.dep.airport}</div>
                <div style={{ font: "500 10px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>{f.dep.city}</div>
                {f.dep?.mapUrl && <button type="button" onClick={() => window.openMapUrl(f.dep.mapUrl, f.dep.airport)} style={{ marginTop: 6, padding: 0, border: 0, background: "transparent", color: "var(--blue-700)", font: "600 11px/14px var(--font-pretendard)" }}>지도 열기</button>}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ font: "500 10px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", fontVariantNumeric: "tabular-nums" }}>
                  {f.dep.time.slice(5, 10).replace("-", "/")} ({window.TRIP_DATA.DAYS.find(d => d.date === f.dep.time.slice(0, 10))?.weekday})
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, width: "100%" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 9999, background: "var(--on-surface-neutral-100)" }} />
                  <span style={{ flex: 1, height: 1, background: "var(--surface-neutral-30)" }} />
                  <LIcon name="plane" size={14} color="var(--on-surface-neutral-80)" />
                  <span style={{ flex: 1, height: 1, background: "var(--surface-neutral-30)" }} />
                  <span style={{ width: 6, height: 6, borderRadius: 9999, background: "var(--on-surface-neutral-100)" }} />
                </div>
                <div style={{ font: "500 10px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>직항</div>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ font: "700 22px/26px var(--font-pretendard)", fontVariantNumeric: "tabular-nums" }}>{f.arr.time.slice(11)}</div>
                <div style={{ font: "600 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-60)" }}>{f.arr.airport}</div>
                <div style={{ font: "500 10px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>{f.arr.city}</div>
                {f.arr?.mapUrl && <button type="button" onClick={() => window.openMapUrl(f.arr.mapUrl, f.arr.airport)} style={{ marginTop: 6, padding: 0, border: 0, background: "transparent", color: "var(--blue-700)", font: "600 11px/14px var(--font-pretendard)" }}>지도 열기</button>}
              </div>
            </div>
          </div>
        );
      })}

      {/* Hotel */}
      <div className="m-section">호텔</div>
      <div className="m-card">
        <div className="m-card-pad">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface-neutral-10)", display: "grid", placeItems: "center" }}>
              <LIcon name="bed-double" size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: "600 15px/20px var(--font-pretendard)" }}>{HOTEL.name}</div>
              <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>
                {HOTEL.address}
              </div>
              {HOTEL.locationNote && <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-60)", marginTop: 4 }}>{HOTEL.locationNote}</div>}
            </div>
          </div>
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ padding: 10, background: "var(--surface-neutral-10)", borderRadius: 8 }}>
              <div style={{ font: "500 10px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", textTransform: "uppercase", letterSpacing: 0.04 }}>체크인</div>
              <div style={{ font: "600 13px/16px var(--font-pretendard)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{HOTEL.checkin.slice(5)}</div>
            </div>
            <div style={{ padding: 10, background: "var(--surface-neutral-10)", borderRadius: 8 }}>
              <div style={{ font: "500 10px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", textTransform: "uppercase", letterSpacing: 0.04 }}>체크아웃</div>
              <div style={{ font: "600 13px/16px var(--font-pretendard)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{HOTEL.checkout.replace("2026-", "")}</div>
            </div>
          </div>
          {myHotel && (
            <div style={{ marginTop: 8, padding: "8px 10px", background: "var(--bg-oat-10)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <LIcon name="key-round" size={14} color="var(--oatmeal-800)" />
              <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--oatmeal-800)" }}>
                {myHotel.room} · #{myHotel.roomNo}
              </div>
            </div>
          )}
          {HOTEL.mapUrl && <button type="button" onClick={() => window.openMapUrl(HOTEL.mapUrl, HOTEL.name)} style={{ marginTop: 10, padding: 0, border: 0, background: "transparent", color: "var(--blue-700)", font: "600 12px/16px var(--font-pretendard)" }}>Google Maps에서 열기</button>}
        </div>
      </div>

      <div className="m-section">핵심 미팅</div>
      <div className="m-card">
        <div style={{ padding: "4px 0" }}>
          {keyMeetings.map(({ id, meeting, sched }, idx) => (
            <button key={id} type="button" onClick={() => onOpenMeeting?.(id)} style={{
              width: "100%",
              border: 0,
              background: "transparent",
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 16px",
              borderBottom: idx < keyMeetings.length - 1 ? "1px solid var(--divider-10)" : 0,
              textAlign: "left",
            }}>
              <div style={{ width: 54, flexShrink: 0, font: "700 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-80)", fontVariantNumeric: "tabular-nums" }}>
                {sched.date.slice(5).replace("-", "/")}<br />{sched.start}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "700 13px/17px var(--font-pretendard)" }}>{meeting.name}</div>
                <div style={{ marginTop: 2, font: "600 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                  {meeting.counterpart || "상대 미정"}
                </div>
              </div>
              <LIcon name="chevron-right" size={15} color="var(--icon-dim)" />
            </button>
          ))}
        </div>
      </div>

      {/* Day summary */}
      <div className="m-section">일자별 요약</div>
      <div className="m-card">
        <div style={{ padding: "4px 0" }}>
          {DAYS.map((d, idx) => {
            const items = window.TD.getPersonItems(d.date, personId);
            const meetings = items.filter(i => i.type === "meeting").length;
            return (
              <div key={d.date} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderBottom: idx < DAYS.length - 1 ? "1px solid var(--divider-10)" : 0,
              }}>
                <div style={{ width: 38, flexShrink: 0 }}>
                  <div style={{ font: "700 16px/20px var(--font-pretendard)" }}>{d.label}</div>
                  <div style={{ font: "500 10px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", fontVariantNumeric: "tabular-nums" }}>
                    {d.date.slice(5).replace("-", "/")}({d.weekday})
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 13px/16px var(--font-pretendard)" }}>{d.title}</div>
                  <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>
                    {items.length === 0 ? "일정 없음" : `${items.length}건 · 미팅 ${meetings}`}
                  </div>
                </div>
                <LIcon name="chevron-right" size={16} color="var(--icon-dim)" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: "16px 18px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
        <button type="button" className="m-cta full" onClick={onOpenDays}><LIcon name="calendar-days" size={14} color="#fff" />Day별 일정 보기</button>
        <button type="button" className="m-cta line full" onClick={onOpenMeetings}>미팅 브리핑 보기</button>
      </div>
    </div>
  );
}

Object.assign(window, { MobileBriefing });
