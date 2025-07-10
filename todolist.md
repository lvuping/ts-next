## Todo list

1. SQLite 를 연동해서 글이 작성되고 있는지 확인해줘. 기존에 있던글들도 SQLite 에 마이그레이션 해줘.
2. 좌측의 Search input에서 한번에 한글자를 입력할때마다 조회를해서 성능상 딜레이가 있는것같아. 입력하다가 멈췄을때, 검색이 되도록해줘 (best practice를 찾아서 같은 시간의 delay를 줘.)
3. control key 2번을 입력해서 note에 진입하면 edit 모드가 아닌 view 모드로 보이게 해줘.
4. 기본적으로 note를 들어가면 view 모드로 보여지게 해줘. 
## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 마지막 단계에서 pnpm run build 를 실행해줘. 
- build가 성공하면 github 에 반영해줘(git add, commit, push)
