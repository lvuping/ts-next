## Todo list

1. 글쓰기 모드일때, Layout, input form  이 효율적이지 못한 것 같아.  
다른 노트앱의 Best practice 를 참조해서 수정해줘. 기존과 같이 AI assist 라고 적어주는게 좋겠어. 그 부분이 삭제되서 기능 이해가 어려워.
2. Note title 부분의 스타일링이 이상해졌어.

3. Language, Category 부분의 사이즈나 레이아웃이 어색해. 고민후 수정해줘. 
4. Tag 부분도 이전의 상태가 더 나은거 같아. 조금더 모던하고 이쁜 디자인으로 변경해줘.
5. 글쓰기 모드의 layout, 디자인을 더 이쁘게 해줘. 

```
## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 마지막 단계에서 pnpm run build 를 실행해줘. 
- pnpm run build 이후에는 기존에 pnpm run start 를 종료처리하고 (3000번 포트) 다시 pnpm run start 로 반영되도록 해줘. 
- build가 성공하면 github 에 반영해줘(git add, commit, push)
