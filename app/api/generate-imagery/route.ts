import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { parseLLMJson } from "@/lib/parse-llm-json"
import { buildPersonalizationContext, type ContentMode, type IslamicTradition } from "@/lib/personalization-prompts"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"
import { cleanLLMObject } from "@/lib/clean-llm-text"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, source, contentMode = "casual", tradition = "general" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation, contentMode as ContentMode, tradition as IslamicTradition)

    const systemInstruction = contentMode === "academic"
      ? `You are an Islamic studies scholar analyzing Quranic symbolism and imagery. Provide deep analysis with references to Arabic linguistics, classical tafsir, and scholarly interpretation of Quranic imagery.

Include: Arabic word roots and their symbolic significance, how classical mufassirun interpreted these images, connections to other Quranic passages with similar imagery, scholarly perspectives on Islamic symbolism.

IMPORTANT: Each symbol explanation should be 100-150 words of substantive scholarly analysis.

CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`
      : `You help Muslims discover beautiful symbolism in the Quran and Sunnah. Write like you're sharing an insight with a friend - "SubhanAllah, look at what Allah is teaching us here..."

Reference Islamic imagery: light and darkness, gardens, water, paths, mountains, the heart, veils, the straight path, etc.

IMPORTANT: Each symbol explanation should be 80-120 words.

CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`

    const explanationLength = contentMode === "academic" ? "100-150 words of scholarly analysis" : "80-120 words of heartfelt explanation"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `Find 4 powerful symbols or themes in ${verseReference}: "${verseText}"
${source ? `(From: ${source})` : ""}

${contentMode === "academic" ? "Provide scholarly analysis of each symbol including Arabic linguistics, tafsir references, and theological significance." : "Explain each symbol in a way that helps Muslims see deeper meaning and connect it to their lives."}

IMPORTANT: Each "sub" field must be ${explanationLength}. Don't give brief answers - really explore each symbol.

Consider Islamic symbols like: light (nur), water, gardens (jannah), paths (sirat), hearts (qalb), veils, mountains, the soul (nafs), mercy (rahma), etc.

Create 4 distinct visual concepts for imagePrompts (all respectful - no depictions of Allah or prophets):
1. First image: Focus on a natural element (sky, water, garden, mountain)
2. Second image: Focus on Islamic art (geometric patterns, calligraphy, arabesque)
3. Third image: Focus on sacred architecture (mosque interior, mihrab, dome)
4. Fourth image: Focus on a scene that illustrates the verse

Return ONLY a JSON object, no markdown, no citations, no URLs:
{
  "imagery": [
    { "title": "Symbol Name", "sub": "${explanationLength} exploring this symbol deeply", "icon": "auto_awesome", "imagePrompt": "Detailed visual description - respectful Islamic imagery" },
    { "title": "Symbol Name", "sub": "${explanationLength} exploring this symbol deeply", "icon": "water_drop", "imagePrompt": "Detailed visual description" },
    { "title": "Symbol Name", "sub": "${explanationLength} exploring this symbol deeply", "icon": "spa", "imagePrompt": "Detailed visual description" },
    { "title": "Symbol Name", "sub": "${explanationLength} exploring this symbol deeply", "icon": "wb_sunny", "imagePrompt": "Detailed visual description" }
  ]
}`,
      maxTokens: contentMode === "academic" ? 5000 : 3500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    const data = parseLLMJson(cleanJson)
    const cleanedData = cleanLLMObject(data)

    return Response.json(cleanedData)
  } catch (error) {
    console.error("Imagery generation error:", error)
    return Response.json({ error: "Failed to generate imagery" }, { status: 500 })
  }
}
