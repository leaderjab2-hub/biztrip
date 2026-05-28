# Executive Trip Planner 웹앱 개발 기획서

## 1. 프로젝트 개요

### 제품 목적

회사에서 자주 발생하는 해외/국내 출장을 효율적으로 관리하기 위한 웹 및 모바일 대응 웹앱을 만든다.

이 앱은 여러 명이 협업하는 복잡한 출장 관리 시스템이 아니라, **출장 담당자 1명이 직접 출장 일정을 만들고 관리하며, 필요 시 임원에게 모바일 공유 링크로 일정을 보여주는 도구**다.

핵심은 다음과 같다.

- 출장 기간 관리
- 임원 및 구성원 관리
- 국가/도시 관리
- 항공편 관리
- 호텔 관리
- Day별 일정 관리
- 임원별/구성원별 서로 다른 일정 관리
- 미팅 상세 정보 관리
- 행사 개요 관리
- 장소 기반 이동 동선 및 이동 시간 자동 계산
- 권장 출발 시간 계산
- 모바일에서 보기 좋은 임원용 공유 화면
- 필요 시 PDF/엑셀 출력 확장 가능

---

## 2. 제품 방향성

### 제품 정의

**Executive Trip Planner**는 출장 오너가 출장 전체 일정을 설계하고, 사람별 일정과 장소 간 이동 시간을 자동으로 정리해주는 반응형 웹앱이다.

PC에서는 입력과 편집이 쉽고, 모바일에서는 현장에서 바로 확인하기 쉬워야 한다.

### 주요 사용자

#### 1차 사용자

- 출장 담당자 본인
- 앱을 만들고, 데이터를 입력하고, 출장 일정을 관리하는 사람

#### 2차 사용자

- 임원
- 별도 로그인 없이 공유 링크를 통해 본인 일정, 다음 이동, 미팅 토킹 포인트를 확인하는 사람

### 제외할 기능

다음 기능은 1차 범위에서 제외한다.

- 변경 알림
- 복잡한 권한 관리
- 다중 사용자 협업
- 승인 프로세스
- 캘린더 연동
- 자료/문서 관리
- 체크리스트
- 복잡한 출장비 정산
- 메신저/슬랙/카카오 알림

---

## 3. 핵심 요구사항

## 3.1 출장 생성 및 관리

출장 하나는 전체 워크스페이스 역할을 한다.

### 필수 필드

- 출장명
- 출장 목적
- 국가
- 도시
- 출장 시작일
- 출장 종료일
- 현지 타임존
- 상태
  - 작성중
  - 확정
  - 진행중
  - 종료

### 예시

```text
출장명: 2026 싱가포르 IR Roadshow
목적: 투자자 미팅 및 파트너십 논의
국가: Singapore
도시: Singapore
기간: 2026-06-10 ~ 2026-06-14
타임존: Asia/Singapore
상태: 작성중
```

---

## 3.2 출장자 관리

출장자는 임원과 구성원으로 나눈다.

### 필수 필드

- 이름
- 구분
  - executive
  - member
- 역할/직책
- 이메일
- 전화번호
- 메모

### 예시

```text
이름: 김대표
구분: executive
역할: CEO
이메일: ceo@example.com
전화번호: +82-10-0000-0000
```

### 중요 요구사항

사람별 일정이 다를 수 있어야 한다.

예를 들어 같은 출장 안에서도 다음과 같은 상황이 가능해야 한다.

- CEO는 A사 미팅 참석
- CFO는 같은 시간 B사 미팅 참석
- 수행원은 CEO 일정만 따라감
- 전략팀장은 모든 미팅 참석

따라서 일정은 출장 전체에 고정되는 것이 아니라, 각 일정마다 참석자를 지정하는 방식이어야 한다.

---

## 3.3 항공편 관리

항공편은 출장 전체에 하나만 있는 것이 아니라, 항공편별로 탑승자를 지정할 수 있어야 한다.

### 필수 필드

- 구분
  - outbound
  - return
  - local
- 항공사
- 편명
- 출발 공항
- 도착 공항
- 출발 시간
- 도착 시간
- 탑승자
- 좌석
- 예약번호
- 메모

### 시간 정책

