// Web admin — Trip list for the manager's first screen

function TripCard({ trip, active }) {
  const stats = window.TD.getTripStats(trip);
  const peoplePreview = window.TRIP_DATA.PEOPLE.slice(0, Math.min(stats.people, 4));

  return (
    <div className={`card trip-card ${active ? "active" : ""}`}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: active ? "var(--on-surface-neutral-100)" : "var(--surface-neutral-10)",
          color: active ? "#fff" : "var(--on-surface-neutral-90)",
          display: "grid", placeItems: "center",
        }}>
          <LIcon name={trip.country === "Korea" ? "building-2" : "plane"} size={19} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <StatusChip status={trip.status} />
            <span style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
              {trip.updatedAt} 수정
            </span>
          </div>
          <div style={{ font: "700 18px/23px var(--font-pretendard)", letterSpacing: "-0.01em" }}>{trip.title}</div>
          <div style={{ marginTop: 5, font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <LIcon name="map-pin" size={12} />{trip.country} · {trip.city}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <LIcon name="calendar" size={12} />{trip.startDate} ~ {trip.endDate}
            </span>
          </div>
          <div style={{ marginTop: 8, font: "400 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-60)" }}>
            {trip.purpose}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div className="mini-stat"><b>{stats.people}</b><span>참석자</span></div>
        <div className="mini-stat"><b>{stats.meetings}</b><span>미팅</span></div>
        <div className="mini-stat"><b>{stats.events}</b><span>행사</span></div>
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <AvatarStack ids={peoplePreview.map(p => p.id)} size="sm" max={4} />
        <span style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
          {trip.id === window.TRIP_DATA.TRIP.id ? "CEO, CFO, CTO, 전략팀장 외" : `${stats.people}명 참석 예정`}
        </span>
        <LIcon name="chevron-right" size={16} color="var(--icon-dim)" style={{ marginLeft: "auto" }} />
      </div>
    </div>
  );
}

function WebTripList({ accent = "mono" }) {
  const { TRIPS } = window.TRIP_DATA;
  const activeTrip = TRIPS[0];

  return (
    <div className={`web-frame accent-${accent}`}>
      <WebTopbar crumb={["출장"]} />
      <div className="layout">
        <WebSidebar active="dashboard" />
        <div className="content">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <div>
              <div className="h1">출장 목록</div>
              <div style={{ font: "500 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 4 }}>
                고정 일정 기반으로 바로 공유 가능한 출장 워크스페이스
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="adot-btn line" style={{ height: 34, padding: "0 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <LIcon name="upload" size={14} />JSON 가져오기
              </button>
              <button className="adot-btn primary" style={{ height: 34, padding: "0 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <LIcon name="plus" size={14} />출장 추가
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.85fr", gap: 16, minHeight: 0, flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignContent: "start" }}>
              {TRIPS.map((trip, idx) => (
                <TripCard key={trip.id} trip={trip} active={idx === 0} />
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card flush">
                <div className="ch">
                  <LIcon name="star" size={16} />
                  <span>다음 주 사용 준비</span>
                </div>
                <div className="cb" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    ["일정 데이터 확정", "data.js 기준으로 모든 화면 동기화"],
                    ["임원 공유 화면", "본인 일정만 필터링 · 읽기 전용"],
                    ["동선/출발 시간", "고정 계산값 + 누락 구간은 로컬 추정"],
                    ["DB 연결", "이번 사용 후 Supabase로 이관"],
                  ].map(([title, sub], i) => (
                    <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 9999, background: i < 3 ? "var(--blue-50)" : "var(--surface-neutral-10)", color: i < 3 ? "var(--blue-700)" : "var(--on-surface-neutral-50)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <LIcon name={i < 3 ? "check" : "clock"} size={13} />
                      </div>
                      <div>
                        <div style={{ font: "600 13px/16px var(--font-pretendard)" }}>{title}</div>
                        <div style={{ font: "500 11px/15px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card flush">
                <div className="ch">
                  <LIcon name="link" size={16} />
                  <span>공유 링크</span>
                </div>
                <div className="cb">
                  <div style={{ font: "600 13px/16px var(--font-pretendard)" }}>{activeTrip.title}</div>
                  <div className="share-box">/share/trips/{activeTrip.shareToken}?personId=p-ceo</div>
                  <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button className="adot-btn line" style={{ height: 32, fontSize: 12 }}>CEO 링크</button>
                    <button className="adot-btn line" style={{ height: 32, fontSize: 12 }}>CFO 링크</button>
                  </div>
                </div>
              </div>

              <div className="card flush">
                <div className="ch">
                  <LIcon name="database" size={16} />
                  <span>데이터 모드</span>
                </div>
                <div className="cb" style={{ font: "500 12px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-60)" }}>
                  현재는 DB 없이 로컬 고정 데이터로 동작합니다. 출장 일정이 끝난 뒤 같은 모델을 Supabase 테이블로 옮기면 됩니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WebTripList });
