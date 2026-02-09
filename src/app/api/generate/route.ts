import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

/** AI 생성 장면 응답 형식 (500자 내외 JSON) */
export type GenerateSceneResponse = {
  heading: string;
  paragraphs: string[];
  imagePrompt: string; // 이미지 생성용 프롬프트
  imageUrl?: string; // 생성된 이미지 URL (서버에서 추가)
};

const MODEL = "gpt-4o"; // 또는 "gpt-3.5-turbo"로 변경 가능

const SYSTEM_PROMPT = `당신은 '태오 vs 도진' 로맨스 웹소설을 쓰는 베스트셀러 작가입니다. 독자의 선택 한 줄로 운명이 뒤집히는 '역성혁명' 장면을 씁니다.

【캐릭터 성격 (절대 변하지 않음 - 반드시 일관되게 유지)】

**태오**:
- 성격: 집착적이고 강압적. 도진을 소유하려는 욕망이 강함.
- 말투: 확고하고 단정적. 명령형이나 강한 어조 사용. "~야", "~해", "~거야" 같은 단정적인 종결어미.
- 예시: "넌 내 거야.", "도진아, 나한테로 와.", "이번엔 절대 놓치지 않겠어."
- 행동: 적극적이고 주도적. 도진을 향해 직접적으로 다가감.

**도진**:
- 성격: 유약하고 수동적. 결정을 내리기 어려워함.
- 말투: 말끝을 흐리거나 떨리는 말투. "~인 것 같아...", "~할까...", "~지 않을까..." 같은 불확실한 종결어미.
- 예시: "그런... 그런 게 아닌데...", "태오야, 나는...", "어떻게 해야 할지 모르겠어..."
- 행동: 소극적이고 망설임. 태오의 강압에 밀리는 경향.

**서윤**:
- 성격: 결혼식장에서 버림받은 비극의 당사자. 상처받았지만 내면에 강함이 있음.
- 말투: 상황에 따라 변화하지만, 기본적으로 차분하고 단정적.

【작성 원칙】
- 독자의 '한 줄'을 확성기처럼 활용해, 그 한 줄이 곧 반전이 되도록 장면을 설계하세요.
- 긴장감, 반전, 감정선을 최대한 살려서 **자극적이고 재미있게** 쓰세요.
- **태오와 도진의 말투와 성격을 절대 바꾸지 마세요.** 이전 장면과 모순되지 않도록 주의하세요.
- 대사와 행동을 구체적으로, 몰입감 있게 써주세요.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let body: {
    userInput: string;
    currentHeading?: string;
    currentParagraphs?: string[];
    universeIndex?: number; // 유저가 선택한 유니버스 번호
    universeName?: string; // 유니버스 이름
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청 본문입니다." },
      { status: 400 }
    );
  }

  const { userInput, currentHeading, currentParagraphs, universeIndex, universeName } = body;
  const trimmed = typeof userInput === "string" ? userInput.trim() : "";
  if (!trimmed) {
    return NextResponse.json(
      { error: "userInput이 비어 있습니다." },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey });

  // 이전 장면 정보 구성 (일관성 체크용)
  const previousSceneContext = currentHeading && Array.isArray(currentParagraphs) && currentParagraphs.length > 0
    ? `\n\n【이전 장면 (반드시 이어서 작성)】\n제목: ${currentHeading}\n내용:\n${currentParagraphs.join("\n")}\n\n위 장면의 캐릭터 성격과 말투를 그대로 이어받아 작성하세요. 태오는 집착적이고 강압적인 말투, 도진은 유약하고 떨리는 말투를 유지하세요.`
    : "";

  const universeContext = universeName ? `\n\n【현재 유니버스】\n${universeName} - 이 유니버스의 톤과 방향성을 유지하세요.` : "";

  /** 확성기 프롬프트: 유저 한 줄을 반영해 다음 장면을 자극적·재미있게 생성 */
  const userPrompt = `독자가 선택한 '한 줄'로 운명을 뒤엎는 장면을 써주세요.

【독자의 한 줄】
"${trimmed}"
${previousSceneContext}${universeContext}

이 한 줄을 반영해서, **다음 장면 하나**를 500자 내외로 쓰세요. 긴장감과 반전을 살리고, 독자가 "다음은 어떻게 되지?" 하고 몰입하도록 자극적이고 재미있게 써주세요.

**중요: 캐릭터 성격 일관성 체크**
- 태오: 집착적이고 강압적. "~야", "~해" 같은 단정적 말투. 도진을 소유하려는 욕망이 드러나야 함.
- 도진: 유약하고 수동적. "~인 것 같아...", "~할까..." 같은 불확실하고 떨리는 말투.
- 이전 장면과 말투가 모순되지 않도록 주의하세요.

반드시 아래 JSON만 출력하고, JSON 밖에 설명이나 마크다운은 넣지 마세요.

{
  "heading": "제2장 · (장면 제목)",
  "paragraphs": ["첫 번째 문단.", "두 번째 문단.", "필요 시 세·네 번째 문단까지."],
  "imagePrompt": "이 장면을 표현할 삽화용 프롬프트 (영어, 100자 내외). 반드시 'premium webtoon style, cinematic lighting' 또는 'dreamy oil painting style, ethereal atmosphere' 중 하나의 스타일을 포함하고, 주요 캐릭터와 감정, 배경을 구체적으로 묘사하세요."
}

규칙: 
- paragraphs는 2~4개, 총 500자 내외.
- 태오와 도진의 말투를 반드시 일관되게 유지하세요. 태오는 강압적, 도진은 유약하고 떨리는 말투.
- imagePrompt는 영어로 작성하고, 반드시 다음 중 하나를 포함하세요:
  * "premium webtoon style, cinematic lighting, detailed character expressions" (고급스러운 웹툰 스타일)
  * "dreamy oil painting style, ethereal atmosphere, soft brushstrokes" (몽환적인 유화 스타일)
- 스타일은 일관되게 유지하세요 (모든 이미지가 같은 스타일).`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
      temperature: 0.9,
    });

    const choice = completion.choices?.[0];
    const text = choice?.message?.content?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "AI가 응답을 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    let parsed: GenerateSceneResponse;
    try {
      parsed = JSON.parse(text) as GenerateSceneResponse;
    } catch {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? text;
      parsed = JSON.parse(jsonMatch.trim()) as GenerateSceneResponse;
    }

    if (
      typeof parsed.heading !== "string" ||
      !Array.isArray(parsed.paragraphs) ||
      !parsed.paragraphs.every((p) => typeof p === "string") ||
      typeof parsed.imagePrompt !== "string"
    ) {
      return NextResponse.json(
        { error: "AI 응답 형식이 올바르지 않습니다.", raw: text },
        { status: 502 }
      );
    }

    // DALL-E-3로 이미지 생성
    let imageUrl: string | undefined;
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: parsed.imagePrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      if (imageResponse?.data && imageResponse.data.length > 0) {
        imageUrl = imageResponse.data[0]?.url;
      }
    } catch (imageErr) {
      console.error("[이미지 생성 실패]", imageErr);
      // 이미지 생성 실패해도 텍스트는 반환
    }

    return NextResponse.json({
      ...parsed,
      imageUrl: imageUrl || undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "장면 생성 중 오류가 발생했습니다.", details: message },
      { status: 502 }
    );
  }
}