- 출국 항공편 출발 시간은 출발지 현지 시간 기준
- 출국 항공편 도착 시간은 도착지 현지 시간 기준
- 귀국 항공편 출발 시간은 출발지 현지 시간 기준
- 귀국 항공편 도착 시간은 도착지 현지 시간 기준
- 한국 귀국 도착은 한국 시간으로 표시
- 항공편을 제외한 모든 일정은 출장지 현지 시간 기준

### 예시

```text
구분: outbound
항공사: Korean Air
편명: KE645
출발: ICN 2026-06-10 10:30
도착: SIN 2026-06-10 16:00
탑승자: CEO, CFO, 수행원
좌석: 2A, 2B, 18C
예약번호: ABC123
```

---

## 3.4 호텔 관리

호텔은 장소 객체와 연결되어야 한다. 호텔 주소는 Day별 이동 동선 계산의 출발지 또는 도착지로 사용할 수 있어야 한다.

### 필수 필드

- 호텔명
- 주소
- 장소 좌표
- 체크인 날짜/시간
- 체크아웃 날짜/시간
- 투숙자
- 객실 정보
- 예약번호
- 조식 여부
- 메모

### 예시

```text
호텔명: Marina Bay Sands
주소: 10 Bayfront Ave, Singapore
체크인: 2026-06-10 17:00
체크아웃: 2026-06-14 11:00
투숙자: CEO, CFO, 수행원
객실 정보: CEO Suite, CFO Deluxe, Staff Twin
```

---

## 3.5 Day별 일정 관리

출장 일정은 Day별로 관리한다.

각 일정은 날짜, 시간, 유형, 장소, 참석자를 가진다.

### 일정 유형

- meeting
- event
- meal
- transfer
- flight
- hotel
- personal
- briefing
- other

### 필수 필드

- 일정 제목
- 날짜
- 시작 시간
- 종료 시간
- 일정 유형
- 장소
- 참석자
- 설명
- 이동 버퍼 시간

### 예시

```text
일정명: A사 미팅
날짜: 2026-06-11
시간: 09:30 ~ 10:30
유형: meeting
장소: A Company HQ
참석자: CEO, CFO, 전략팀장
설명: 파트너십 논의
버퍼: 15분
```

### 필터 기능

일정표에서는 다음 필터가 필요하다.

- 전체 일정 보기
- 임원별 보기
- 구성원별 보기
- 일정 유형별 보기
- Day별 보기

---

## 3.6 미팅 상세 관리

미팅 일정은 별도의 상세 정보를 가진다.

### 필수 필드

- 미팅명
- 일시
- 장소
- 내부 참석자
- 상대 회사
- 상대측 참석자
- 상대측 참석자 직함
- 미팅 목적
- 주요 아젠다
- 주요 토킹 포인트
- 주의사항
- 후속 액션
- 메모

### 예시

```text
미팅명: ABC Capital 미팅
상대 회사: ABC Capital
상대 참석자:
- John Smith / Managing Partner
- Jane Lee / Principal
목적: 투자자 관계 강화 및 사업 현황 공유
아젠다:
1. 회사 소개
2. 최근 실적 공유
3. 글로벌 확장 전략
4. Q&A
토킹 포인트:
- 동남아 시장 성장성
- 신규 제품 출시 일정
- 파트너십 기회
주의사항:
- 미공개 실적 수치 언급 금지
후속 액션:
- IR Deck 송부
- 다음 미팅 일정 조율
```

---

## 3.7 행사 정보 관리

행사가 있는 경우 행사 개요를 별도로 관리하고, 관련 일정과 연결할 수 있어야 한다.

### 필수 필드

- 행사명
- 주최 기관
- 장소
- 기간
- 참석 목적
- 참석자
- 주요 세션
- 드레스코드
- 메모

### 예시

```text
행사명: Global Tech Summit 2026
주최: Global Tech Association
장소: Singapore Convention Center
기간: 2026-06-11 ~ 2026-06-12
참석 목적: 네트워킹 및 파트너 발굴
참석자: CEO, CTO, 전략팀장
주요 세션:
- AI Infrastructure Panel
- Global Expansion Roundtable
드레스코드: Business Formal
```

---

## 3.8 장소 및 이동 동선 자동 계산

이 앱의 핵심 차별 기능이다.

사용자가 일정별 장소를 입력하면 앱이 자동으로 장소 간 이동 시간과 권장 출발 시간을 계산해야 한다.

### 장소 입력 방식

장소명 입력 시 자동완성 검색을 제공한다.

예:

```text
Conrad Tokyo
A Company HQ
Singapore Convention Center
Marina Bay Sands
```

