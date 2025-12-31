"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDevotional } from "@/context/devotional-context"
import { useLanguage } from "@/context/language-context"
import { BottomNav } from "@/components/bottom-nav"

type TabType = "all" | "quran" | "hadith" | "dua" | "names"

const POPULAR_VERSES: Record<TabType, { reference: string; preview: string }[]> = {
  all: [
    { reference: "Al-Fatiha (1:1-7)", preview: "The Opening - foundation of every prayer" },
    { reference: "Ayat al-Kursi (2:255)", preview: "The Throne Verse - greatest ayah" },
    { reference: "Al-Ikhlas (112:1-4)", preview: "Purity of Faith - worth one-third of Quran" },
    { reference: "Al-Falaq (113:1-5)", preview: "The Daybreak - protection from evil" },
    { reference: "An-Nas (114:1-6)", preview: "Mankind - protection from whispers" },
    { reference: "Sahih Bukhari 1", preview: "Actions are by intentions" },
  ],
  quran: [
    { reference: "Al-Fatiha (1:1-7)", preview: "The Opening - Umm al-Quran" },
    { reference: "Al-Baqarah (2:255)", preview: "Ayat al-Kursi - The Throne Verse" },
    { reference: "Al-Baqarah (2:286)", preview: "Allah does not burden a soul beyond capacity" },
    { reference: "Al-Imran (3:190-191)", preview: "Signs for people of understanding" },
    { reference: "An-Nisa (4:36)", preview: "Worship Allah and be good to parents" },
    { reference: "Al-Ma'idah (5:32)", preview: "Whoever saves a life saves all mankind" },
    { reference: "Al-An'am (6:162-163)", preview: "My prayer, sacrifice, life, death for Allah" },
    { reference: "Yusuf (12:87)", preview: "Never despair of Allah's mercy" },
    { reference: "Ar-Ra'd (13:28)", preview: "Hearts find rest in remembrance of Allah" },
    { reference: "Ibrahim (14:7)", preview: "If you are grateful, I will increase you" },
    { reference: "Al-Isra (17:23-24)", preview: "Be kind to parents" },
    { reference: "Al-Kahf (18:10)", preview: "Companions of the Cave" },
    { reference: "Maryam (19:96)", preview: "Allah will grant love to believers" },
    { reference: "Ta-Ha (20:114)", preview: "My Lord, increase me in knowledge" },
    { reference: "Al-Mu'minun (23:115-116)", preview: "Did you think We created you without purpose?" },
    { reference: "An-Nur (24:35)", preview: "Allah is the Light of heavens and earth" },
    { reference: "Ash-Shu'ara (26:80)", preview: "When I am ill, He heals me" },
    { reference: "Al-Ankabut (29:69)", preview: "Those who strive, We guide to Our paths" },
    { reference: "Ar-Rum (30:21)", preview: "Among His signs - He created spouses" },
    { reference: "Luqman (31:17)", preview: "Luqman's advice to his son" },
    { reference: "Ya-Sin (36:58)", preview: "Peace - a word from a Merciful Lord" },
    { reference: "Az-Zumar (39:53)", preview: "Do not despair of Allah's mercy" },
    { reference: "Fussilat (41:34)", preview: "Repel evil with what is better" },
    { reference: "Ash-Shura (42:30)", preview: "Whatever misfortune befalls you..." },
    { reference: "Al-Hujurat (49:13)", preview: "We made you nations and tribes to know each other" },
    { reference: "Ar-Rahman (55:13)", preview: "Which favors of your Lord will you deny?" },
    { reference: "Al-Hashr (59:22-24)", preview: "He is Allah, there is no god but He" },
    { reference: "As-Saff (61:13)", preview: "Help from Allah and victory near" },
    { reference: "Al-Mulk (67:1-2)", preview: "Blessed is He who holds all dominion" },
    { reference: "Al-Ikhlas (112:1-4)", preview: "Say: He is Allah, the One" },
    { reference: "Al-Falaq (113:1-5)", preview: "I seek refuge in the Lord of daybreak" },
    { reference: "An-Nas (114:1-6)", preview: "I seek refuge in the Lord of mankind" },
  ],
  hadith: [
    { reference: "Sahih Bukhari 1", preview: "Actions are judged by intentions" },
    { reference: "Sahih Bukhari 6018", preview: "None of you truly believes until loves for brother..." },
    { reference: "Sahih Muslim 2564", preview: "Do not envy, hate, or turn away from each other" },
    { reference: "Sahih Muslim 2577", preview: "Allah is beautiful and loves beauty" },
    { reference: "Sahih Muslim 2699", preview: "Whoever relieves a believer's hardship..." },
    { reference: "Jami at-Tirmidhi 2516", preview: "Be mindful of Allah, He will protect you" },
    { reference: "Sunan Ibn Majah 4141", preview: "Take advantage of five before five" },
    { reference: "40 Hadith Nawawi 1", preview: "Actions are by intentions" },
    { reference: "40 Hadith Nawawi 2", preview: "Islam, Iman, and Ihsan" },
    { reference: "40 Hadith Nawawi 18", preview: "Fear Allah wherever you are" },
    { reference: "Riyadh as-Salihin 183", preview: "The strong believer is better" },
    { reference: "Sahih Bukhari 5063", preview: "The best of you is best to his family" },
  ],
  dua: [
    { reference: "Rabbana atina (2:201)", preview: "Our Lord, give us good in this world and the next" },
    { reference: "Rabbi zidni ilma (20:114)", preview: "My Lord, increase me in knowledge" },
    { reference: "Rabbana la tuzigh (3:8)", preview: "Our Lord, do not let our hearts deviate" },
    { reference: "Rabbi inni lima anzalta (28:24)", preview: "My Lord, I am in need of whatever good You send" },
    { reference: "Allahumma inni a'udhu bika (2:286)", preview: "Our Lord, do not burden us beyond capacity" },
    { reference: "Hasbunallahu wa ni'mal wakil", preview: "Allah is sufficient for us, excellent trustee" },
    { reference: "La ilaha illa anta subhanaka", preview: "Prophet Yunus's du'a from the whale" },
    { reference: "Rabbana hab lana (25:74)", preview: "Grant us spouses and children who are a joy" },
  ],
  names: [
    { reference: "Ar-Rahman (الرحمن)", preview: "The Most Gracious" },
    { reference: "Ar-Rahim (الرحيم)", preview: "The Most Merciful" },
    { reference: "Al-Malik (الملك)", preview: "The King, The Sovereign" },
    { reference: "Al-Quddus (القدوس)", preview: "The Most Holy" },
    { reference: "As-Salam (السلام)", preview: "The Source of Peace" },
    { reference: "Al-Mu'min (المؤمن)", preview: "The Guardian of Faith" },
    { reference: "Al-Aziz (العزيز)", preview: "The Almighty" },
    { reference: "Al-Jabbar (الجبار)", preview: "The Compeller" },
    { reference: "Al-Khaliq (الخالق)", preview: "The Creator" },
    { reference: "Al-Ghaffar (الغفار)", preview: "The Ever-Forgiving" },
    { reference: "Al-Wadud (الودود)", preview: "The Most Loving" },
    { reference: "Al-Hakim (الحكيم)", preview: "The Most Wise" },
  ],
}

