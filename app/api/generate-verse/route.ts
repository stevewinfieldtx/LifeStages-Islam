import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"

// Islamic scripture and wisdom sources
const SCRIPTURE_SOURCES = {
  QURAN: "Quran",
  HADITH: "Hadith",
  NAMES_OF_ALLAH: "99 Names of Allah",
  PROPHET_STORIES: "Stories of the Prophets",
  DUA: "Du'a (Supplications)",
  SUFI_WISDOM: "Sufi Wisdom",
}

async function fetchDailyAyah(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Today is ${currentDate}. Select a meaningful ayah (verse) from the Quran that would be spiritually beneficial for a Muslim's daily reflection.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Surah Name (Surah Number:Ayah Number) - e.g., 'Al-Baqarah (2:255)' or 'Al-Fatiha (1:1-7)'",
        "version": "Quran",
        "text": "The Arabic transliteration followed by English translation. Use a respected translation (Sahih International, Yusuf Ali, or Pickthall).",
        "source": "Quran"
      }
      
      Choose ayat that are well-known, spiritually uplifting, or contain important guidance.
      Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Daily ayah fetch error:", e)
  }
  return null
}

async function fetchQuranVerse(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a powerful, meaningful ayah from the Quran for spiritual reflection.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Surah Name (Surah Number:Ayah Number)",
        "version": "Quran",
        "text": "Arabic transliteration followed by English translation",
        "source": "Quran"
      }
      
      Choose from well-known surahs and ayat that are frequently recited or contain core Islamic teachings.
      Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Quran fetch error:", e)
  }
  return null
}

async function fetchHadith(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a meaningful, authentic hadith from Sahih Bukhari, Sahih Muslim, or other reliable collections.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Collection, Book/Kitab, Hadith Number - e.g., 'Sahih Bukhari, Book of Faith, Hadith 8' or 'Sahih Muslim 2564'",
        "version": "Hadith",
        "text": "The hadith text in English translation",
        "source": "Hadith"
      }
      
      Choose well-known hadith that offer practical guidance or spiritual insight. Prefer sahih (authentic) hadith.
      Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Hadith fetch error:", e)
  }
  return null
}

async function fetchNamesOfAllah(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select one of the 99 Names of Allah (Asma ul-Husna) for reflection.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "The Arabic Name - e.g., 'Ar-Rahman (الرحمن)' or 'Al-Wadud (الودود)'",
        "version": "Asma ul-Husna",
        "text": "The meaning in English and a brief explanation of this divine attribute",
        "source": "99 Names of Allah"
      }
      
      Include the Arabic, transliteration, and meaning.
      Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Names of Allah fetch error:", e)
  }
  return null
}

async function fetchProphetStory(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a Quranic passage about one of the Prophets (peace be upon them) for reflection.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Surah Name (Surah:Ayah) - Story of Prophet [Name]",
        "version": "Quran",
        "text": "The Quranic passage about this Prophet with English translation",
        "source": "Stories of the Prophets"
      }
      
      Choose passages about Prophet Ibrahim, Musa, Yusuf, Isa, or other prophets mentioned in the Quran.
      Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Prophet story fetch error:", e)
  }
  return null
}

async function fetchDua(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a beautiful du'a (supplication) from the Quran or authentic Sunnah.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Source - e.g., 'Quran, Al-Baqarah 2:201' or 'Hisnul Muslim, Morning Adhkar'",
        "version": "Du'a",
        "text": "Arabic transliteration and English translation of the du'a",
        "source": "Du'a"
      }
      
      Choose well-known supplications that Muslims recite regularly.
      Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Du'a fetch error:", e)
  }
  return null
}

async function fetchSufiWisdom(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a piece of wisdom from classical Sufi masters - Rumi, Ibn Arabi, al-Ghazali, Rabia al-Adawiyya, or other respected Sufi scholars.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Author and Work - e.g., 'Rumi, Masnavi' or 'Al-Ghazali, Ihya Ulum al-Din'",
        "version": "Sufi",
        "text": "The teaching or poem with English translation if originally in Arabic/Persian",
        "source": "Sufi Wisdom"
      }
      
      Choose teachings that align with orthodox Islam while offering spiritual depth.
      Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Sufi wisdom fetch error:", e)
  }
  return null
}

export async function POST(request: Request) {
  try {
    const { source, verseQuery } = await request.json()

    // Handle specific verse queries (user searching for a specific ayah)
    if (verseQuery) {
      console.log("[v0] generate-verse API - verseQuery requested:", verseQuery)
      const openrouter = createOpenRouter({
        apiKey: getOpenRouterApiKey(),
      })

      const { text } = await generateText({
        model: openrouter(getOpenRouterModelId()),
        prompt: `Return ONLY a JSON object for the Islamic text: ${verseQuery}
        
        This could be from the Quran, Hadith, Du'a collections, or other Islamic sources.
        
        Return ONLY this JSON structure, no markdown, no explanation:
        {
          "reference": "The proper Islamic reference format",
          "version": "Quran" or "Hadith" or "Du'a" or appropriate source",
          "text": "The text with Arabic transliteration and English translation",
          "source": "Quran" or "Hadith" or "Du'a" or "Sufi Wisdom" etc.
        }`,
        maxTokens: 500,
      })

      const cleanJson = text.replace(/```json|```/g, "").trim()
      const data = JSON.parse(cleanJson)
      console.log("[v0] generate-verse API - LLM returned:", data.reference)
      return Response.json(data)
    }

    let verse = null

    // Handle scripture source selection
    if (source === "DailyAyah") {
      verse = await fetchDailyAyah()
    } else if (source === "Quran") {
      verse = await fetchQuranVerse()
    } else if (source === "Hadith") {
      verse = await fetchHadith()
    } else if (source === "NamesOfAllah") {
      verse = await fetchNamesOfAllah()
    } else if (source === "ProphetStories") {
      verse = await fetchProphetStory()
    } else if (source === "Dua") {
      verse = await fetchDua()
    } else if (source === "SufiWisdom") {
      verse = await fetchSufiWisdom()
    }

    // Fallback: try Daily Ayah if nothing else works
    if (!verse) {
      console.log("[v0] generate-verse API - Primary source failed, trying Daily Ayah...")
      verse = await fetchDailyAyah()
    }

    if (!verse) {
      console.log("[v0] generate-verse API - No verse found, returning error")
      return Response.json({ error: "Unable to fetch ayah of the day" }, { status: 500 })
    }

    console.log("[v0] generate-verse API - Returning:", verse.reference, "from", verse.source)
    return Response.json(verse)
  } catch (error) {
    console.error("Verse generation error:", error)
    return Response.json({ error: "Failed to generate verse" }, { status: 500 })
  }
}
