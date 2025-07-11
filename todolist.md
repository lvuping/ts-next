## Todo list

1. 모든 페이지에서 Search function 이 동작중인데, Command Space 를 누르면 트리거가 되도록 해줘(Windows 의 경우는 Alt+Space). 지금은 Control + anykey 를 누르면 계속 켜져서, Control + V 같은 붙여넣기 기능이 동작하지 않아. 

2. Content View 모드일 때 Markdown 랜더링을 제대로 표현할 수 있도록 해줘. 현재는 표현이 잘 안되고 있어. 다른 노트앱들은 어떻게 Markdown 을 랜더링 해주는지, (ex: obsidian) 파악후 수정해줘.  Mermaid diagram 포함되도록 해줘. 

3. 처음 노트를 만들때, Create note 를 누른후 또 다시 save changes 항목으로 가는건 이상해. 수정해줘. 

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
