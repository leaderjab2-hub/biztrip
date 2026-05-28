// Web admin — Meeting detail editor

function MeetingSection({ icon, title, action, children }) {
  return (
    <div className="card flush">
      <div className="ch">
        <LIcon name={icon} size={16} />
        <span>{title}</span>
        {action && <span style={{ marginLeft: "auto", font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-60)", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center" }}>
          <LIcon name="plus" size={12} />{action}
        </span>}
      </div>
      <div className="cb">{children}</div>
    </div>
  );
}

function BulletList({ items, numbered, tone }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((t, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", font: "400 13px/18px var(--font-pretendard)" }}>
          <span style={{
            flexShrink: 0, marginTop: 2,
            width: numbered ? 18 : 4, height: numbered ? 18 : 4,
            borderRadius: 9999,
            background: numbered ? (tone === "blue" ? "var(--blue-500)" : tone === "red" ? "var(--red-500)" : "var(--on-surface-neutral-100)") : (tone === "blue" ? "var(--blue-500)" : tone === "red" ? "var(--red-500)" : "var(--on-surface-neutral-100)"),
            color: "#fff",
            font: "600 10px/18px var(--font-pretendard)",
            textAlign: "center",
            ...(numbered ? {} : { marginTop: 8 }),
          }}>
            {numbered ? i + 1 : ""}
          </span>
          <span style={{ flex: 1 }}>{t}</span>
        </li>
      ))}
    </ol>
  );
}

function WebMeeting({ meetingId = "m-smci-exec", accent = "mono", onDataChanged }) {
  const { MEETINGS, SCHEDULE } = window.TRIP_DATA;
  const meeting = MEETINGS[meetingId];
  const sched = SCHEDULE.find(s => s.meetingId === meetingId);
  const place = sched?.placeId ? window.TD.getPlace(sched.placeId) : null;
  const day = window.TRIP_DATA.DAYS.find(d => d.date === sched?.date);
  const attendees = (sched?.attendees || []).map(id => window.TD.getPerson(id)).filter(Boolean);
  const [editor, setEditor] = useState(null);

  return (
    <div className={`web-frame accent-${accent}`}>
      <WebTopbar crumb={["출장", window.TRIP_DATA.TRIP.title, "미팅", meeting.name]} onEdit={() => setEditor("meeting")} />
      <div className="layout">
        <WebSidebar active="meetings" />
        <div className="content">
          {/* Title */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <TypeChip type="meeting" />
                {meetingId === "m-smci-exec" && <span className="tone-chip tone-red">핵심 미팅</span>}
                <span style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>
                  {day?.label} · {sched?.date.slice(5).replace("-", "/")} ({day?.weekday}) {sched?.start} – {sched?.end}
                </span>
              </div>
              <div className="h1">{meeting.name}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 16, font: "500 13px/18px var(--font-pretendard)", color: "var(--on-surface-neutral-60)" }}>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <LIcon name="building-2" size={14} />{meeting.counterpart}
                </span>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <LIcon name="map-pin" size={14} />{place?.name}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="adot-btn line" style={{ height: 36, fontSize: 13 }} onClick={() => setEditor("schedule")}>
                <LIcon name="calendar-clock" size={14} />일정 수정
              </button>
              <button className="adot-btn primary" style={{ height: 36, fontSize: 13 }} onClick={() => setEditor("meeting")}>
                <LIcon name="pencil" size={14} />미팅 수정
              </button>
            </div>
          </div>

          {/* Body — two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, minHeight: 0, flex: 1 }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
              <MeetingSection icon="target" title="목적">
                <div style={{ font: "400 14px/22px var(--font-pretendard)" }}>{meeting.objective}</div>
              </MeetingSection>

              <MeetingSection icon="list" title="아젠다" action="추가">
                <BulletList items={meeting.agenda} numbered />
              </MeetingSection>

              <MeetingSection icon="megaphone" title="토킹 포인트" action="추가">
                <BulletList items={meeting.talkingPoints} tone="blue" />
              </MeetingSection>

              {meeting.cautions.length > 0 && (
                <MeetingSection icon="alert-triangle" title="주의사항">
                  <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {meeting.cautions.map((t, i) => (
                      <li key={i} style={{
                        display: "flex", gap: 10, alignItems: "flex-start",
                        font: "400 13px/18px var(--font-pretendard)",
                        padding: "8px 10px",
                        background: "var(--red-50)", borderRadius: 8,
                        color: "var(--red-700)",
                      }}>
                        <LIcon name="alert-circle" size={14} color="var(--red-500)" style={{ marginTop: 2 }} />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ol>
                </MeetingSection>
              )}

              <MeetingSection icon="check-square" title="후속 액션" action="추가">
                <BulletList items={meeting.followUps} numbered />
              </MeetingSection>
            </div>

            {/* Right */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
              <MeetingSection icon="user-check" title="내부 참석자">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {attendees.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar person={p} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "600 13px/16px var(--font-pretendard)" }}>{p.name}</div>
                        <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>{p.role}</div>
                      </div>
                      {p.type === "executive" && <span className="tone-chip tone-neutral">임원</span>}
                    </div>
                  ))}
                </div>
              </MeetingSection>

              <MeetingSection icon="users" title={`상대측 참석자 · ${meeting.counterpart}`} action="추가">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {meeting.counterpartPeople.map((cp, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar oat">{cp.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "600 13px/16px var(--font-pretendard)" }}>{cp.name}</div>
                        <div style={{ font: "500 11px/14px var(--font-pretendard)", color: "var(--on-surface-neutral-50)" }}>{cp.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </MeetingSection>

              <MeetingSection icon="map" title="장소">
                {place && (
                  <>
                    <div style={{ font: "600 14px/18px var(--font-pretendard)" }}>{place.name}</div>
                    <div style={{ font: "500 12px/16px var(--font-pretendard)", color: "var(--on-surface-neutral-50)", marginTop: 2 }}>{place.address}</div>
                    <div className="map-tile" style={{ marginTop: 10, height: 130 }}>
                      <div className="road" style={{ top: "55%", transform: "rotate(8deg)" }} />
                      <div className="pin" style={{ top: "42%", left: "48%" }}>📍</div>
                    </div>
                    <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                      <button className="adot-btn line" style={{ height: 30, padding: "0 10px", fontSize: 12, flex: 1, gap: 6, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <LIcon name="map" size={12} />Google Maps
                      </button>
                      <button className="adot-btn line" style={{ height: 30, padding: "0 10px", fontSize: 12, flex: 1 }}>거리뷰</button>
                    </div>
                  </>
                )}
              </MeetingSection>
            </div>
          </div>
        </div>
      </div>
      {editor === "meeting" && (
        <WebEntityEditor
          entity="meetings"
          item={{ id: meetingId, ...meeting }}
          title="미팅 내용 수정"
          onClose={() => setEditor(null)}
          onSaved={onDataChanged}
        />
      )}
      {editor === "schedule" && sched && (
        <WebEntityEditor
          entity="schedule"
          item={sched}
          title="미팅 일정 수정"
          onClose={() => setEditor(null)}
          onSaved={onDataChanged}
        />
      )}
    </div>
  );
}

Object.assign(window, { WebMeeting });
