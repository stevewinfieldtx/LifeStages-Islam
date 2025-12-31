import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext, type BuddhistTradition } from "@/lib/personalization-prompts"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, tradition = "secular" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const modelId = (process.env.OPENROUTER_MODEL_ID || "anthropic/claude-sonnet-4-20250514").trim()

    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation, "casual", tradition as BuddhistTradition)

    const traditionPoetryStyle = {
      secular: "contemporary mindfulness poetry, accessible and grounded",
      theravada: "clear, precise imagery like traditional Pali verse",
      mahayana: "expansive, compassionate tone with nature imagery",
      zen: "haiku-influenced, sparse, pointing to direct experience",
      tibetan: "devotional, rich imagery, transformative themes",
    }

    const systemInstruction = `You are a gifted poet who writes beautiful, emotionally resonant poetry inspired by Buddhist wisdom. Your poems have proper structure with line breaks, stanzas, and poetic rhythm. Write in a warm, accessible style that touches the heart.

Poetry style guidance for ${tradition} tradition: ${traditionPoetryStyle[tradition as keyof typeof traditionPoetryStyle] || traditionPoetryStyle.secular}

${personalization}`

    const poem1Promise = generateText({
      model: openrouter(modelId),
      system: systemInstruction,
      prompt: `Generate 1 beautiful TRADITIONAL STYLE poem inspired by this Buddhist teaching - ${verseReference}: "${verseText}"
      
      Write a REAL POEM with proper poetic structure:
      - 8-16 lines total
      - Use rhythm and possibly rhyme
      - Include stanzas
      - Use poetic devices like imagery and metaphor
      - Draw on traditional Buddhist poetry forms (gathas, verses from suttas)
      
      Respond in this EXACT format with delimiters:
      TITLE===Your Poem Title Here===TITLE
      TYPE===Traditional Buddhist Verse===TYPE
      POEM===
      Line one of the poem
      Line two of the poem
      
      Line three (new stanza)
      Line four
      ===POEM
      IMAGE===Ethereal artistic visual description for this poem - peaceful, contemplative imagery===IMAGE`,
      maxTokens: 1000,
    })

    const poem2Promise = generateText({
      model: openrouter(modelId),
      system: systemInstruction,
      prompt: `Generate 1 beautiful FREE VERSE poem inspired by this Buddhist teaching - ${verseReference}: "${verseText}"
      
      Write a REAL POEM with proper poetic structure:
      - 8-16 lines total
      - Free verse style (no strict rhyme required)
      - Include stanzas
      - Use vivid imagery and metaphor
      - Contemporary voice, accessible
      
      Respond in this EXACT format with delimiters:
      TITLE===Your Poem Title Here===TITLE
      TYPE===Free Verse===TYPE
      POEM===
      Line one of the poem
      Line two of the poem
      
      Line three (new stanza)
      Line four
      ===POEM
      IMAGE===Ethereal artistic visual description for this poem - natural, peaceful imagery===IMAGE`,
      maxTokens: 1000,
    })

    const [result1, result2] = await Promise.all([poem1Promise, poem2Promise])

    const parsePoem = (text: string) => {
      const titleMatch = text.match(/TITLE===(.+?)===TITLE/s)
      const typeMatch = text.match(/TYPE===(.+?)===TYPE/s)
      const poemMatch = text.match(/POEM===(.+?)===POEM/s)
      const imageMatch = text.match(/IMAGE===(.+?)===IMAGE/s)

      return {
        title: titleMatch?.[1]?.trim() || "Untitled Poem",
        type: typeMatch?.[1]?.trim() || "Free Verse",
        text: poemMatch?.[1]?.trim() || "",
        imagePrompt: imageMatch?.[1]?.trim() || "Abstract artistic representation of peace and wisdom",
      }
    }

    const poetry = [parsePoem(result1.text), parsePoem(result2.text)]

    return Response.json({ poetry })
  } catch (error) {
    console.error("Poetry generation error:", error)
    return Response.json({ error: "Failed to generate poetry" }, { status: 500 })
  }
}
