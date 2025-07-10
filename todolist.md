## Todo list
1. Gemini API 를 사용할 수 있도록 수정해줘 
```
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

await main();
```


2. chatGPT 를 사용할 수 있도록 수정해줘.
```
import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
        {
            role: "user",
            content: "Write a one-sentence bedtime story about a unicorn.",
        },
    ],
});

console.log(completion.choices[0].message.content);
```

3. 현재 macOS 에서 control 혹은 command 키를 누르면 note search 기능이 활성화 되는데, Control 키를 짧게 2번 누르면 활성화 되도록 수정해. 
## Must check
- 모든 수정후엔 반드시 기능 테스트를 진행해줘. (route, event)
- 통합 테스트를 진행하고 변경된 내용을 github 에 반영해줘(git add, commit, push)
