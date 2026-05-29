// Fixed trip data — COMPUTEX 2026 출장 (2026-06-01 ~ 2026-06-04)
// 이번 실사용 범위는 DB 없이 이 파일 하나를 기준 데이터로 쓴다.

const TRIP = {
  id: "trip-computex-2026",
  title: "COMPUTEX 2026 출장",
  purpose: "COMPUTEX 2026, NVIDIA GTC Taipei, Supermicro Innovate! APAC 2026 참석 및 GPUaaS 사업 관련 파트너 미팅",
  organization: "AI CIC / GPUaaS사업",
  country: "대만",
  city: "타이베이",
  startDate: "2026-06-01",
  endDate: "2026-06-04",
  localTz: "Asia/Taipei",
  status: "draft",
  shareToken: "computex-2026",
  ownerName: "AI CIC",
  updatedAt: "2026-05-28 11:00",
};

const PEOPLE = [
  { id: "p-my", name: "MY", role: "역할 확인 필요", type: "member", initials: "MY", color: "blue", email: "", phone: "", memo: "실명/직책 확인 필요" },
  { id: "p-roy", name: "Roy", role: "역할 확인 필요", type: "member", initials: "R", color: "oat", email: "", phone: "", memo: "실명/직책 확인 필요" },
  { id: "p-sg", name: "SG", role: "역할 확인 필요", type: "member", initials: "SG", color: "sky", email: "", phone: "", memo: "실명/직책 확인 필요" },
  { id: "p-jason", name: "Jason", role: "역할 확인 필요", type: "member", initials: "J", color: "lime", email: "", phone: "", memo: "실명/직책 확인 필요" },
];

const ALL_ATTENDEES = PEOPLE.map(p => p.id);

const FLIGHTS = [
  {
    id: "f-out", type: "outbound",
    airline: "대한항공", flightNumber: "KE 2021",
    dep: { airport: "ICN", city: "서울 인천", time: "2026-06-01 10:30", tz: "Asia/Seoul" },
    arr: { airport: "TPE", city: "타이베이 타오위안", time: "2026-06-01 12:10", tz: "Asia/Taipei" },
    durationMin: 160,
    passengers: ALL_ATTENDEES.map(personId => ({ personId, seat: "확인 필요" })),
    bookingRef: "확인 필요",
    memo: "탑승자 확인 필요",
  },
  {
    id: "f-ret", type: "return",
    airline: "대한항공 / 중화항공 운항", flightNumber: "KE 5694",
    dep: { airport: "TPE", city: "타이베이 타오위안", time: "2026-06-04 15:30", tz: "Asia/Taipei" },
    arr: { airport: "ICN", city: "서울 인천", time: "2026-06-04 19:05", tz: "Asia/Seoul" },
    durationMin: 155,
    passengers: ALL_ATTENDEES.map(personId => ({ personId, seat: "확인 필요" })),
    bookingRef: "대기 중",
    memo: "대한항공 2건 대기 중",
  },
];

const HOTEL = {
  id: "h-caesar",
  name: "Caesar Park Taipei",
  address: "No. 38, Section 1, Zhongxiao W Rd, Zhongzheng District, Taipei",
  checkin: "2026-06-01 12:30",
  checkout: "2026-06-04 확인 필요",
  bookingRef: "확인 필요",
  breakfast: false,
  guests: ALL_ATTENDEES.map(personId => ({ personId, room: "확인 필요", roomNo: "확인 필요" })),
  memo: "체크아웃 시간 및 투숙자 확인 필요",
};

