## Todo list

- New note 의 레이아웃과, 홈화면에서 노트들을 볼때의 layout 과 비슷하게 만들어줘. 지금은 여백이 너무 넓어.

### 🚀 High Priority (단기 목표)
1. **Export 기능 추가**
   - Markdown 파일로 내보내기
   - Markdown 파일로 import
   - 선택한 노트들 일괄 내보내기
   
2. **노트 버전 관리**
   - 변경사항 diff 보기

3. **성능 최적화**
   - 가상 스크롤링 구현 (대량 노트 처리)
   - 이미지 및 코드 지연 로딩
   - 검색 인덱싱 개선

3. **AI 기능 확장**
   - 자동 태그 제안
   - 노트 요약 기능 

## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 마지막 단계에서 pnpm run build 를 실행해줘. 
- pnpm run build 이후에는 기존에 pnpm run start 를 종료처리하고 (3000번 포트) 다시 pnpm run start 로 반영되도록 해줘. 
- build가 성공하면 github 에 반영해줘(git add, commit, push)
