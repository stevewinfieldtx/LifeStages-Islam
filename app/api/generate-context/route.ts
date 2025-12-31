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

    const isQuran = source?.includes("Quran") || /surah|ayah|al-/i.test(verseReference)
    const isHadith = source?.includes("Hadith") || /bukhari|muslim|tirmidhi|nasa'i|dawud|majah/i.test(verseReference)
    const isSufi = source?.includes("Sufi") || /rumi|ghazali|arabi|rabia/i.test(verseReference)

    let sourceTypeGuidance = ""
    if (isQuran) {
      sourceTypeGuidance = contentMode === "academic" 
        ? `This is from the Quran. Your scholarly analysis MUST include:
- Asbab al-nuzul (occasions of revelation) if known
- Makki vs Madani classification
- Classical tafsir references (Ibn Kathir, al-Tabari, al-Qurtubi, al-Razi)
- Arabic linguistic analysis (i'rab, balagha)
- Relevant hadith that explain the ayah
- How the four madhabs interpret any practical implications`
        : `This is from the Quran. Help readers understand:
- When was this revealed? (Makki or Madani period)
- What was happening when Allah revealed these words?
- Who was the Prophet ﷺ speaking to?
- What context helps us understand the meaning?
- How does this connect to other parts of the Quran?`
    } else if (isHadith) {
      sourceTypeGuidance = contentMode === "academic"
        ? `This is a hadith. Your scholarly analysis MUST include:
- The hadith collection and grading (sahih, hasan, etc.)
- The narrator chain (isnad) significance
- Related hadith on the same topic
- How scholars have interpreted this hadith
- Fiqh implications across madhabs`
        : `This is a hadith. Help readers understand:
- Who narrated this hadith?
- What was the situation when the Prophet ﷺ said this?
- How have Muslim scholars understood this teaching?
- How does this apply to Muslim life today?`
    } else if (isSufi) {
      sourceTypeGuidance = contentMode === "academic"
        ? `This is from Sufi literature. Your scholarly analysis should include:
- The author's background and silsila (spiritual lineage)
- The work this comes from
- How it relates to Quranic and hadith sources
- The spiritual concepts (maqamat, ahwal) involved
- How mainstream scholars have received this teaching`
        : `This is Sufi wisdom. Help readers understand:
- Who was this teacher?
- What spiritual station is being described?
- How does this connect to the Quran and Sunnah?
- What practical wisdom can Muslims take from this?`
    } else {
      sourceTypeGuidance = `Provide context for this Islamic text - its source, historical background, and significance in Muslim tradition.`
    }

    const systemInstruction = contentMode === "academic"
      ? `You are an Islamic studies professor writing for an educated Muslim audience. Your analysis must demonstrate deep knowledge of the Islamic sciences.

CRITICAL ACADEMIC REQUIREMENTS:
- Cite classical scholars BY NAME (Ibn Kathir, al-Nawawi, Ibn Taymiyyah, al-Ghazali, etc.)
- Include Arabic terms with transliteration and meaning
- Reference primary sources (specific tafsir works, hadith collections)
- Note differences among madhabs where relevant
- Include relevant hadith with proper attribution

IMPORTANT: Each field should be 150-250 words of substantive scholarly content.

${sourceTypeGuidance}

${personalization}

CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO bracketed citations. Mention scholars by name in the text itself.`
      : `You're helping Muslims understand their sacred texts better - like a warm, knowledgeable imam who makes Islamic knowledge accessible and relevant.

Use phrases like "The scholars explain...", "SubhanAllah, notice how...", "The Prophet ﷺ was teaching..."

IMPORTANT: Each field should be 100-200 words of rich, engaging content.

${sourceTypeGuidance}

${personalization}

CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.`

    const fieldLength = contentMode === "academic" ? "150-250 words of scholarly analysis" : "100-200 words of engaging explanation"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `Provide ${contentMode === "academic" ? "comprehensive scholarly context for" : "rich background on"} ${verseReference}: "${verseText}"
      ${source ? `(Source: ${source})` : ""}
      
      ${contentMode === "academic" ? "Write as if for an Islamic studies journal. Cite scholars by name. Include Arabic terms." : "Make this come alive! Help readers connect with the revelation and the Prophet's ﷺ time."}
      
      IMPORTANT: Each field must be ${fieldLength}. Do not give brief answers.
      
      Return ONLY a JSON object with this structure, no markdown, no bracketed citations, no URLs:
      {
        "context": {
          "whoIsSpeaking": "${fieldLength} - Is this Allah speaking directly? The Prophet ﷺ narrating? An angel? Explain the speaker.",
          "originalListeners": "${fieldLength} - Who first heard these words? The Companions? A specific person? The Quraysh?",
          "whyTheConversation": "${fieldLength} - What prompted this revelation or teaching? What was the sabab al-nuzul?",
          "historicalBackdrop": "${fieldLength} - Was this Makki or Madani? What was happening in the early Muslim community?",
          "immediateImpact": "${fieldLength} - How did the Companions respond? What changed after this revelation?",
          "longTermImpact": "${fieldLength} - How has this text shaped Islamic thought, law, and practice through the centuries?",
          "setting": "${fieldLength} - Where was the Prophet ﷺ? In Makkah? Madinah? On a journey? Paint the scene."
        },
        "contextImagePrompt": "Cinematic scene from Islamic history - respectful, no depictions of prophets. Consider: Madinah, a mosque, desert landscape, Islamic architecture, geometric patterns, calligraphy."
      }`,
      maxTokens: contentMode === "academic" ? 8000 : 5000,
    })

    const data = parseLLMJson(text)
    const cleanedData = cleanLLMObject(data)

    return Response.json(cleanedData)
  } catch (error) {
    console.error("Context generation error:", error)
    return Response.json({ error: "Failed to generate context" }, { status: 500 })
  }
}