const PLACES = {
  "pl-icn": { name: "Incheon Airport", address: "ICN", lat: 37.4602, lng: 126.4407 },
  "pl-tpe": { name: "Taoyuan Airport", address: "TPE", lat: 25.0797, lng: 121.2342 },
  "pl-caesar": { name: "Caesar Park Taipei", address: "No. 38, Section 1, Zhongxiao W Rd", lat: 25.0461, lng: 121.5169 },
  "pl-mandarin": { name: "Mandarin Oriental Taipei", address: "No. 158, DunHua N Rd", lat: 25.0555, lng: 121.5485 },
  "pl-banjin": { name: "半斤八雨", address: "Taipei", lat: 25.0436, lng: 121.5298 },
  "pl-grand-hilai": { name: "Grand Hilai Taipei", address: "Taipei Nangang", lat: 25.0535, lng: 121.6075 },
  "pl-nangang-h1": { name: "Nangang Hall 1 / SMCI Booth", address: "Taipei Nangang Exhibition Center Hall 1", lat: 25.0566, lng: 121.6181 },
  "pl-gmi": { name: "Nangang Hall 2 / GMI Booth R0302", address: "Taipei Nangang Exhibition Center Hall 2", lat: 25.0574, lng: 121.6178 },
  "pl-tainan-room": { name: "Tainan Room (16F)", address: "Taipei", lat: 25.0478, lng: 121.5170 },
  "pl-gct": { name: "GCT Booth 1F", address: "Taipei", lat: 25.0568, lng: 121.6184 },
  "pl-pause": { name: "PAUSE Coffee Roaster", address: "Taipei", lat: 25.0474, lng: 121.5318 },
  "pl-unknown": { name: "확인 필요", address: "장소 확인 필요", lat: 25.0478, lng: 121.5319 },
};

const DAYS = [
  { date: "2026-06-01", label: "Day 1", title: "입국 · SMCI/Verda 미팅", weekday: "월" },
  { date: "2026-06-02", label: "Day 2", title: "NVIDIA Summit · SMCI 부스", weekday: "화" },
  { date: "2026-06-03", label: "Day 3", title: "NVIDIA · GMI/GCT/VAST 미팅", weekday: "수" },
  { date: "2026-06-04", label: "Day 4", title: "귀국", weekday: "목" },
];

