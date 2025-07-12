## Todo list

아래의 최적화 플랜에 근거해서 수정해줘

### 최적화 플랜 (2025-07-12 작성)

#### 전체 최적화 전략
데이터 로딩과 렌더링 성능 개선을 위한 6단계 최적화 플랜

#### Phase 1: 클라이언트 사이드 캐싱 (TanStack Query) ✅ 진행중
- [x] TanStack Query 설치 (`@tanstack/react-query`)
- [x] QueryProvider 생성 (`/src/providers/query-provider.tsx`)
- [x] Root layout에 QueryProvider 통합
- [ ] React Query DevTools 설치 (대기중)
- [ ] 커스텀 데이터 페칭 훅 생성
- [ ] 쿼리 무효화 전략 구현
- [ ] 모든 mutations에 optimistic updates 추가

#### Phase 2: 서버 사이드 페이지네이션
- [ ] `getAllNotes()`에 페이지네이션 파라미터 추가
- [ ] API 라우트에 limit/offset 지원 추가
- [ ] 서버 사이드 필터링과 정렬 구현
- [ ] 클라이언트 컴포넌트를 페이지네이션 API 사용하도록 업데이트

#### Phase 3: HTTP 캐싱 헤더
- [ ] API 응답에 캐시 헤더 추가
- [ ] 조건부 요청을 위한 ETag 지원 구현
- [ ] stale-while-revalidate 패턴 설정
- [ ] 정적 자산에 대한 캐시 제어 추가

#### Phase 4: 데이터베이스 최적화
- [ ] GROUP_CONCAT 쿼리 최적화
- [ ] 데이터베이스 쿼리 결과 캐싱 추가
- [ ] 연결 풀링 구현
- [ ] 복잡한 쿼리를 위한 materialized views 생성

#### Phase 5: Next.js 성능 기능
- [ ] 유익한 경우 더 많은 페이지를 서버 컴포넌트로 변환
- [ ] 개별 노트 페이지에 ISR 구현
- [ ] 대용량 데이터 응답에 스트리밍 추가
- [ ] 적절한 재검증 전략 구성

#### Phase 6: 외부 API 최적화
- [ ] LLM API 호출에 응답 캐싱 추가
- [ ] 요청 큐잉 및 속도 제한 구현
- [ ] 타임아웃 구성 추가
- [ ] API 실패에 대한 폴백 전략 생성

### 진행 상황
- **시작일**: 2025-07-12
- **현재 단계**: Phase 1 - TanStack Query 설치 및 기본 설정 완료
- **다음 작업**: React Query DevTools 설치 및 커스텀 훅 생성

## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 마지막 단계에서 pnpm run build 를 실행해줘.
- pnpm run build 이후에는 기존에 pnpm run start 를 종료처리하고 (3000번 포트) 다시 pnpm run start 로 반영되도록 해줘.
- build가 성공하면 github 에 반영해줘(git add, commit, push)
