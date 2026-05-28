// Executive Trip Planner — usable static web app
// DB 연결 없이 src/data.js의 고정 출장 데이터를 읽어 관리자/임원 공유 화면을 렌더링한다.

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
        <AppSelect
          label="시각"
          value={settings.nowHHMM}
          options={TIME_OPTS}
          onChange={(v) => setSettings(s => ({ ...s, nowHHMM: v }))}
        />
      </div>
    </div>
  );
}

function AdminApp({ route, settings, onDataChanged }) {
  const path = route.path;
  if (path === "/" || path === "/dashboard") return <WebDashboard accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/dashboard") return <WebDashboard accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/itinerary") return <WebItinerary day={settings.day} personFilter="all" accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/routes") return <WebRoutes day={settings.day} accent={settings.accent} onDataChanged={onDataChanged} />;
  if (path === "/admin") return <WebAdminData onDataChanged={onDataChanged} />;
  if (path.startsWith("/meeting")) {
    const meetingId = path.split("/")[2] || "m-smci-exec";
    return <WebMeeting meetingId={meetingId} accent={settings.accent} onDataChanged={onDataChanged} />;
  }
  return <WebDashboard accent={settings.accent} onDataChanged={onDataChanged} />;
}

function ShareApp({ route, settings }) {
  const requestedPersonId = route.params.get("personId") || settings.viewAs;
  const personId = window.TD.getPerson(requestedPersonId) ? requestedPersonId : APP_DEFAULTS.viewAs;
  const day = route.params.get("day") || settings.day;
  const nowHHMM = route.params.get("now") || settings.nowHHMM;
  const screen = route.params.get("screen") || "today";
  const person = window.TD.getPerson(personId);

  const nextScreen = (next) => {
    go(`/share?personId=${personId}&day=${day}&now=${nowHHMM}&screen=${next}`);
  };

  return (
    <div className="share-app-shell">
      <div className="share-top">
        <button onClick={() => go("/dashboard")} className="share-back">
          <LIcon name="chevron-left" size={18} />관리자
        </button>
        <div>
          <div className="share-title">임원 공유 링크</div>
          <div className="share-sub">{person?.name} · 읽기 전용 · {window.TRIP_DATA.TRIP.title}</div>
        </div>
      </div>

      <div className="share-phone">
        <div className="share-tabs">
          {[
            ["briefing", "브리핑"],
            ["today", "오늘"],
            ["day", "전체"],
            ["meeting", "미팅"],
          ].map(([id, label]) => (
            <button key={id} className={screen === id ? "active" : ""} onClick={() => nextScreen(id)}>
              {label}
            </button>
          ))}
        </div>
        {screen === "briefing" && <MobileBriefing personId={personId} />}
        {screen === "today" && <MobileToday personId={personId} date={day} nowHHMM={nowHHMM} />}
        {screen === "day" && <MobileDay personId={personId} date={day} />}
        {screen === "meeting" && <MobileMeeting meetingId="m-smci-exec" personId={personId} />}
      </div>
    </div>
  );
}

function App() {
  const route = useHashRoute();
  const [settings, setSettings] = useState(APP_DEFAULTS);
  const [dataVersion, setDataVersion] = useState(0);
  const [dbState, setDbState] = useState(window.isDbEnabled() ? "연결 중" : "로컬 데이터");

  async function refreshFromDb() {
    setDbState("연결 중");
    await window.ensureSupabaseClient?.();
    if (!window.isDbEnabled()) {
      setDbState("로컬 데이터");
      return;
    }
    try {
      await window.loadTripFromSupabase();
      setDataVersion(v => v + 1);
      setDbState("DB 연결됨");
    } catch (err) {
      console.error(err);
      setDbState("DB 오류");
    }
  }

  useEffect(() => {
    refreshFromDb();
  }, []);

  useEffect(() => {
    if (route.params.get("personId") || route.params.get("day") || route.params.get("now")) {
      setSettings(s => ({
        ...s,
        viewAs: window.TD.getPerson(route.params.get("personId")) ? route.params.get("personId") : s.viewAs,
        day: route.params.get("day") || s.day,
        nowHHMM: route.params.get("now") || s.nowHHMM,
      }));
    }
  }, [route.path, route.params.toString()]);

  const rootClass = [
    `accent-${settings.accent}`,
    settings.density === "compact" ? "density-compact" : "",
    settings.dark ? "dark-on" : "",
  ].filter(Boolean).join(" ");

  const isShare = route.path.startsWith("/share");

  return (
    <div className={`app-root ${rootClass}`}>
      <AppToolbar settings={settings} setSettings={setSettings} route={route} />
      <div className={`db-banner ${window.isDbEnabled() ? "ok" : "warn"}`}>
        <span>{dbState}</span>
        {!window.isDbEnabled() && <span>Supabase 쓰기/읽기를 켜려면 Vercel 환경변수의 anon key를 확인해 주세요.</span>}
      </div>
      <main className={isShare ? "app-main share-mode" : "app-main"}>
        {isShare ? (
          <ShareApp route={route} settings={settings} />
        ) : (
          <AdminApp route={route} settings={settings} onDataChanged={refreshFromDb} key={dataVersion} />
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
