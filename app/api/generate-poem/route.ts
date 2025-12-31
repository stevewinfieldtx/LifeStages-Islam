import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext, type ContentMode, type IslamicTradition } from "@/lib/personalization-prompts"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"
import { cleanLLMText } from "@/lib/clean-llm-text"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, poemType, source, contentMode = "casual", tradition = "general" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation, contentMode as ContentMode, tradition as IslamicTradition)

    const isClassic = poemType === "classic"
    
    const styleGuide = contentMode === "academic"
      ? isClassic
        ? "Write a formally structured poem in the tradition of classical Islamic poetry - the qasida form or the ghazal. Draw on the rich tradition of Arabic and Persian Islamic poetry from poets like Rumi, Hafiz, and Ibn Arabi. Include sophisticated imagery, metaphor, and spiritual depth. The poem should reward multiple readings."
        : "Write a literary free verse poem with sophisticated imagery and theological depth. Reference the tradition of modern Islamic poetry while engaging deeply with Quranic themes. Use imagery drawn from Islamic experience, nature, and the spiritual journey."
      : isClassic
        ? "Write a NASHEED-STYLE poem - something that could be recited or sung in praise of Allah or as spiritual reflection. Clear rhythm and structure. Traditional Islamic poetic form. Something that elevates the soul and praises the Creator."
        : "Write a FREE VERSE poem with vivid imagery and Islamic spiritual themes, no strict rhyme required. The poem should flow naturally, paint pictures with words, and inspire faith. Something that might be shared at an Islamic gathering or personal reflection."

    const systemInstruction = contentMode === "academic"
      ? `You are a literary poet with expertise in Islamic poetry traditions - from classical Arabic qasidas through Persian Sufi poetry to modern Islamic verse. Write poetry that combines literary sophistication with deep faith.

CRITICAL: Write ONLY plain text poetry. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`
      : `You are a gifted Muslim poet writing verse that praises Allah and inspires faith. Your poems reflect love for Allah, reverence for the Prophet ﷺ, and the beauty of Islam.

Your poems have:
- Beautiful rhythm and flow
- Rich imagery drawn from Islamic tradition and nature
- Arabic phrases used naturally where they add meaning (SubhanAllah, Alhamdulillah, etc.)
- Themes of tawhid, gratitude, seeking Allah's mercy, and spiritual aspiration
- Universal human emotions through an Islamic lens

CRITICAL: Write ONLY plain text poetry. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`

    const lineCount = contentMode === "academic" ? "20-32 lines" : "16-24 lines"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `Generate 1 beautiful ${isClassic ? "NASHEED-STYLE (Classic)" : "FREE VERSE"} poem inspired by ${verseReference}: "${verseText}"
${source ? `(From: ${source})` : ""}

${styleGuide}

Requirements:
- ${lineCount} total (this is a COMPLETE poem, not a snippet)
- Clear stanzas with blank lines between them
- Rich imagery from Islamic tradition, nature, and spiritual experience
- ${contentMode === "academic" ? "Literary sophistication and theological depth" : "Spiritual warmth and accessibility"}
- May include Arabic phrases where they add beauty (SubhanAllah, Alhamdulillah, Allahu Akbar, etc.)

Respond in this EXACT format:
TITLE===Your Poem Title===TITLE
POEM===
First line of poem
Second line of poem
Third line of poem

Fourth line (new stanza)
Fifth line
Sixth line

(continue for ${lineCount})
===POEM
IMAGE===Detailed visual description for artwork - Islamic geometric patterns, calligraphy, mosque architecture, nature scenes. NO depictions of prophets or Allah.===IMAGE`,
      maxTokens: 2500,
    })

    const titleMatch = text.match(/TITLE===(.+?)===TITLE/s)
    const poemMatch = text.match(/POEM===(.+?)===POEM/s)
    const imageMatch = text.match(/IMAGE===(.+?)===IMAGE/s)

    const poem = {
      title: cleanLLMText(titleMatch?.[1]?.trim() || "Untitled Poem"),
      type: isClassic ? "Nasheed Style" : "Free Verse",
      text: poemMatch?.[1]?.trim() || text,
      imagePrompt: imageMatch?.[1]?.trim() || "Beautiful Islamic geometric patterns with calligraphy",
    }

    return Response.json({ poem })
  } catch (error) {
    console.error("Poem generation error:", error)
    return Response.json({ error: "Failed to generate poem" }, { status: 500 })
  }
}