const SCHEDULE = [
  { id: "s-101", date: "2026-06-01", start: "09:00", end: "09:30", type: "transfer", title: "공항 이동 및 출국", placeId: "pl-icn", attendees: ALL_ATTENDEES, desc: "KE 2021, ICN 10:30 → TPE 12:10" },
  { id: "s-102", date: "2026-06-01", start: "10:30", end: "12:10", type: "flight", title: "출국 항공편", placeId: "pl-icn", attendees: ALL_ATTENDEES, desc: "대한항공 KE 2021" },
  { id: "s-103", date: "2026-06-01", start: "12:30", end: "13:00", type: "hotel", title: "호텔 이동 및 체크인", placeId: "pl-caesar", attendees: ALL_ATTENDEES, desc: "Caesar Park Taipei" },
  { id: "s-104", date: "2026-06-01", start: "14:00", end: "14:30", type: "transfer", title: "SMCI 행사장 이동", placeId: "pl-mandarin", attendees: ALL_ATTENDEES, desc: "Mandarin Oriental Taipei 이동" },
  { id: "s-105", date: "2026-06-01", start: "16:00", end: "16:45", type: "meeting", title: "SMCI Executive Meeting", placeId: "pl-mandarin", attendees: ALL_ATTENDEES, desc: "SKT GPUaaS 구축 수요 및 SMCI 공급 방안 협의", meetingId: "m-smci-exec" },
  { id: "s-106", date: "2026-06-01", start: "17:00", end: "17:30", type: "meeting", title: "Verda Meeting", placeId: "pl-mandarin", attendees: ALL_ATTENDEES, desc: "Verda 소개 및 SKT GPUaaS 사업기회 논의", meetingId: "m-verda" },
  { id: "s-107", date: "2026-06-01", start: "18:30", end: "21:00", type: "event", title: "NVIDIA Korea Partner Night", placeId: "pl-banjin", attendees: ALL_ATTENDEES, desc: "파트너 네트워킹 만찬" },

  { id: "s-201", date: "2026-06-02", start: "09:30", end: "12:00", type: "event", title: "NVIDIA APAC NCP Summit", placeId: "pl-grand-hilai", attendees: ALL_ATTENDEES, desc: "Grand Hilai Taipei, 3rd Floor" },
  { id: "s-202", date: "2026-06-02", start: "12:00", end: "13:00", type: "meeting", title: "Lunch Meeting", placeId: "pl-unknown", attendees: ALL_ATTENDEES, desc: "상세 미정", meetingId: "m-lunch" },
  { id: "s-203", date: "2026-06-02", start: "13:00", end: "14:30", type: "meeting", title: "SMCI 부스 VIP투어 & VR 미팅", placeId: "pl-nangang-h1", attendees: ALL_ATTENDEES, desc: "SMCI VR 시리즈 시제품 투어 및 GPUaaS 구축 관련 기술 협의", meetingId: "m-smci-vr" },
  { id: "s-204", date: "2026-06-02", start: "13:00", end: "14:00", type: "event", title: "NCP 기술 세션", placeId: "pl-unknown", attendees: ALL_ATTENDEES, desc: "시간 및 장소 상세 확인 필요" },
  { id: "s-205", date: "2026-06-02", start: "14:00", end: "15:00", type: "event", title: "Petasus 기술 세션", placeId: "pl-gmi", attendees: ALL_ATTENDEES, desc: "GMI Booth, Hall 2 Booth R0302" },
  { id: "s-206", date: "2026-06-02", start: "15:30", end: "17:00", type: "event", title: "NVIDIA APAC NCP Summit", placeId: "pl-grand-hilai", attendees: ALL_ATTENDEES, desc: "오후 세션" },
  { id: "s-207", date: "2026-06-02", start: "18:00", end: "18:40", type: "meal", title: "NVIDIA NCPs Reception", placeId: "pl-mandarin", attendees: ALL_ATTENDEES, desc: "Mandarin Oriental, Taipei Ballroom" },
  { id: "s-208", date: "2026-06-02", start: "18:50", end: "19:20", type: "meal", title: "저녁 만찬 일정 2", placeId: "", attendees: ALL_ATTENDEES, desc: "장소 및 상세 일정 입력 예정" },
  { id: "s-209", date: "2026-06-02", start: "19:30", end: "21:00", type: "meal", title: "Ampere VIP Event", placeId: "", attendees: ALL_ATTENDEES, desc: "장소 및 상세 일정 입력 예정" },

  { id: "s-301", date: "2026-06-03", start: "10:00", end: "11:00", type: "meeting", title: "NVIDIA Meeting", placeId: "pl-tainan-room", attendees: ALL_ATTENDEES, desc: "NCP 기반 세일즈 채널 및 GPU 인프라 구매 수요 협의", meetingId: "m-nvidia" },
  { id: "s-302", date: "2026-06-03", start: "12:00", end: "13:00", type: "meeting", title: "Intel Lunch Meeting", placeId: "pl-unknown", attendees: ALL_ATTENDEES, desc: "세부 내용 확인 필요", meetingId: "m-intel" },
  { id: "s-303", date: "2026-06-03", start: "13:30", end: "14:00", type: "meeting", title: "GMI Cloud Meeting", placeId: "pl-gmi", attendees: ALL_ATTENDEES, desc: "공급조건 및 계약 검토 일정 협의", meetingId: "m-gmi" },
  { id: "s-304", date: "2026-06-03", start: "15:00", end: "15:20", type: "event", title: "GCT 부스 VIP 투어", placeId: "pl-gct", attendees: ALL_ATTENDEES, desc: "GCT Booth 1F" },
  { id: "s-305", date: "2026-06-03", start: "15:30", end: "16:20", type: "meeting", title: "GCT Meeting", placeId: "pl-gct", attendees: ALL_ATTENDEES, desc: "AI 서버 공급 Capacity 및 납기, 가격 경쟁력 확인", meetingId: "m-gct" },
  { id: "s-306", date: "2026-06-03", start: "17:00", end: "18:00", type: "meeting", title: "VAST Meeting", placeId: "pl-pause", attendees: ALL_ATTENDEES, desc: "해인클러스터 운영 관련 VAST VoC 및 향후 스토리지 구성 논의", meetingId: "m-vast" },
  { id: "s-307", date: "2026-06-03", start: "18:30", end: "20:00", type: "meal", title: "구성원 만찬 예정", placeId: "pl-unknown", attendees: ALL_ATTENDEES, desc: "시간 임시 입력, 상세 확정 필요" },

  { id: "s-401", date: "2026-06-04", start: "12:00", end: "12:30", type: "transfer", title: "공항 이동 및 출국", placeId: "pl-tpe", attendees: ALL_ATTENDEES, desc: "귀국 항공편 탑승을 위한 공항 이동" },
  { id: "s-402", date: "2026-06-04", start: "15:30", end: "19:05", type: "flight", title: "귀국 항공편", placeId: "pl-tpe", attendees: ALL_ATTENDEES, desc: "KE 5694, 중화항공 운항, TPE 15:30 → ICN 19:05" },
];