장소 선택 시 다음 데이터를 저장한다.

- 장소명
- 주소
- 위도
- 경도
- Google Place ID 또는 유사한 외부 장소 ID
- 지도 링크

### 이동 시간 계산 방식

같은 Day 안에서 시간 순서대로 장소가 있는 일정을 정렬한다.

연속된 일정의 장소가 다르면 다음 정보를 계산한다.

- 출발 장소
- 도착 장소
- 이동수단
  - driving
  - walking
  - transit
- 예상 이동 거리
- 예상 이동 시간
- 권장 출발 시간
- 지도 링크

### 권장 출발 시간 계산

```text
권장 출발 시간 = 다음 일정 시작 시간 - 예상 이동 시간 - 버퍼 시간
```

예:

```text
다음 미팅 시작: 10:00
이동 시간: 25분
버퍼: 15분
권장 출발: 09:20
```

### 이동 동선 예시

| 순서 | 출발 | 도착 | 수단 | 예상 시간 | 버퍼 | 권장 출발 |
|---|---|---|---|---|---|---|
| 1 | 호텔 | A사 본사 | 차량 | 22분 | 15분 | 09:23 |
| 2 | A사 본사 | B사 오피스 | 차량 | 18분 | 15분 | 10:27 |
| 3 | B사 오피스 | 식당 | 도보 | 7분 | 10분 | 12:13 |

### API 후보

해외 출장 중심이므로 Google Maps Platform 사용을 우선 고려한다.

필요 API:

- Places API
  - 장소 검색 및 자동완성
- Geocoding API
  - 주소와 좌표 변환
- Directions API 또는 Routes API
  - 장소 간 이동 경로와 시간 계산
- Maps JavaScript API
  - 지도 표시

---

## 4. 화면 구성

## 4.1 출장 목록 화면

사용자가 만든 출장 리스트를 카드 형태로 보여준다.

### 카드 정보

- 출장명
- 국가/도시
- 기간
- 주요 참석자
- 상태
- 미팅 수
- 행사 수

### 예시

```text
2026 싱가포르 IR Roadshow
Singapore / Singapore
2026-06-10 ~ 2026-06-14
참석자: CEO, CFO, 전략팀장
상태: 작성중
미팅 7건 / 행사 1건
```

---

## 4.2 출장 상세 대시보드

출장 하나를 열었을 때 첫 화면이다.

### 표시 정보

- 출장명
- 목적
- 국가/도시
- 기간
- 현지 타임존
- 참석자 요약
- 항공 요약
- 호텔 요약
- Day별 일정 요약
- 미팅 수
- 행사 수
- 이동 구간 수

---

## 4.3 Day별 일정 편집 화면

가장 중요한 관리 화면이다.

PC에서는 테이블형으로 빠르게 입력하고, 모바일에서는 카드형으로 보여준다.

### PC 테이블 예시

| 시간 | 유형 | 일정 | 참석자 | 장소 | 이동 |
|---|---|---|---|---|---|
| 09:00 | transfer | 호텔 출발 | CEO, 수행원 | Conrad Tokyo | - |
| 09:30 | meeting | A사 미팅 | CEO, CFO | A사 본사 | 이전 장소에서 차량 22분 |
| 11:00 | meeting | B사 미팅 | CFO | B사 오피스 | 이전 장소에서 차량 18분 |
| 12:30 | meal | 오찬 | CEO, CFO | Restaurant C | 이전 장소에서 도보 7분 |

### 필요한 편집 기능

- 일정 추가
- 일정 수정
- 일정 삭제
- 일정 순서 변경
- 참석자 선택
- 장소 검색
- 일정 복사
- Day 복사
- 이동 시간 다시 계산

---

## 4.4 미팅 상세 화면

미팅 일정 클릭 시 상세 정보를 입력하고 확인한다.

### 섹션

- 기본 정보
- 내부 참석자
- 상대측 참석자
- 미팅 목적
- 아젠다
- 토킹 포인트
- 주의사항
- 후속 액션
- 메모

---

## 4.5 동선 화면

Day별 이동 구간을 한눈에 볼 수 있는 화면이다.

### 표시 정보

- Day 선택
- 참석자 필터
- 이동 구간 목록
- 지도 보기
- 이동수단
- 이동 시간
- 권장 출발 시간
- 지도 앱 열기 링크

### 모바일에서 중요한 버튼

