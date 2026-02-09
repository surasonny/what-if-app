import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let body: {
    heading: string;
    paragraphs: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청 본문입니다." },
      { status: 400 }
    );
  }

  const { heading, paragraphs } = body;
  if (!heading || !Array.isArray(paragraphs) || paragraphs.length === 0) {
    return NextResponse.json(
      { error: "heading과 paragraphs가 필요합니다." },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey });

  // 현재 장면을 기반으로 이미지 프롬프트 생성
  const sceneText = `${heading}\n\n${paragraphs.join("\n\n")}`;
  
  const promptForImage = `다음 웹소설 장면을 삽화로 표현할 이미지 프롬프트를 영어로 작성해주세요.

【장면】
${sceneText}

이 장면의 핵심 감정과 상황을 담은 삽화를 그리기 위한 프롬프트를 작성하세요. 반드시 다음 중 하나의 스타일을 포함하세요:
- "premium webtoon style, cinematic lighting, detailed character expressions" (고급스러운 웹툰 스타일)
- "dreamy oil painting style, ethereal atmosphere, soft brushstrokes" (몽환적인 유화 스타일)

프롬프트는 100자 내외로, 주요 캐릭터(도진, 태오, 서윤), 감정, 배경을 구체적으로 묘사하세요. 프롬프트만 출력하고 다른 설명은 하지 마세요.`;

  try {
    // 이미지 프롬프트 생성
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating detailed image prompts for illustrations. Respond only with the image prompt in English, no additional text.",
        },
        { role: "user", content: promptForImage },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const imagePrompt = completion.choices?.[0]?.message?.content?.trim();
    if (!imagePrompt) {
      return NextResponse.json(
        { error: "이미지 프롬프트 생성에 실패했습니다." },
        { status: 502 }
      );
    }

    // DALL-E-3로 이미지 생성
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    if (!imageResponse?.data || imageResponse.data.length === 0) {
      return NextResponse.json(
        { error: "이미지 생성에 실패했습니다." },
        { status: 502 }
      );
    }

    const imageUrl = imageResponse.data[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: "이미지 URL을 가져올 수 없습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "스냅샷 생성 중 오류가 발생했습니다.", details: message },
      { status: 502 }
    );
  }
}
