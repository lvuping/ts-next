## Todo list

### 🎯 Completed (December 2024)
- ✅ New note 의 레이아웃과, note view 모드일 때의 레이아웃이 일치하도록 해줘.
- ✅ New note 의 content 입력창이 너무 작아졌어. note app의 best practice 사례를 찾아 모방해줘. 
- ✅ Categories 의 아이콘에 색상이 다른 아이콘들과 어울리지 않아. Shadcn의 스타일링과 어울리게 수정해줘

### 🚀 High Priority (단기 목표)
1. **Export 기능 추가**
   - Markdown 파일로 내보내기
   - JSON 형식으로 백업
   - 선택한 노트들 일괄 내보내기
   
2. **검색 기능 개선**
   - 정규표현식 검색 지원
   - 검색 필터 (날짜, 언어, 카테고리)
   - 검색 결과 하이라이팅
   
3. **노트 버전 관리**
   - 수정 이력 저장
   - 이전 버전으로 복원
   - 변경사항 diff 보기

4. **성능 최적화**
   - 가상 스크롤링 구현 (대량 노트 처리)
   - 이미지 및 코드 지연 로딩
   - 검색 인덱싱 개선

### 📊 Medium Priority (중기 목표)
1. **협업 기능**
   - 노트 공유 링크 생성
   - 읽기 전용 공유
   - 댓글 기능

2. **GitHub Integration**
   - Gist로 자동 백업
   - GitHub 저장소와 동기화
   - Pull Request 템플릿 생성

3. **AI 기능 확장**
   - 자동 태그 제안
   - 코드 품질 분석
   - 유사한 노트 추천

4. **PWA (Progressive Web App)**
   - 오프라인 지원
   - 푸시 알림
   - 홈 화면 추가

### 🌟 Low Priority (장기 목표)
1. **다중 사용자 지원**
   - 사용자 계정 시스템
   - 권한 관리
   - 팀 워크스페이스

2. **모바일 앱**
   - React Native 앱 개발
   - 실시간 동기화
   - 네이티브 기능 활용

3. **플러그인 시스템**
   - 커스텀 언어 지원
   - 외부 서비스 연동
   - 테마 마켓플레이스

4. **고급 분석**
   - 코드 사용 통계
   - 학습 패턴 분석
   - 생산성 대시보드

## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 마지막 단계에서 pnpm run build 를 실행해줘. 
- pnpm run build 이후에는 기존에 pnpm run start 를 종료처리하고 (3000번 포트) 다시 pnpm run start 로 반영되도록 해줘. 
- build가 성공하면 github 에 반영해줘(git add, commit, push)