## Todo list

1. 노트 즐겨찾기 기능이 정상적으로 동작하지 않아. 하나를 클릭하면 다른한쪽이 풀린다던지 buggy 해. 종합적으로 테스트가 필요해
2. 글을 모두 markdown 으로 생성해주고, markdown 으로 랜더링 되도록해줘. 그리고 생성된 글속에 코드가 있다면 마크다운 문법과 같이 표현해줘 (예시 아래 )
```python
print("hello")
```

3. All notes 에서 모두 markdown native rendering 을 지원해줘.
4. preview mode도 markdown format을 우선적으로 지원해줘.
5. language 항목을 삭제해줘.
5. Category 선택하는 UI/UX를 개선해줘.

## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 마지막 단계에서 pnpm run build 를 실행해줘.
- pnpm run build 이후에는 기존에 pnpm run start 를 종료처리하고 (3000번 포트) 다시 pnpm run start 로 반영되도록 해줘.
- build가 성공하면 github 에 반영해줘(git add, commit, push)