const MEETINGS = {
  "m-smci-exec": {
    name: "SMCI Executive Meeting",
    counterpart: "SMCI",
    counterpartPeople: [
      { name: "Matthew Thauberger", title: "Chief Revenue Officer" },
      { name: "Vik Malyala", title: "Chief Business Officer" },
      { name: "Ray Pang", title: "SVP" },
      { name: "KK Richard Lee", title: "VP" },
    ],
    objective: "SKT GPUaaS 구축 수요 및 SMCI 공급 방안 협의",
    agenda: ["GPUaaS 구축 목표와 초도 규모 공유", "VR 시리즈 공급 가능 시점/물량 확인", "우선 협상 및 물량 확약 가능성 논의"],
    talkingPoints: [
      "SKT GPUaaS 목표 구축 시점 및 초도 규모, 단계적 확장 계획 공유",
      "SMCI VR 시리즈 기반 공급 가능 여부와 공급 시점, 물량 확인 요청",
      "전략적 협력 방향성 및 C레벨 사전 협의 필요사항 도출",
    ],
    cautions: ["구체적인 회의 장소 미정"],
    followUps: ["공급 가능 물량/리드타임 회신 요청", "발주 결정 시점 조기화를 위한 사전 협의 항목 정리"],
  },
  "m-verda": {
    name: "Verda Meeting",
    counterpart: "Verda",
    counterpartPeople: [
      { name: "Jorge Santos", title: "Chief Operation Officer" },
      { name: "Anssi Harjunpaa", title: "Chief Business Officer" },
      { name: "Andrian Garcai Castro", title: "Head of Datacenter Ops" },
      { name: "Patrick Chen", title: "Head of APAC Procurement" },
      { name: "Bei-Bei Chen", title: "Head of EMEA Procurement" },
      { name: "Taru Kalliovaara", title: "COO Office" },
      { name: "Ruben Bryon", title: "CEO (참석 여부 미확정)" },
    ],
    objective: "Verda 소개 및 SKT GPUaaS 사업기회 논의",
    agenda: ["Verda 사업 소개", "SKT GPUaaS 소개", "B200 및 차세대 GPU 사업기회 논의"],
    talkingPoints: ["GPU 기반 Neo Cloud/SW 솔루션 및 주요 고객 확인", "해인클러스터 B200 및 B300/GB300/VR 시리즈 기회 논의", "B200 세일즈 단가와 기술요건 문의"],
    cautions: ["구체적인 회의 장소 미정"],
    followUps: ["B200/B300/GB300 기대수요와 단가 정보 후속 확인"],
  },
  "m-smci-vr": {
    name: "SMCI 부스 VIP투어 & VR 미팅",
    counterpart: "SMCI",
    counterpartPeople: [
      { name: "Matthew Thauberger", title: "Chief Revenue Officer" },
      { name: "Vik Malyala", title: "Chief Business Officer" },
      { name: "Ray Pang", title: "SVP" },
      { name: "KK Richard Lee", title: "VP" },
    ],
    objective: "SMCI VR 시리즈 시제품 투어 및 GPUaaS 구축 관련 기술 협의",
    agenda: ["VR 시리즈 시제품 투어", "B/GB 시리즈 대비 차이점 확인", "구축 일정과 SU 단위 검토사항 논의"],
    talkingPoints: ["VR 시리즈 기본 스펙과 구축 특이사항 확인", "제품 인증 및 판매 가능 시점, 리드타임 확인", "GB300 대비 성능/기술요건/유지보수 차이 문의"],
    cautions: [],
    followUps: ["VR 시리즈 기반 구축 검토사항 정리"],
  },
  "m-nvidia": {
    name: "NVIDIA Meeting",
    counterpart: "NVIDIA",
    counterpartPeople: [
      { name: "Nico Carpez", title: "VP, Global AI Infrastructure" },
      { name: "Raj Mirpuri", title: "VP, Cloud Partner Sales" },
      { name: "Taeho Kim", title: "Korea NCP Specialist" },
    ],
    objective: "NVIDIA NCP 기반 세일즈 채널 및 GPU 인프라 구매 수요 관련 협의",
    agenda: ["NCP 세일즈 채널", "NCP 고객 reputation", "향후 GPU projection"],
    talkingPoints: ["NCP 기반 세일즈 시 GPU 인프라 판매 알선 및 APAC 채널 문의", "PBD/GMI Cloud 등 NCP 고객 reputation 문의", "Gigawatt AI DC 협업 확장 전략과 next steps"],
    cautions: ["표에는 09:30~12:00, 상세에는 10:00~11:00로 표기"],
    followUps: ["NVIDIA 채널/고객 레퍼런스 정리"],
  },
  "m-gmi": {
    name: "GMI Cloud Meeting",
    counterpart: "GMI Cloud",
    counterpartPeople: [
      { name: "Alex Yeh", title: "Founder & CEO" },
      { name: "Andy Chen", title: "Global VP of Business" },
      { name: "Sean Song", title: "Strategic Compute Sourcing" },
      { name: "Amy Chang", title: "Executive Assistant" },
    ],
    objective: "공급조건 및 계약 검토 일정 협의",
    agenda: ["단가 및 기술요건", "Storage 약정물량", "계약서 검토 일정"],
    talkingPoints: ["제공 단가 및 기술 요구사항 협의", "Storage 1년차 약정물량 및 단가 협의", "SLA 및 인터넷 회선 대역폭 관련 기술요청사항 협의"],
    cautions: [],
    followUps: ["계약서 검토 deadline 및 양사 리뷰 일정 확정"],
  },
  "m-gct": {
    name: "GCT Meeting",
    counterpart: "GCT",
    counterpartPeople: [
      { name: "Polly H.", title: "MDC Leader" },
      { name: "Leon Chang", title: "Head of Presales" },
      { name: "Gary Lam", title: "Future Product Manager" },
      { name: "Vincent Lee", title: "Global Head of Sales" },
      { name: "Freya Yu", title: "APJ Director of Sales" },
      { name: "Andie Yen", title: "Head of Infra Team" },
    ],
    objective: "AI 서버 공급 Capacity 및 납기, 가격 경쟁력, 국내 기술 지원 체계 확인",
    agenda: ["공급 capacity", "가격 경쟁력", "국내 기술 지원"],
    talkingPoints: ["AI 서버 공급 Capacity 및 납기 확인", "Supermicro 동급 모델 대비 단가 Gap 비교", "국내 기술 지원 체계 및 AS 역량 확인"],
    cautions: [],
    followUps: ["동급 모델 가격/납기 비교표 업데이트"],
  },
  "m-vast": {
    name: "VAST Meeting",
    counterpart: "VAST",
    counterpartPeople: [
      { name: "Sunil Chavan", title: "VP of APAC" },
      { name: "Andy Pernsteiner", title: "Field CTO of HQ" },
      { name: "Jeffrey Tay", title: "Regional Director of APAC" },
    ],
    objective: "해인클러스터 운영 관련 VAST VoC 및 향후 스토리지 구성 논의",
    agenda: ["운영 VoC", "E-Box 운용경험", "신규 GPU 라인업 대응 스토리지"],
    talkingPoints: ["해인클러스터 운영간 발생 VAST 관련 VoC와 지원 필요사항 문의", "VAST E-Box 운용경험 기반 보완 가능 방안 확인", "GB300/VR 시리즈 대응 스토리지 라인업 및 차별점 확인"],
    cautions: [],
    followUps: ["VAST 지원 필요사항과 스토리지 대안 정리"],
  },
  "m-lunch": { name: "Lunch Meeting", counterpart: "확인 필요", counterpartPeople: [], objective: "점심 미팅", agenda: ["상세 확인 필요"], talkingPoints: ["장소/참석자/의제 확인 필요"], cautions: [], followUps: ["상세 확정"] },
  "m-intel": { name: "Intel Lunch Meeting", counterpart: "Intel", counterpartPeople: [], objective: "Intel Lunch Meeting", agenda: ["세부 내용 확인 필요"], talkingPoints: ["세부 내용 확인 필요"], cautions: [], followUps: ["상세 확정"] },
};

