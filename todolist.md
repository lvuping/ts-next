## Todo list


1. **AI 기능 확장**
## Gemini API
Gemini API 는 아래와 같은 방식으로 사용
- .env 에 있는 API 사용 
- "gemini-2.5-flash" 사용(태그, 요약)
- "gemini-2.5-pro" 사용(content 생성)
```
import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
          contents: "Explain how AI works in a few words",
            });
              console.log(response.text);
              }

              main();
```

2. 최상단에 있는 Search, logout, dark mode, light mode 변경등이 특정화면에선 안보여. 일관성을 유지하도록 전체적인 UI 을 점검 후 수정해줘. 

3. 성능향상을 위해 코드 리펙토링을 진행해줘. 성능과 가독성을 위해서 코드리펙토링이 필요해 

## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 마지막 단계에서 pnpm run build 를 실행해줘. 
- pnpm run build 이후에는 기존에 pnpm run start 를 종료처리하고 (3000번 포트) 다시 pnpm run start 로 반영되도록 해줘. 
- build가 성공하면 github 에 반영해줘(git add, commit, push)