- Google Maps 열기
- Apple Maps 열기
- 현재 위치에서 목적지 열기

---

## 4.6 임원용 모바일 공유 화면

임원에게 공유할 수 있는 읽기 전용 화면이다.

복잡한 로그인은 만들지 않는다.

공유 URL에 토큰을 붙여 접근할 수 있게 한다.

### 예시 URL

```text
/share/trips/{shareToken}
/share/trips/{shareToken}?personId={personId}
```

### 임원용 화면에서 보여줄 정보

- 출장명
- 기간
- 국가/도시
- 본인 일정만 보기
- 오늘 일정
- 다음 일정
- 다음 이동 권장 출발 시간
- 장소 주소
- 지도 열기
- 미팅 토킹 포인트
- 상대측 참석자
- 호텔 정보
- 항공편 정보

### 모바일 카드 예시

```text
09:30 - 10:30
A사 미팅
장소: A Company HQ
참석: CEO, CFO
이동: 호텔에서 차량 22분
권장 출발: 09:00

토킹 포인트
- 동남아 시장 성장성
- 신규 제품 출시 일정
- 파트너십 기회

지도 열기
```

---

## 5. 데이터 모델 초안

## 5.1 Trip

```ts
type Trip = {
  id: string;
  title: string;
  purpose?: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  localTimezone: string;
  status: 'draft' | 'confirmed' | 'ongoing' | 'completed';
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5.2 Person

```ts
type Person = {
  id: string;
  tripId: string;
  name: string;
  type: 'executive' | 'member';
  role?: string;
  email?: string;
  phone?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5.3 Place

```ts
type Place = {
  id: string;
  tripId: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  externalPlaceId?: string;
  mapUrl?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5.4 ScheduleItem

```ts
type ScheduleItem = {
  id: string;
  tripId: string;
  date: string;
  type: 'meeting' | 'event' | 'meal' | 'transfer' | 'flight' | 'hotel' | 'personal' | 'briefing' | 'other';
  title: string;
  startTime: string;
  endTime?: string;
  placeId?: string;
  description?: string;
  bufferMinutes: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5.5 ScheduleParticipant

```ts
type ScheduleParticipant = {
  id: string;
  scheduleItemId: string;
  personId: string;
};
```

---

## 5.6 MeetingDetail

```ts
type MeetingDetail = {
  id: string;
  scheduleItemId: string;
  counterpartCompany?: string;
  counterpartPeople?: Array<{
    name: string;
    title?: string;
    organization?: string;
    memo?: string;
  }>;
  objective?: string;
  agenda?: string[];
  talkingPoints?: string[];
  cautionNotes?: string[];
  followUpActions?: string[];
  memo?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5.7 EventDetail

```ts
type EventDetail = {
  id: string;
  scheduleItemId?: string;
  tripId: string;
  name: string;
  host?: string;
  placeId?: string;
  startDate: string;
  endDate: string;
  purpose?: string;
  attendeePersonIds?: string[];
  sessions?: Array<{
    title: string;
    startTime?: string;
    endTime?: string;
    place?: string;
    memo?: string;
  }>;
  dressCode?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5.8 RouteSegment

```ts
type RouteSegment = {
  id: string;
  tripId: string;
  date: string;
  fromScheduleItemId: string;
  toScheduleItemId: string;
  fromPlaceId: string;
  toPlaceId: string;
  travelMode: 'driving' | 'walking' | 'transit';
  distanceMeters?: number;
  durationMinutes?: number;
  bufferMinutes: number;
  recommendedDepartureTime?: string;
  mapUrl?: string;
  rawApiResponse?: unknown;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5.9 Flight

```ts
type Flight = {
  id: string;
  tripId: string;
  type: 'outbound' | 'return' | 'local';
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  departureTime: string;
  arrivalTime: string;
  departureTimezone?: string;
  arrivalTimezone?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5.10 FlightPassenger

```ts
type FlightPassenger = {
  id: string;
  flightId: string;
  personId: string;
  seat?: string;
  bookingReference?: string;
};
```

---

## 5.11 Hotel

```ts
type Hotel = {
  id: string;
  tripId: string;
  name: string;
  placeId?: string;
  checkinTime?: string;
  checkoutTime?: string;
  roomInfo?: string;
  bookingReference?: string;
  breakfastIncluded?: boolean;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5.12 HotelGuest

```ts
type HotelGuest = {
  id: string;
  hotelId: string;
  personId: string;
  roomName?: string;
};
```

---

## 6. MVP 범위

## 6.1 1차 필수 범위

반드시 구현해야 하는 기능은 다음과 같다.

1. 출장 CRUD
2. 출장자 CRUD
3. 임원/구성원 구분
4. 항공편 CRUD
5. 항공편별 탑승자 지정
6. 호텔 CRUD
7. 호텔별 투숙자 지정
8. Day별 일정 CRUD
9. 일정별 참석자 지정
10. 미팅 상세 정보 CRUD
11. 행사 정보 CRUD
12. 장소 검색 및 저장
13. 장소 간 이동 시간 자동 계산
14. 권장 출발 시간 계산
15. Day별 동선 화면
16. 모바일 반응형 UI
17. 임원별 공유 링크
18. 공유 링크에서 읽기 전용 일정 확인

---

## 6.2 후순위 기능

다음은 MVP 이후 구현한다.

1. PDF 출력
2. 엑셀 출력
3. 지도 위 전체 동선 표시
4. 일정 템플릿
5. Day 복사
6. 미팅 후속 액션 관리 고도화
7. 출장 비용 관리
8. 다국어 UI

---

## 7. 권한 및 공유 정책

복잡한 권한 관리는 만들지 않는다.

### 기본 정책

- 앱 소유자 1명이 모든 데이터를 생성/수정/삭제한다.
- 임원은 공유 링크로 읽기만 가능하다.
- 공유 링크에는 토큰을 사용한다.
- 공유 링크에서는 수정 기능을 제공하지 않는다.

### 공유 방식

- 전체 출장 공유 링크
- 특정 임원 일정만 보이는 공유 링크

### 예시

```text
/share/trips/{shareToken}
/share/trips/{shareToken}?personId=ceo-person-id
```

---

## 8. UX 원칙

## 8.1 PC UX

PC에서는 빠른 입력과 편집이 중요하다.

중요한 UX:

- 테이블 기반 일정 입력
- 장소 자동완성
- 참석자 체크박스
- 일정 복사
- 일정 순서 변경
- Day별 일정 한눈에 보기
- 필터 기능

---

## 8.2 모바일 UX

모바일에서는 현장에서 바로 확인하는 것이 중요하다.

중요한 UX:

- 오늘 일정 우선 표시
- 다음 일정 강조
- 권장 출발 시간 강조
- 지도 열기 버튼
- 미팅 토킹 포인트 바로 보기
- 상대측 참석자 바로 보기
- 항공/호텔 정보 빠른 접근

---

## 9. 추천 기술 스택

실제 구현 시 다음 스택을 권장한다.

### 프론트엔드/풀스택

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

### 데이터베이스

- PostgreSQL
- Prisma ORM

### 인증

- 초기 MVP에서는 단일 사용자 로그인만 구현
- NextAuth/Auth.js 또는 Supabase Auth 사용 가능

### 지도/장소 API

- Google Maps Platform
  - Places API
  - Geocoding API
  - Directions API 또는 Routes API
  - Maps JavaScript API

### 배포

- Vercel
- Supabase 또는 Neon PostgreSQL

---

## 10. 환경변수 예시

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_MAPS_API_KEY="..."
```

---

## 11. 구현 시 주의사항

1. 모든 미팅, 행사, 이동 일정은 기본적으로 출장지 현지 시간으로 저장하고 보여준다.
2. 항공편만 출발지/도착지 타임존을 따로 다룬다.
3. 일정은 사람별로 다르게 필터링할 수 있어야 한다.
4. 이동 시간 계산은 장소 좌표가 있는 일정끼리만 수행한다.
5. 장소가 없는 일정은 동선 계산에서 제외하거나 수동 입력 가능하게 한다.
6. 임원 공유 화면은 로그인 없이 접근 가능하되, 예측 어려운 shareToken을 사용한다.
7. 공유 화면은 읽기 전용이어야 한다.
8. 모바일에서 지도 앱을 여는 버튼을 제공한다.
9. 지도 API 실패 시 수동 이동 시간 입력을 허용한다.
10. 처음부터 알림, 캘린더 연동, 문서 관리, 체크리스트는 구현하지 않는다.

---

## 12. Claude Code 실행용 프롬프트

아래 프롬프트를 Claude Code에 입력해서 개발을 시작한다.

```text
너는 숙련된 풀스택 엔지니어야.

아래 Markdown 기획서를 기준으로 Executive Trip Planner라는 웹앱을 구현해줘.

목표는 출장 담당자 1명이 임원 출장 일정을 만들고, 사람별 일정과 이동 동선을 관리하며, 임원에게 모바일 공유 링크로 일정을 보여줄 수 있는 반응형 웹앱이야.

우선 MVP를 구현해줘.

기술 스택은 다음을 사용해줘.

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- React Hook Form
- Zod

초기 구현 범위는 다음이야.

1. 프로젝트 기본 구조 생성
2. Prisma schema 작성
3. Trip CRUD
4. Person CRUD
5. Flight CRUD 및 탑승자 연결
6. Hotel CRUD 및 투숙자 연결
7. Place 모델 및 장소 저장 구조
8. Day별 ScheduleItem CRUD
9. ScheduleItem별 참석자 연결
10. MeetingDetail CRUD
11. EventDetail CRUD
12. RouteSegment 모델과 이동 시간 계산 구조
13. Day별 일정 화면
14. 사람별 일정 필터
15. 동선 화면
16. 임원용 shareToken 기반 읽기 전용 모바일 공유 화면
17. 반응형 UI

지도 API는 실제 Google Maps API 연동 전이라도 좋으니, 다음 구조로 구현해줘.

- 장소 검색 함수는 추상화해서 lib/maps.ts에 작성
- 이동 시간 계산 함수도 lib/maps.ts에 작성
- 실제 API 키가 없으면 mock 데이터로 동작하게 작성
- 나중에 Google Places API, Geocoding API, Directions API 또는 Routes API로 교체하기 쉽게 만들어줘

중요한 정책은 다음과 같아.

- 변경 알림은 만들지 마
- 복잡한 권한 관리는 만들지 마
- 캘린더 연동은 만들지 마
- 자료/문서 관리는 만들지 마
- 체크리스트는 만들지 마
- 모든 일반 일정은 출장지 현지 시간 기준으로 다뤄
- 항공편만 출발지/도착지 타임존을 별도로 가질 수 있게 해
- 공유 화면은 읽기 전용이야
- 공유 링크는 /share/trips/[shareToken] 형태로 만들어줘
- personId 쿼리 파라미터가 있으면 해당 사람의 일정만 보여줘

먼저 전체 구현 계획을 짧게 설명한 다음, 파일을 실제로 생성/수정하면서 구현해줘.
구현 중에는 타입 안정성, 데이터 모델 정합성, 모바일 UI 가독성을 중요하게 봐줘.
```

---

## 13. 개발 순서 제안

Claude Code에 한 번에 모든 것을 구현시키기보다 아래 순서로 나눠 진행하면 안정적이다.

### Step 1. 프로젝트 및 DB 구조

- Next.js 프로젝트 생성
- Tailwind/shadcn 세팅
- Prisma 세팅
- 데이터 모델 작성
- 마이그레이션

### Step 2. 기본 CRUD

- Trip
- Person
- Place
- Flight
- Hotel

### Step 3. 일정 관리

- ScheduleItem
- ScheduleParticipant
- Day별 일정 화면
- 사람별 필터

### Step 4. 미팅/행사 상세

- MeetingDetail
- EventDetail
- 상세 입력 화면

### Step 5. 동선 계산

- RouteSegment
- lib/maps.ts
- mock 이동 시간 계산
- 권장 출발 시간 계산
- Day별 동선 화면

### Step 6. 공유 화면

- shareToken 생성
- 읽기 전용 공유 페이지
- personId별 필터링
- 모바일 최적화

---

## 14. 최종 성공 기준

MVP가 완성되면 다음 시나리오가 가능해야 한다.

1. 사용자가 새 출장을 만든다.
2. CEO, CFO, 수행원을 등록한다.
3. 항공편과 호텔을 입력한다.
4. Day 1, Day 2 일정들을 만든다.
5. 각 일정마다 참석자를 지정한다.
6. 미팅마다 상대 회사, 상대 참석자, 토킹 포인트를 입력한다.
7. 장소를 입력하면 일정 간 이동 시간이 계산된다.
8. 앱이 권장 출발 시간을 보여준다.
9. 사용자가 CEO용 공유 링크를 만든다.
10. CEO는 모바일에서 본인 일정, 다음 이동, 미팅 토킹 포인트, 지도 링크를 확인한다.
```
