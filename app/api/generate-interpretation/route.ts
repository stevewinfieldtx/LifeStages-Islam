import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext, type ContentMode, type IslamicTradition } from "@/lib/personalization-prompts"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"
import { cleanLLMText } from "@/lib/clean-llm-text"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, language = "en", source, contentMode = "casual", tradition = "general" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const personalizationContext = buildPersonalizationContext(ageRange, gender, stageSituation, contentMode as ContentMode, tradition as IslamicTradition)

    const languageName = getLanguageName(language)
    const languageInstruction =
      language !== "en"
        ? `CRITICAL LANGUAGE REQUIREMENT: You MUST write your entire interpretation in ${languageName}. Every single word of the interpretation content must be in ${languageName}. Do NOT write in English. The delimiters stay in English, but ALL content between them must be in ${languageName}.`
        : ""

    const islamicContext = contentMode === "academic" 
      ? `You are an Islamic studies scholar providing rigorous analysis rooted in the Quranic sciences. Draw on classical tafsir, hadith literature, and modern scholarship while maintaining reverence for the sacred text.`
      : `You are creating Islamic devotional content for Muslim readers.

Key guidelines:
- Use Islamic terminology naturally (Allah, Prophet ﷺ, Quran, Sunnah, taqwa, iman, etc.)
- Include "peace be upon him" (ﷺ) when mentioning the Prophet Muhammad
- Reference tafsir (Quranic commentary) and hadith where relevant
- Connect texts to Muslim life - salah, fasting, zakat, family, community
- Honor the diversity of the ummah while maintaining Islamic authenticity
- Maintain a tone of reverence, warmth, and Islamic adab (etiquette)
- Use "Allah" rather than "God" in most contexts`

    const baseInstructions = `CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting, NO asterisks, NO underscores for emphasis.`

    const systemInstruction = `${islamicContext}\n\n${baseInstructions}\n\n${languageInstruction}${languageInstruction ? "\n\n" : ""}${personalizationContext}`

    const promptInstruction = contentMode === "academic"
      ? `Write a comprehensive scholarly tafsir (exegesis) of this text. Include Arabic linguistic analysis, cite classical mufassirun (Ibn Kathir, al-Tabari, al-Qurtubi), reference relevant hadith, and engage with modern Islamic scholarship. Maintain academic rigor while being spiritually insightful. Be thorough and detailed.`
      : `Write a rich, reflective commentary on this text in a warm, personal tone. This should feel like something a wise imam or Islamic teacher might share - genuine, spiritually nourishing, and connecting the sacred text to real life today. Explore the deeper meanings. Help the reader apply this wisdom in their daily life as a Muslim.`

    const wordLimit = contentMode === "academic" ? "500-700 words with scholarly depth" : "350-450 words of meaningful reflection"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `${verseReference}: "${verseText}"
      ${source ? `(Source: ${source})` : ""}
      
      ${language !== "en" ? `REMINDER: Write your interpretation in ${languageName}, NOT English.\n\n` : ""}${promptInstruction}

      Write ONLY plain text - no URLs, no links, no citations, no brackets, no asterisks.
      
      IMPORTANT: Write a FULL, COMPLETE response of ${wordLimit}. Do not cut short. Provide rich, meaningful content.
      
      Format your response EXACTLY like this:
      
      INTERPRETATION===
      Your ${contentMode === "academic" ? "scholarly tafsir" : "reflective commentary"} here... (${wordLimit})
      ===INTERPRETATION
      
      IMAGE_PROMPT===
      Cinematic description of an inspiring scene that captures the text's theme. Consider Islamic geometric patterns, mosques, nature scenes, calligraphy, or scenes from Islamic history. Always respectful and appropriate - no depictions of prophets or Allah.
      ===IMAGE_PROMPT`,
      maxTokens: contentMode === "academic" ? 8000 : 6000,
    })

    let interpretationMatch = text.match(/INTERPRETATION===\s*([\s\S]*?)\s*===INTERPRETATION/)
    if (!interpretationMatch) {
      interpretationMatch = text.match(/INTERPRETATION===\s*([\s\S]*?)\s*===(?:IMAGE_PROMPT|$)/)
    }

    let imagePromptMatch = text.match(/IMAGE_PROMPT===\s*([\s\S]*?)\s*===(?:IMAGE_PROMPT|$)/)
    if (!imagePromptMatch) {
      imagePromptMatch = text.match(/===?IMAGE_PROMPT\s*([\s\S]*?)(?:===|$)/)
    }

    const interpretation = cleanLLMText(interpretationMatch ? interpretationMatch[1].trim() : "Unable to generate interpretation.")
    const heroImagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : "A serene scene with Islamic geometric patterns and soft light"

    return Response.json({
      interpretation,
      heroImagePrompt,
    })
  } catch (error) {
    console.error("Interpretation generation error:", error)
    return Response.json({ error: "Failed to generate interpretation" }, { status: 500 })
  }
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    ar: "Arabic (العربية)",
    ur: "Urdu (اردو)",
    id: "Indonesian (Bahasa Indonesia)",
    ms: "Malay (Bahasa Melayu)",
    tr: "Turkish (Türkçe)",
    fr: "French (Français)",
    es: "Spanish (Español)",
    bn: "Bengali (বাংলা)",
    fa: "Persian/Farsi (فارسی)",
  }
  return languages[code] || "English"
}
