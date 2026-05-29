// Executive Trip Planner

const APP_DEFAULTS = {
  viewAs: "p-my",
  day: "2026-06-01",
  nowHHMM: "10:42",
  accent: "mono",
  density: "regular",
  dark: false,
};

const PERSON_OPTS = [
  ...window.TRIP_DATA.PEOPLE.map(p => ({ value: p.id, label: `${p.name} (${p.role})` })),
];
const DAY_OPTS = window.TRIP_DATA.DAYS.map(d => ({
  value: d.date,
  label: `${d.label} · ${d.date.slice(5).replace("-", "/")}`,
}));
const TIME_OPTS = [
  { value: "07:30", label: "07:30" },
  { value: "09:15", label: "09:15" },
  { value: "10:42", label: "10:42" },
  { value: "12:00", label: "12:00" },
  { value: "14:30", label: "14:30" },
  { value: "17:00", label: "17:00" },
  { value: "19:30", label: "19:30" },
];

function parseHash() {
  const raw = window.location.hash.replace(/^#/, "") || "/dashboard";
  const [path, qs = ""] = raw.split("?");
  return { path, params: new URLSearchParams(qs) };
}

function go(path) {
  window.location.hash = path;
}

function useHashRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function AppSelect({ label, value, options, onChange }) {
  return (
    <label className="app-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function AppToolbar({ settings, setSettings, route }) {
  const shareHash = `/share?personId=${settings.viewAs}&day=${settings.day}&now=${settings.nowHHMM}`;
  const isShare = route.path.startsWith("/share");
  const personOptions = window.TRIP_DATA.PEOPLE.map(p => ({ value: p.id, label: `${p.name} (${p.role})` }));
  const dayOptions = window.TRIP_DATA.DAYS.map(d => ({ value: d.date, label: `${d.label} · ${d.date.slice(5).replace("-", "/")}` }));

  return (
    <div className="app-toolbar">
      <div className="app-toolbar-left">
        <button className={`app-tab ${!isShare ? "active" : ""}`} onClick={() => go("/dashboard")}>
          <LIcon name="layout-dashboard" size={15} />관리자
        </button>
        <button className={`app-tab ${isShare ? "active" : ""}`} onClick={() => go(shareHash)}>
          <LIcon name="smartphone" size={15} />임원 공유
        </button>
        <button className={`app-tab ${route.path === "/admin" ? "active" : ""}`} onClick={() => go("/admin")}>
          <LIcon name="database" size={15} />데이터 편집
        </button>
      </div>

      <div className="app-toolbar-controls">
        <AppSelect
          label="사람"
          value={settings.viewAs}
          options={personOptions}
          onChange={(v) => setSettings(s => ({ ...s, viewAs: v }))}
        />
        <AppSelect
          label="Day"
          value={settings.day}
          options={dayOptions}
          onChange={(v) => setSettings(s => ({ ...s, day: v }))}
        />
        {isShare && (
          <AppSelect
            label="시각"
            value={settings.nowHHMM}
            options={TIME_OPTS}
            onChange={(v) => setSettings(s => ({ ...s, nowHHMM: v }))}
          />
        )}
      </div>
    </div>
  );
}

function AdminApp({ route, settings, onDataChanged }) {
  const path = route.path;
  if (path === "/" || path === "/dashboard") return <WebDashboard accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/dashboard") return <WebDashboard accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/people") return <WebCollectionPage kind="people" accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/flights") return <WebCollectionPage kind="flights" accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/hotels") return <WebCollectionPage kind="hotels" accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/events") return <WebCollectionPage kind="events" accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/itinerary") return <WebItinerary day={settings.day} personFilter="all" accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/meetings") return <WebMeetingsPage accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/routes") return <WebRoutes day={settings.day} accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/admin") return <WebAdminData onDataChanged={onDataChanged} />;
  if (path.startsWith("/meeting")) {
    const meetingId = path.split("/")[2] || "m-smci-exec";
    return <WebMeeting meetingId={meetingId} accent={settings.accent} onDataChanged={onDataChanged} />;
  }
  return <WebDashboard accent={settings.accent} onDataChanged={onDataChanged} />;
}

function ShareTabButton({ active, icon, label, onClick }) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      <LIcon name={icon} size={17} />
      <span>{label}</span>
    </button>
  );
}

