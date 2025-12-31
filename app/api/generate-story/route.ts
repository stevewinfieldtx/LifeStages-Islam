import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext, type ContentMode, type IslamicTradition } from "@/lib/personalization-prompts"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"
import { cleanLLMText } from "@/lib/clean-llm-text"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, storyType, source, contentMode = "casual", tradition = "general" } = await request.json()

    if (!verseReference || !verseText || !storyType) {
      return Response.json({
        error: "Missing required fields",
        title: "Story Unavailable",
        text: "Unable to generate story due to missing information.",
        imagePrompt: "A peaceful scene",
      }, { status: 400 })
    }

    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation, contentMode as ContentMode, tradition as IslamicTradition)

    const storyPrompts: Record<string, Record<string, string>> = {
      casual: {
        contemporary: `Write a modern-day story set in contemporary Muslim life.

Settings could include: a Muslim family home, a masjid (mosque), an Islamic school, a halal restaurant, Ramadan iftars, Eid celebrations, a Muslim community center, Hajj preparation, a Muslim student's experience, an interfaith encounter, workplace challenges as a Muslim, a convert's journey...

Focus on realistic situations Muslims face today - balancing faith and modern life, raising Muslim children in the West, maintaining salah at work, Ramadan while working, dealing with Islamophobia with dignity, finding a spouse the halal way, community life, family relationships.

Use Islamic terminology naturally (masjid, salah, du'a, inshallah, alhamdulillah, etc.) but make it feel authentic, not forced. Show how faith guides real Muslim lives.`,
        historical: `Write a story set in Islamic history that brings this text to life.

Options include:
- The time of the Prophet ﷺ: Makkah, Madinah, the Companions
- The Khulafa Rashidun: Abu Bakr, Umar, Uthman, Ali (may Allah be pleased with them)
- The Golden Age: Baghdad, Cordoba, scholars and scientists
- Great Muslim figures: Salahuddin, scholars, sufis, explorers
- The spread of Islam: Africa, Asia, Al-Andalus

IMPORTANT: Never put words in the Prophet's ﷺ mouth that aren't from hadith. Never depict him speaking directly. Show him through the eyes of Companions.

Make historical figures feel real and relatable. Show their taqwa, their struggles, their humanity.`,
      },
      academic: {
        contemporary: `Write a thoughtful modern narrative that explores the theological and practical implications of this text. Include realistic scenarios where contemporary Muslims grapple with applying Quranic wisdom and Prophetic guidance to modern ethical dilemmas. Reference different scholarly perspectives.`,
        historical: `Write a historically rigorous narrative set in the actual time and place of this text.

Include accurate historical details - the social structures of 7th century Arabia, the early Muslim community, material culture of the period. For hadith, accurately portray the setting based on the narration.

CRITICAL: Never directly depict the Prophet ﷺ speaking or acting unless quoting sahih hadith. Show events through the perspective of Companions or other historical figures.

The story should be both engaging and educational, helping readers understand the historical context of Islam's development.`,
      }
    }

    const mode = contentMode as ContentMode
    const storyPrompt = storyPrompts[mode]?.[storyType] || storyPrompts.casual[storyType] || storyPrompts.casual.contemporary

    const systemInstruction = contentMode === "academic"
      ? `You are a historical fiction writer with deep expertise in Islamic history and scholarship. Write stories that are both engaging and historically rigorous.

CRITICAL ISLAMIC GUIDELINES:
- NEVER directly depict the Prophet Muhammad ﷺ speaking or acting (show through others' perspectives)
- NEVER invent hadith or attribute false sayings to the Prophet ﷺ
- Maintain historical accuracy based on seerah and hadith literature
- Be respectful of all Companions and early Muslims

CRITICAL: Write ONLY plain prose. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`
      : `You are a gifted Muslim storyteller creating stories that touch the heart and illuminate Islamic teachings. Your stories feel authentically Muslim - grounded in faith, family, and community.

Your stories should:
- Feel genuine to the Muslim experience
- Show how Islam guides real life
- Include Islamic terminology naturally (inshallah, alhamdulillah, masjid, salah, etc.)
- NEVER put words in the Prophet's ﷺ mouth - always use "The Prophet ﷺ said..." and quote authentic hadith
- Never be preachy - show, don't lecture
- Have real conflict, real emotion, real resolution
- Be appropriate for all Muslims

CRITICAL: Write ONLY plain prose. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`

    const wordCount = contentMode === "academic" ? "1000-1200" : "800-1000"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `Create ONE powerful, complete story that brings this teaching to life: ${verseReference}: "${verseText}"
${source ? `(Source: ${source})` : ""}

${storyPrompt}

CRITICAL LENGTH REQUIREMENT: The story MUST be ${wordCount} words. This is a FULL story, not a summary.

Include:
- Detailed scene setting with sensory details
- Multiple characters with distinct personalities
- Natural dialogue (remember: never invent Prophet's ﷺ words)
- Deep internal thoughts and moments of spiritual insight
- A clear narrative arc with compelling setup, meaningful conflict, and satisfying resolution
- Moments that touch the heart
- A powerful connection to the Islamic teaching

Format response EXACTLY like this:
TITLE===Your Story Title===TITLE
STORY===Your full story text (${wordCount} words, plain prose, no formatting)===STORY
IMAGE===Cinematic scene description - NO depictions of prophets. Use mosque interiors, geometric patterns, landscapes, calligraphy, historical settings===IMAGE`,
      maxTokens: 8000,
    })

    const titleMatch = text.match(/TITLE===(.+?)===TITLE/s)
    const storyMatch = text.match(/STORY===(.+?)===STORY/s)
    const imageMatch = text.match(/IMAGE===(.+?)===IMAGE/s)

    const title = cleanLLMText(titleMatch?.[1]?.trim() || "A Story of Faith")
    const storyText = cleanLLMText(storyMatch?.[1]?.trim() || text.replace(/TITLE===.+?===TITLE/s, "").replace(/IMAGE===.+?===IMAGE/s, "").trim())
    const imagePrompt = imageMatch?.[1]?.trim() || `A beautiful Islamic scene with geometric patterns and peaceful atmosphere`

    return Response.json({
      title,
      text: storyText,
      imagePrompt,
    })
  } catch (error) {
    console.error("Story generation error:", error)
    return Response.json({
      title: "Story Unavailable",
      text: "We encountered an issue generating this story. Please try again later.",
      imagePrompt: "A peaceful, contemplative scene with Islamic geometric patterns",
    }, { status: 200 })
  }
}