export default function SelectionPage() {
  const router = useRouter()
  const { isLoading, loadingStep, generateDevotional } = useDevotional()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    const ready = await generateDevotional(searchQuery, true)
    if (ready) {
      router.push("/verse")
    }
  }, [searchQuery, generateDevotional, router])

  const handlePopularVerseClick = async (reference: string) => {
    const ready = await generateDevotional(reference, true)
    if (ready) {
      router.push("/verse")
    }
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "quran", label: "Quran" },
    { id: "hadith", label: "Hadith" },
    { id: "dua", label: "Du'a" },
    { id: "names", label: "99 Names" },
  ]

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 mx-auto max-w-md shadow-2xl bg-background">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm p-6 text-center">
          <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold mb-2">{t("generating")}</h2>
          <p className="text-sm text-muted-foreground animate-pulse">{loadingStep || "Preparing your reflection..."}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center px-4 py-4 justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <button
          onClick={() => router.push("/")}
          className="flex size-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
          disabled={isLoading}
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">Search Quran & Hadith</h2>
        <div className="w-10"></div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g., Al-Baqarah 2:255 or Bukhari 1"
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all"
          >
            Go
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1">
          Tip: Use Surah name and ayah number (Al-Fatiha 1:5) or hadith collection and number (Bukhari 6018)
        </p>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Selections */}
      <div className="flex-1 px-4 py-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          {activeTab === "all" ? "Popular Selections" : `Popular ${tabs.find(t => t.id === activeTab)?.label}`}
        </h3>
        <div className="flex flex-col gap-2">
          {POPULAR_VERSES[activeTab].map((verse, idx) => (
            <button
              key={idx}
              onClick={() => handlePopularVerseClick(verse.reference)}
              disabled={isLoading}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all text-left group disabled:opacity-50"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                  {verse.reference}
                </p>
                <p className="text-xs text-muted-foreground truncate">{verse.preview}</p>
              </div>
              <span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">
                arrow_forward
              </span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