const EVENTS = {
  "e-computex": {
    name: "COMPUTEX 2026",
    host: "TAITRA, TCA",
    placeId: "pl-nangang-h1",
    start: "2026-06-02",
    end: "2026-06-05",
    purpose: "AI Together 테마의 AI/컴퓨팅/로보틱스/AIoT 생태계 파악",
    dressCode: "Business Casual",
    sessions: [
      { title: "AI-accelerated Computing & Edge Intelligence Roadmap", time: "Keynote 1", place: "COMPUTEX", memo: "Marvell CEO Matt Murphy" },
      { title: "Next Era of Computing in the Age of AI", time: "Keynote 2", place: "COMPUTEX", memo: "Intel CEO Lip-Bu Tan" },
      { title: "Robotics & Physical AI", time: "Forum 1", place: "COMPUTEX", memo: "NVIDIA, MS, Google DeepMind 등" },
    ],
  },
  "e-gtc": {
    name: "NVIDIA GTC Taipei",
    host: "NVIDIA",
    placeId: "pl-unknown",
    start: "2026-06-02",
    end: "2026-06-04",
    purpose: "Agentic AI, AI Factories, Physical AI 등 Demo Showcase 확인",
    dressCode: "Business Casual",
    sessions: [
      { title: "Agentic AI and Reasoning AI", time: "06/02-06/04", place: "TICC", memo: "주요 기술 세션" },
      { title: "AI Factories and Scaling Infra", time: "06/02-06/04", place: "TICC", memo: "GPUaaS 연관" },
    ],
  },
  "e-smci": {
    name: "Supermicro Innovate! APAC 2026",
    host: "Supermicro",
    placeId: "pl-mandarin",
    start: "2026-06-01",
    end: "2026-06-01",
    purpose: "전략 인사이트, 제품/솔루션 전문가 미팅, Tech Showcase",
    dressCode: "Business Casual",
    sessions: [
      { title: "Built to Accelerate", time: "06/01 09:00-20:00", place: "Mandarin Oriental", memo: "Vera Rubin 시제품 전시" },
    ],
  },
};

