export type ContentMode = "casual" | "academic"
export type IslamicTradition = "sunni" | "shia" | "sufi" | "general"

export function getAgePrompt(ageRange: string, contentMode: ContentMode = "casual"): string {
  if (contentMode === "academic") {
    return getAcademicAgePrompt(ageRange)
  }

  switch (ageRange) {
    case "child":
      return "Write for a Muslim child (ages 6-12). Use simple Arabic terms with explanations. Reference stories they'd know - Prophet Muhammad (peace be upon him), Prophet Ibrahim, Prophet Yusuf. Make the Quran come alive with wonder. Connect to their world - family, school, friends, Ramadan."

    case "teen":
      return "Write for a Muslim teenager. They're developing their own relationship with Islam. Address real questions about faith, identity, fitting in while being Muslim. Reference relatable challenges. Be authentic, not preachy. They can handle complexity."

    case "youth":
      return "Write for a young Muslim adult (18-30). They may be in college, starting careers, navigating marriage and family. Some are deeply practicing, others exploring. Address real-world application of Islamic wisdom. Be intellectually engaging. They appreciate depth and authenticity."

    case "adult":
      return "Write for Muslim adults navigating career, family, and community. They juggle obligations - work, children, aging parents, community involvement. Address practical wisdom for daily life. They want substance that respects their intelligence and time."

    case "senior":
      return "Write for senior Muslims with a lifetime of experience. They've seen much, made Hajj, raised families, experienced loss. Honor their wisdom while offering fresh perspectives. Address legacy, meaning, and preparation for the Hereafter. They appreciate depth and don't need things oversimplified."

    default:
      return "Write for a general Muslim audience seeking meaningful connection with the Quran and Sunnah."
  }
}

function getAcademicAgePrompt(ageRange: string): string {
  switch (ageRange) {
    case "child":
      return "Write for a Muslim child with age-appropriate scholarly context. Introduce Arabic terms properly. Explain historical background simply but accurately."

    case "teen":
      return "Write for a Muslim teenager with emerging intellectual curiosity. Include tafsir basics, introduce different schools of thought, explain Arabic terminology. Islamic school level."

    case "youth":
      return "Write for educated young Muslim adults. Include detailed Quranic analysis, classical tafsir references (Ibn Kathir, al-Tabari, al-Qurtubi), hadith sciences, usul al-fiqh concepts. University Islamic studies level."

    case "adult":
      return "Write for intellectually engaged Muslim adults. Provide comprehensive scholarly analysis - classical and modern mufassirun, hadith criticism, fiqh comparisons across madhabs, linguistic analysis of Quranic Arabic."

    case "senior":
      return "Write for scholarly senior Muslims. Full academic depth - Arabic linguistic analysis, comprehensive tafsir, hadith chains, scholarly debates, Sufi interpretations where relevant, modern academic scholarship."

    default:
      return "Write with full scholarly apparatus - tafsir sources, hadith sciences, linguistic analysis, historical context."
  }
}

export function getGenderPrompt(gender: string): string {
  switch (gender) {
    case "male":
      return "The reader is a Muslim man (brother)."
    case "female":
      return "The reader is a Muslim woman (sister)."
    default:
      return ""
  }
}

export function getStageSituationPrompt(stageSituation: string): string {
  const situations: Record<string, string> = {
    "New Muslim / Convert": "The reader is a new Muslim or recent convert (revert). Welcome them warmly. Explain Islamic concepts without assuming prior knowledge. Connect to the beauty of finding Islam. Honor their journey.",
    "Preparing for Hajj": "The reader is preparing for Hajj. Connect to themes of pilgrimage, purification, unity of the ummah, and the footsteps of Prophet Ibrahim. Include practical spiritual preparation.",
    "Ramadan preparation": "The reader is preparing for or observing Ramadan. Connect to themes of fasting, taqwa, the revelation of the Quran, and spiritual renewal.",
    "Marriage preparation": "The reader is preparing for Islamic marriage (nikah). Connect to themes of partnership, building a Muslim household, rights and responsibilities, and mercy between spouses.",
    "New parent": "The reader is a new Muslim parent. Connect to themes of raising righteous children, the trust (amanah) of parenthood, teaching Islam to the next generation.",
    "Seeking knowledge": "The reader is on a path of seeking Islamic knowledge. Connect to themes of 'ilm, the duty to learn, finding good teachers, and applying knowledge.",
    "Grief and loss": "The reader is grieving. Approach with deep compassion. Connect to themes of qadr (divine decree), patience (sabr), the temporary nature of dunya, and hope in the Hereafter.",
    "Health challenges": "The reader faces health challenges. Connect to themes of shifa (healing), trusting in Allah's plan, patience in difficulty, and the reward for those who endure.",
    "Career decisions": "The reader is navigating career decisions. Connect to themes of halal livelihood, rizq (provision from Allah), balancing dunya and akhirah, and excellence (ihsan) in work.",
    "Strengthening iman": "The reader wants to strengthen their iman (faith). Connect to themes of heart softeners, remembrance of Allah, increasing worship, and spiritual growth.",
    "Family difficulties": "The reader is experiencing family difficulties. Connect to themes of maintaining family ties, patience, forgiveness, and seeking Allah's help in hardship.",
    "Nothing special": ""
  }
  return situations[stageSituation] || ""
}

