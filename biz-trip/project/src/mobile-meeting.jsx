// Mobile share — Meeting detail with talking points (the executive-on-site view)

function MeetingMobileBullets({ items, tone = "default", numbered }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((t, i) => (
        <li key={i} style={{
          display: "flex", gap: 10, alignItems: "flex-start",
          font: "500 13px/19px var(--font-pretendard)",
          color: tone === "danger" ? "var(--red-800)" : "var(--on-surface-neutral-90)",
          padding: tone === "danger" ? "10px 12px" : 0,
          background: tone === "danger" ? "var(--red-50)" : "transparent",
          borderRadius: tone === "danger" ? 8 : 0,
        }}>
          {tone === "danger" ? (
            <LIcon name="alert-circle" size={14} color="var(--red-500)" style={{ marginTop: 2 }} />
          ) : numbered ? (
            <span style={{
              flexShrink: 0,
              width: 20, height: 20, borderRadius: 9999,
              background: "var(--on-surface-neutral-100)", color: "#fff",
              font: "600 11px/20px var(--font-pretendard)", textAlign: "center",
            }}>{i + 1}</span>
          ) : (
            <span style={{
              flexShrink: 0, width: 6, height: 6, borderRadius: 9999,
              background: "var(--on-surface-neutral-100)", marginTop: 8,
            }} />
          )}
          <span style={{ flex: 1 }}>{t}</span>
        </li>
      ))}
    </ol>
  );
}

function MobileMeeting({ meetingId = "m-smci-exec", personId = "p-my", onBack }) {
  const { MEETINGS, SCHEDULE } = window.TRIP_DATA;
  const meeting = MEETINGS[meetingId];
  const sched = SCHEDULE.find(s => s.meetingId === meetingId);
  const place = sched?.placeId ? window.TD.getPlace(sched.placeId) : null;
  const day = window.TRIP_DATA.DAYS.find(d => d.date === sched?.date);

  if (!meeting) {
    return (
      <div className="m-screen">
        <div className="m-header">
          <div className="m-h-eyebrow">
            <LIcon name="handshake" size={12} />
            <span>미팅</span>
          </div>
          <div className="m-h-title">미팅을 찾을 수 없습니다</div>
          <div className="m-h-sub">미팅 목록에서 다시 선택해주세요.</div>
        </div>
        <div style={{ padding: "16px 18px 28px" }}>
          <button type="button" className="m-cta full" onClick={onBack}>미팅 목록으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="m-screen">
      {/* Header */}
      <div className="m-header" style={{ paddingBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={onBack} aria-label="미팅 목록으로" style={{ width: 32, height: 32, border: 0, background: "transparent", padding: 0, display: "grid", placeItems: "center" }}>
            <LIcon name="chevron-left" size={22} />
          </button>
          <div style={{ flex: 1, textAlign: "center", font: "600 15px/18px var(--font-pretendard)" }}>{meeting.counterpart}</div>
          <LIcon name="more-vertical" size={20} />
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
          <TypeChip type="meeting" />
          {meetingId === "m-smci-exec" && <span className="tone-chip tone-red">핵심</span>}
        </div>
        <div className="m-h-title" style={{ marginTop: 6 }}>{meeting.name}</div>
        <div className="m-meeting-brief">
          <div>
            <span>언제</span>
            <b>{day?.label} {sched?.date.slice(5).replace("-", "/")} · {sched?.start}–{sched?.end}</b>
          </div>
          <div>
            <span>어디서</span>
            <b>{place?.name || "장소 확인 필요"}</b>
          </div>
          <div>
            <span>누구와</span>
            <b>{meeting.counterpart || "상대 확인 필요"} · {(meeting.counterpartPeople || []).length}명</b>
          </div>
        </div>
        {place && (
          <button type="button" className="m-h-sub" onClick={() => window.openMapUrl(place.mapUrl, `${place.name} ${place.address || ""}`)} style={{ width: "100%", border: 0, background: "transparent", padding: 0, textAlign: "left" }}>
            <LIcon name="map-pin" size={12} />
            <span>{place.name}</span>
            <span style={{ marginLeft: "auto", color: "var(--blue-700)", fontWeight: 600, fontSize: 12 }}>지도</span>
          </button>
        )}
      </div>

      {/* Objective */}
      <div className="m-section">미팅 목적</div>
      <div className="m-card">
        <div className="m-card-pad">
          <div style={{ font: "500 14px/22px var(--font-pretendard)" }}>{meeting.objective}</div>
        </div>
      </div>

      {/* Counterpart */}
      <div className="m-section">상대측 참석자</div>
      <div className="m-card">
        <div style={{ padding: "4px 0" }}>
          {meeting.counterpartPeople.map((cp, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px",
              borderBottom: i < meeting.counterpartPeople.length - 1 ? "1px solid var(--divider-10)" : 0,
            }}>
              <div className="avatar oat">{cp.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "600 14px/18px var(--font-pretendard)" }}>{cp.name}</div>
                <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>{cp.title}</div>
              </div>
              {cp.linkedin && (
                <button type="button" onClick={() => window.open(cp.linkedin, "_blank", "noopener,noreferrer")} aria-label={`${cp.name} LinkedIn`} style={{ width: 30, height: 30, border: 0, borderRadius: 8, background: "var(--surface-neutral-10)", display: "grid", placeItems: "center" }}>
                  <LIcon name="linkedin" size={16} color="var(--blue-700)" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Agenda */}
      <div className="m-section">아젠다</div>
      <div className="m-card">
        <div className="m-card-pad">
          <MeetingMobileBullets items={meeting.agenda} numbered />
        </div>
      </div>

      {/* Talking points — the star */}
      <div className="m-section">
        <span>토킹 포인트</span>
        <span className="m-section-act"><LIcon name="megaphone" size={12} style={{ verticalAlign: "middle", marginRight: 2 }} />중요</span>
      </div>
      <div className="m-card">
        <div className="m-card-pad">
          <MeetingMobileBullets items={meeting.talkingPoints} />
        </div>
      </div>

      {/* Cautions */}
      {meeting.cautions.length > 0 && (
        <>
          <div className="m-section" style={{ color: "var(--red-700)" }}>주의사항</div>
          <div className="m-card">
            <div className="m-card-pad">
              <MeetingMobileBullets items={meeting.cautions} tone="danger" />
            </div>
          </div>
        </>
      )}

      {/* Follow-ups */}
      <div className="m-section">후속 액션</div>
      <div className="m-card">
        <div className="m-card-pad">
          <MeetingMobileBullets items={meeting.followUps} numbered />
        </div>
      </div>

      {/* Bottom action */}
      <div style={{ padding: "16px 18px 28px", display: "flex", gap: 8 }}>
        <button type="button" className="m-cta line" style={{ flex: 1 }} onClick={onBack}>목록</button>
        <button type="button" className="m-cta" style={{ flex: 2, gap: 6 }} onClick={() => window.openMapUrl(place?.mapUrl, place?.name || meeting.name)}>
          <LIcon name="map" size={14} color="#fff" />길 안내 시작
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { MobileMeeting });
