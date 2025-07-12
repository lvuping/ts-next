## Todo list

즐겨찾기 기능을 시도하면 아래와 같이 에러가 나. 문제를 해결해

```
page-fdcdf6a5efb9b23f.js:1  POST http://localhost:3000/api/notes/1752303438636-4m0r3w7bn/favorite net::ERR_ABORTED 405 (Method Not Allowed)
(anonymous) @ page-fdcdf6a5efb9b23f.js:1
iX @ c7d45821-7133b2a362b34475.js:1
(anonymous) @ c7d45821-7133b2a362b34475.js:1
nS @ c7d45821-7133b2a362b34475.js:1
i2 @ c7d45821-7133b2a362b34475.js:1
s7 @ c7d45821-7133b2a362b34475.js:1
s5 @ c7d45821-7133b2a362b34475.js:1Understand this error
1722-0b0571a0eb91ff21.js:1 Failed to toggle favorite status
window.console.error @ 1722-0b0571a0eb91ff21.js:1
(anonymous) @ page-fdcdf6a5efb9b23f.js:1
await in (anonymous)
iX @ c7d45821-7133b2a362b34475.js:1
(anonymous) @ c7d45821-7133b2a362b34475.js:1
nS @ c7d45821-7133b2a362b34475.js:1
i2 @ c7d45821-7133b2a362b34475.js:1
s7 @ c7d45821-7133b2a362b34475.js:1
s5 @ c7d45821-7133b2a362b34475.js:1Understand this error
page-fdcdf6a5efb9b23f.js:1  POST http://localhost:3000/api/notes/1752298368049-rj7tn89ss/favorite 405 (Method Not Allowed)
(anonymous) @ page-fdcdf6a5efb9b23f.js:1
iX @ c7d45821-7133b2a362b34475.js:1
(anonymous) @ c7d45821-7133b2a362b34475.js:1
nS @ c7d45821-7133b2a362b34475.js:1
i2 @ c7d45821-7133b2a362b34475.js:1
s7 @ c7d45821-7133b2a362b34475.js:1
s5 @ c7d45821-7133b2a362b34475.js:1Understand this error
1722-0b0571a0eb91ff21.js:1 Failed to toggle favorite status

```

## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 마지막 단계에서 pnpm run build 를 실행해줘.
- pnpm run build 이후에는 기존에 pnpm run start 를 종료처리하고 (3000번 포트) 다시 pnpm run start 로 반영되도록 해줘.
- build가 성공하면 github 에 반영해줘(git add, commit, push)