const ROUTES = [
  { date: "2026-06-01", fromSched: "s-103", toSched: "s-104", from: "pl-caesar", to: "pl-mandarin", mode: "driving", distance: 4.8, durationMin: 18, bufferMin: 15, dep: "13:27" },
  { date: "2026-06-01", fromSched: "s-106", toSched: "s-107", from: "pl-mandarin", to: "pl-banjin", mode: "driving", distance: 5.2, durationMin: 22, bufferMin: 15, dep: "17:53" },
  { date: "2026-06-02", fromSched: "s-201", toSched: "s-203", from: "pl-grand-hilai", to: "pl-nangang-h1", mode: "walking", distance: 0.8, durationMin: 10, bufferMin: 10, dep: "12:40" },
  { date: "2026-06-02", fromSched: "s-205", toSched: "s-206", from: "pl-gmi", to: "pl-grand-hilai", mode: "walking", distance: 0.9, durationMin: 11, bufferMin: 10, dep: "15:09" },
  { date: "2026-06-02", fromSched: "s-206", toSched: "s-207", from: "pl-grand-hilai", to: "pl-mandarin", mode: "driving", distance: 8.1, durationMin: 24, bufferMin: 15, dep: "17:21" },
  { date: "2026-06-03", fromSched: "s-302", toSched: "s-303", from: "pl-unknown", to: "pl-gmi", mode: "driving", distance: 8.5, durationMin: 25, bufferMin: 10, dep: "12:55" },
  { date: "2026-06-03", fromSched: "s-305", toSched: "s-306", from: "pl-gct", to: "pl-pause", mode: "driving", distance: 8.2, durationMin: 24, bufferMin: 10, dep: "16:26" },
];

