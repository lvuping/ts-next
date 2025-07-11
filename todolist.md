## Todo list

0. 아래 요구사항을 성능과 코드유지보를 고려해서 수정해줘. 
1. 요약하기 기능을 사용하고 새로고침하면 해당 내용이 삭제 되는데, 저장하도록 해줘. Database 에 필드를 만들어서 저장해야할 것으로 보여져. 

2. 상단에서 언어 설정을 할 수 있도록 해주고, 해당 언어를 기반으로 API 응답을 받아 정리할 수 있도록 해줘.(현재 요약하기 기능은 언제나 영어로 작성되고 있어.) 

3. 모바일뷰도 지원하도록 해줘. 현재 모바일뷰에서 좌측의 패널을 볼 수가 없어. 홈으로 가는게 어려운 상황 

4. 모든 페이지에서 Search function 이 동작하도록 해줘 ( 아이콘, 단축키) 

5. Content View 모드일 때 Markdown 랜더링을 제대로 표현할 수 있도록 해줘. Mermaid diagram 포함


** AI 기능 확장**
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