export function getTraditionPrompt(tradition: IslamicTradition): string {
  const prompts: Record<IslamicTradition, string> = {
    sunni: `Follow mainstream Sunni Islamic scholarship. Reference the four madhabs where relevant. Use hadith from Bukhari, Muslim, and other sahih collections. Cite classical scholars like Ibn Taymiyyah, al-Ghazali, and an-Nawawi.`,
    
    shia: `Be respectful of Shia Islamic tradition. Reference the Ahl al-Bayt appropriately. Include hadith from Shia collections. Acknowledge the Imams where relevant. Be inclusive while maintaining Islamic authenticity.`,
    
    sufi: `Include Sufi/tasawwuf perspectives where appropriate. Reference great Sufi masters - Rumi, Ibn Arabi, al-Ghazali, Rabia al-Adawiyya. Connect to themes of the heart, dhikr, and the inner dimensions of Islam. Balance tariqa with shariah.`,
    
    general: `Write for Muslims of all backgrounds. Focus on shared Islamic values and sources. Avoid sectarian specifics. Emphasize the Quran and authenticated Sunnah that all Muslims accept.`,
  }
  
  return prompts[tradition] || prompts.general
}

function getAcademicModeInstructions(): string {
  return `ACADEMIC/RESEARCH MODE INSTRUCTIONS:
Write as an Islamic studies scholar with expertise in Quranic sciences and Islamic history. Your analysis should include:

LINGUISTIC ANALYSIS:
- Arabic word studies with roots and morphology
- Balagha (Quranic rhetoric) where relevant
- Variant qira'at (readings) if significant

TAFSIR SOURCES:
- Classical mufassirun: Ibn Kathir, al-Tabari, al-Qurtubi, al-Razi
- Modern scholars: Sayyid Qutb, Maududi, contemporary academics
- Reference specific tafsir works

HADITH SCIENCES:
- Include relevant hadith with source (Bukhari, Muslim, etc.)
- Note chain strength where relevant
- Cross-reference with Quranic themes

HISTORICAL-CRITICAL CONTEXT:
- Asbab al-nuzul (occasions of revelation)
- Makki vs Madani classification
- Historical situation of early Islam
- Academic scholarship (both Muslim and Western)

FIQH CONNECTIONS:
- How different madhabs interpret practical implications
- Usul al-fiqh principles where relevant

TONE: Scholarly but accessible. Faith-rooted with academic rigor. Cite sources naturally within text.`
}

export function buildPersonalizationContext(
  ageRange: string,
  gender: string,
  stageSituation: string,
  contentMode: ContentMode = "casual",
  tradition: IslamicTradition = "general"
): string {
  const parts: string[] = []

  // Base Islamic context
  if (contentMode === "academic") {
    parts.push(`This analysis is for a Muslim seeking scholarly, research-based content. Assume familiarity with Islamic terminology and concepts. Provide academic depth with proper citations and Arabic terms.`)
    parts.push(getAcademicModeInstructions())
  } else {
    parts.push(`This reflection is for a Muslim reader. Use Islamic terminology naturally - Allah, Prophet (peace be upon him), Quran, Sunnah, dua, taqwa, etc. - but briefly explain less common terms. Don't over-explain basics. Maintain Islamic adab (etiquette) in tone.`)
  }

  // Add tradition-specific context
  parts.push(getTraditionPrompt(tradition))

  const agePrompt = getAgePrompt(ageRange, contentMode)
  if (agePrompt) parts.push(agePrompt)

  const genderPrompt = getGenderPrompt(gender)
  if (genderPrompt) parts.push(genderPrompt)

  const stagePrompt = getStageSituationPrompt(stageSituation)
  if (stagePrompt) parts.push(stagePrompt)

  return parts.join("\n\n")
}