function MobileMeetingsOverview({ personId, onOpenMeeting }) {
  const rows = Object.entries(window.TRIP_DATA.MEETINGS).map(([id, meeting]) => {
    const sched = window.TRIP_DATA.SCHEDULE.find(item => item.meetingId === id);
    const place = sched?.placeId ? window.TD.getPlace(sched.placeId) : null;
    const day = window.TRIP_DATA.DAYS.find(item => item.date === sched?.date);
    return { id, meeting, sched, place, day };
  }).filter(row => row.sched && (row.sched.attendees || []).includes(personId))
    .sort((a, b) => `${a.sched?.date || "9999"} ${a.sched?.start || "99:99"}`.localeCompare(`${b.sched?.date || "9999"} ${b.sched?.start || "99:99"}`));

  return (
    <div className="m-screen">
      <div className="m-header">
        <div className="m-h-eyebrow">
          <LIcon name="handshake" size={12} />
          <span>미팅</span>
        </div>
        <div className="m-h-title">미팅 브리핑</div>
        <div className="m-h-sub">목적, 참석자, 토킹 포인트를 미팅별로 확인</div>
      </div>
      <div style={{ padding: "14px 18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map(({ id, meeting, sched, place, day }) => (
          <button key={id} className="m-meeting-card" onClick={() => onOpenMeeting(id)}>
            <div className="m-meeting-top">
              <TypeChip type="meeting" />
              <span>{day?.label || "일정 미정"} {sched?.start || "--:--"}</span>
            </div>
            <div className="m-meeting-title">{meeting.name}</div>
            <div className="m-meeting-meta">
              <span>{meeting.counterpart || "상대 미정"}</span>
              {place && <span>{place.name}</span>}
            </div>
            <div className="m-meeting-foot">
              <span>{(meeting.agenda || []).length}개 아젠다</span>
              <span>{(meeting.talkingPoints || []).length}개 토킹 포인트</span>
              <LIcon name="chevron-right" size={15} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ShareApp({ route, settings }) {
  const requestedPersonId = route.params.get("personId") || settings.viewAs;
  const personId = window.TD.getPerson(requestedPersonId) ? requestedPersonId : APP_DEFAULTS.viewAs;
  const firstDay = window.TRIP_DATA.DAYS[0]?.date || settings.day;
  const day = route.params.get("day") || firstDay;
  const nowHHMM = route.params.get("now") || settings.nowHHMM;
  const rawScreen = route.params.get("screen") || "briefing";
  const screen = rawScreen === "today" || rawScreen === "day" ? "days" : rawScreen;
  const meetingId = route.params.get("meetingId") || "m-smci-exec";
  const person = window.TD.getPerson(personId);

  const nextScreen = (next, nextParams = {}) => {
    const qs = new URLSearchParams({ personId, day, now: nowHHMM, screen: next, ...nextParams });
    go(`/share?${qs.toString()}`);
  };

  const openDays = (nextDay = firstDay) => nextScreen("days", { day: nextDay });
  const navScreen = screen === "meeting" ? "meetings" : screen;

  useEffect(() => {
    const resetScroll = () => {
      document.querySelector(".share-native-body")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      window.scrollTo(0, 0);
    };
    resetScroll();
    requestAnimationFrame(resetScroll);
  }, [screen, day, meetingId, personId]);

  return (
    <div className="share-native">
      <div className="share-native-status">
        <div>
          <b>{window.TRIP_DATA.TRIP.title}</b>
          <span>{person?.name} · 모바일 브리핑</span>
        </div>
        <span>6/1-6/4</span>
      </div>
      <div className="share-native-body">
        {screen === "briefing" && (
          <MobileBriefing
            personId={personId}
            onOpenDays={() => openDays()}
            onOpenMeetings={() => nextScreen("meetings")}
            onOpenMeeting={(id) => nextScreen("meeting", { meetingId: id })}
          />
        )}
        {screen === "days" && (
          <MobileDay
            personId={personId}
            date={day}
            onChangeDay={(nextDay) => openDays(nextDay)}
            onOpenMeeting={(id) => nextScreen("meeting", { meetingId: id })}
          />
        )}
        {screen === "meetings" && <MobileMeetingsOverview personId={personId} onOpenMeeting={(id) => nextScreen("meeting", { meetingId: id })} />}
        {screen === "meeting" && <MobileMeeting meetingId={meetingId} personId={personId} onBack={() => nextScreen("meetings")} />}
      </div>
      <div className="share-bottom-nav">
        <ShareTabButton active={navScreen === "briefing"} icon="briefcase" label="브리핑" onClick={() => nextScreen("briefing")} />
        <ShareTabButton active={navScreen === "days"} icon="calendar-days" label="일정" onClick={() => openDays()} />
        <ShareTabButton active={navScreen === "meetings"} icon="handshake" label="미팅" onClick={() => nextScreen("meetings")} />
      </div>
    </div>
  );
}

function AppBootScreen({ title, body, retryLabel, onRetry, tone = "loading" }) {
  return (
    <div className="app-boot-shell">
      <div className={`app-boot-card ${tone}`}>
        {tone === "loading" ? (
          <div className="app-boot-spinner" aria-hidden="true" />
        ) : (
          <div className="app-boot-icon">
            <LIcon name="database" size={18} />
          </div>
        )}
        <div className="app-boot-title">{title}</div>
        <div className="app-boot-body">{body}</div>
        {onRetry && (
          <button className="adot-btn primary" style={{ height: 36, padding: "0 14px", fontSize: 13 }} onClick={onRetry}>
            {retryLabel || "다시 시도"}
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const route = useHashRoute();
  const [settings, setSettings] = useState(APP_DEFAULTS);
  const [dataVersion, setDataVersion] = useState(0);
  const [bootState, setBootState] = useState("loading");
  const [bootError, setBootError] = useState("");

  async function refreshFromDb({ initial = false } = {}) {
    if (initial) {
      setBootState("loading");
      setBootError("");
    }
    await window.ensureSupabaseClient?.();
    if (!window.isDbEnabled()) {
      const message = "Supabase 환경변수를 확인해 주세요. DB 연결 정보가 아직 준비되지 않았습니다.";
      if (initial) {
        setBootError(message);
        setBootState("error");
      }
      throw new Error(message);
    }
    try {
      await window.loadTripFromSupabase();
      setDataVersion(v => v + 1);
      if (initial) setBootState("ready");
    } catch (err) {
      console.error(err);
      if (initial) {
        setBootError(err.message || "DB에서 출장 데이터를 불러오지 못했습니다.");
        setBootState("error");
      }
      throw err;
    }
  }

  useEffect(() => {
    refreshFromDb({ initial: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (bootState !== "ready") return;
    if (route.params.get("personId") || route.params.get("day") || route.params.get("now")) {
      setSettings(s => ({
        ...s,
        viewAs: window.TD.getPerson(route.params.get("personId")) ? route.params.get("personId") : s.viewAs,
        day: route.params.get("day") || s.day,
        nowHHMM: route.params.get("now") || s.nowHHMM,
      }));
    }
  }, [bootState, route.path, route.params.toString()]);

  const rootClass = [
    `accent-${settings.accent}`,
    settings.density === "compact" ? "density-compact" : "",
    settings.dark ? "dark-on" : "",
  ].filter(Boolean).join(" ");

  if (bootState === "loading") {
    return (
      <div className={`app-root ${rootClass}`}>
        <AppBootScreen
          title="출장 데이터를 불러오는 중"
          body="Supabase에서 최신 일정을 읽고 있습니다."
          tone="loading"
        />
      </div>
    );
  }

  if (bootState === "error") {
    return (
      <div className={`app-root ${rootClass}`}>
        <AppBootScreen
          title="출장 데이터를 불러오지 못했습니다"
          body={bootError || "DB 연결 상태를 확인한 뒤 다시 시도해 주세요."}
          retryLabel="다시 불러오기"
          onRetry={() => refreshFromDb({ initial: true }).catch(() => {})}
          tone="error"
        />
      </div>
    );
  }

  const isShare = route.path.startsWith("/share");

  if (isShare) {
    return (
      <div className={`app-root share-root ${rootClass}`}>
        <ShareApp route={route} settings={settings} />
      </div>
    );
  }

  return (
    <div className={`app-root ${rootClass}`}>
      <AppToolbar settings={settings} setSettings={setSettings} route={route} />
      <main className="app-main">
        <AdminApp route={route} settings={settings} onDataChanged={() => refreshFromDb().catch(() => {})} key={dataVersion} />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