Object.entries(PLACES).forEach(([id, place]) => {
  place.id = id;
  place.externalPlaceId = `local-${id}`;
  place.mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}`;
});

window.TRIP_DATA = {
  TRIPS: [TRIP], TRIP, PEOPLE, FLIGHTS, HOTEL, PLACES, DAYS, SCHEDULE, MEETINGS, EVENTS, ROUTES,
};

window.TD = {
  getPerson: (id) => PEOPLE.find(p => p.id === id),
  getPlace: (id) => PLACES[id],
  getDayItems: (date) => SCHEDULE.filter(s => s.date === date).sort((a,b) => a.start.localeCompare(b.start)),
  getPersonItems: (date, personId) => SCHEDULE.filter(s => s.date === date && s.attendees.includes(personId)).sort((a,b) => a.start.localeCompare(b.start)),
  getTripStats: () => ({
    people: PEOPLE.length,
    meetings: Object.keys(MEETINGS).length,
    events: Object.keys(EVENTS).length,
    routes: ROUTES.length,
    scheduleItems: SCHEDULE.length,
  }),
  getRoutesForDay: (date, personId = "all") => {
    const items = personId === "all" ? window.TD.getDayItems(date) : window.TD.getPersonItems(date, personId);
    const explicitRoutes = window.TRIP_DATA.ROUTES || [];
    const segments = [];
    for (let i = 0; i < items.length - 1; i++) {
      const from = items[i], to = items[i + 1];
      if (!from.placeId || !to.placeId || from.placeId === to.placeId) continue;
      const explicit = explicitRoutes.find(r => r.date === date && r.fromSched === from.id && r.toSched === to.id);
      if (explicit) {
        segments.push(explicit);
        continue;
      }
      const gap = Math.max(10, window.diffMin(from.end || from.start, to.start));
      const durationMin = Math.min(28, Math.max(8, Math.round(gap * 0.35)));
      const bufferMin = 10;
      segments.push({
        date,
        fromSched: from.id,
        toSched: to.id,
        from: from.placeId,
        to: to.placeId,
        mode: gap <= 45 ? "walking" : "driving",
        distance: gap <= 45 ? 0.9 : 5.0,
        durationMin,
        bufferMin,
        dep: window.minToHHMM(window.hhmmToMin(to.start) - durationMin - bufferMin),
        inferred: true,
      });
    }
    return segments;
  },
  fmtTime: (hhmm) => hhmm,
  fmtRange: (s, e) => `${s} – ${e || ""}`,
  dayShort: (date) => {
    const d = DAYS.find(x => x.date === date);
    return d ? `${d.label} · ${date.slice(5).replace("-","/")} (${d.weekday})` : date;
  },
  typeMeta: {
    meeting: { label: "미팅", tone: "blue" },
    event: { label: "행사", tone: "oat" },
    meal: { label: "식사", tone: "lemon" },
    transfer: { label: "이동", tone: "sky" },
    flight: { label: "항공", tone: "blue" },
    hotel: { label: "호텔", tone: "lime" },
    personal: { label: "개인", tone: "neutral" },
    briefing: { label: "브리핑", tone: "pink" },
    other: { label: "기타", tone: "neutral" },
  },
};
