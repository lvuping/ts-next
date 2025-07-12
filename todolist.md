## Todo list

1. 글쓰기 모드를 2가지로 나눠줘. (일반모드, 마크다운모드)
2. 일반모드에서도 다양한 포멧을 사용할 수 있도록 editor 기능을 수정해줘.
3. 일반모드로 쓰여진 글도 markodwn mode를 누르면 markdown 으로 변환해서 볼 수 있도록 해주고, 반대로 markdown 글도 일반모드로 누르면 해당 포멧에 맞게 보이도록 해줘.
4. 현재 쓰여진 글은 모두 삭제후, 테스트를 위해 위의 조건에 맞는 4개정도의 글만 새로 생성해줘.
5. 즐겨찾기 기능은 여전히 buggy해. 충분한 테스트를 통해 heart icon의 active inactive 등의 랜더링까지 모두 철저하게 확인해줘.

## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 마지막 단계에서 pnpm run build 를 실행해줘.
- pnpm run build 이후에는 기존에 pnpm run start 를 종료처리하고 (3000번 포트) 다시 pnpm run start 로 반영되도록 해줘.
- build가 성공하면 github 에 반영해줘(git add, commit, push)
