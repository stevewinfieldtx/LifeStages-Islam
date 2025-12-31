"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { useSubscription } from "@/context/subscription-context"

interface ProfileData {
  fullName: string
  email: string
  ageRange: string
  gender: string
  stageSituation: string
  contentMode: "casual" | "academic"
  tradition: string
  diveDeeper: {
    autismFamily: boolean
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { canAccessPremium } = useSubscription()
  const [formData, setFormData] = useState<ProfileData>({
    fullName: "",
    email: "",
    ageRange: "",
    gender: "",
    stageSituation: "Nothing special",
    contentMode: "casual",
    tradition: "general",
    diveDeeper: {
      autismFamily: false,
    },
  })

  useEffect(() => {
    const savedData = localStorage.getItem("userProfile")
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setFormData({
        fullName: parsed.fullName || "",
        email: parsed.email || "",
        ageRange: parsed.ageRange || "",
        gender: parsed.gender || "",
        stageSituation: parsed.stageSituation || parsed.season || "Nothing special",
        contentMode: parsed.contentMode || "casual",
        tradition: parsed.tradition || "general",
        diveDeeper: {
          autismFamily: parsed.diveDeeper?.autismFamily || false,
        },
      })
    }
  }, [])

  const handleChange = (field: string, value: string | boolean) => {
    const updated = { ...formData, [field]: value }
    if (field === "stageSituation" && !canAccessPremium) {
      updated.stageSituation = "Nothing special"
    }
    setFormData(updated)
    localStorage.setItem("userProfile", JSON.stringify(updated))
  }

  const handleDiveDeeperChange = (option: string, value: boolean) => {
    const updated = {
      ...formData,
      diveDeeper: {
        ...formData.diveDeeper,
        [option]: value,
      },
    }
    setFormData(updated)
    localStorage.setItem("userProfile", JSON.stringify(updated))
  }

  const handleSave = () => {
    router.push("/")
  }

  const ageRanges = [
    { value: "child", label: "Child (6-12)" },
    { value: "teen", label: "Teen (13-17)" },
    { value: "youth", label: "Young Adult (18-30)" },
    { value: "adult", label: "Adult (31-64)" },
    { value: "senior", label: "Senior (65+)" },
  ]

  const traditions = [
    { value: "general", label: "General Islamic" },
    { value: "sunni", label: "Sunni" },
    { value: "shia", label: "Shia" },
    { value: "sufi", label: "Sufi" },
  ]

  const stageSituationGroups = [
    {
      label: "Spiritual Journey",
      options: [
        "New Muslim / Convert",
        "Seeking knowledge",
        "Strengthening iman",
        "Ramadan preparation",
      ]
    },
    {
      label: "Pilgrimage",
      options: [
        "Preparing for Hajj",
        "Post-Hajj reflection",
        "Planning Umrah",
      ]
    },
    {
      label: "Family Life",
      options: [
        "Marriage preparation",
        "New parent",
        "Raising Muslim children",
        "Family difficulties",
      ]
    },
    {
      label: "Life Challenges",
      options: [
        "Grief and loss",
        "Health challenges",
        "Career decisions",
        "Financial difficulty",
      ]
    }
  ]

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 mx-auto max-w-md shadow-2xl bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <button
          onClick={() => router.push("/")}
          className="flex size-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
            arrow_back_ios_new
          </span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{t("profile")}</h2>
        <div className="w-10"></div>
      </div>

      {/* Page Indicators */}
      <div className="flex w-full flex-row items-center justify-center gap-2 py-4">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
        <div className="h-2 w-2 rounded-full bg-border"></div>
        <div className="h-2 w-2 rounded-full bg-border"></div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col px-6 pt-2">
        <h1 className="text-[32px] font-bold leading-tight text-left pb-2">Let&apos;s get to know you</h1>
        <p className="text-base font-normal leading-normal text-muted-foreground">Personalize your Quranic study experience</p>
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-5 px-6 py-6">
        <label className="flex flex-col gap-1.5 w-full">
          <p className="text-sm font-medium leading-normal">{t("language")}</p>
          <LanguageSelector variant="full" />
        </label>

        {/* Name Input */}
        <label className="flex flex-col gap-1.5 w-full">
          <p className="text-sm font-medium leading-normal">Your Name</p>
          <input
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="flex w-full resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-card h-14 placeholder:text-muted-foreground px-4 text-base font-normal leading-normal shadow-sm transition-all"
            placeholder="Enter your name"
          />
        </label>

        {/* Email Input */}
        <label className="flex flex-col gap-1.5 w-full">
          <p className="text-sm font-medium leading-normal">{t("email")}</p>
          <input
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="flex w-full resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-card h-14 placeholder:text-muted-foreground px-4 text-base font-normal leading-normal shadow-sm transition-all"
            placeholder="name@example.com"
            type="email"
          />
        </label>

        <div className="flex flex-row gap-4">
          <label className="flex flex-col gap-1.5 w-1/2">
            <p className="text-sm font-medium leading-normal">{t("ageRange")}</p>
            <div className="relative">
              <select
                value={formData.ageRange}
                onChange={(e) => handleChange("ageRange", e.target.value)}
                className="flex w-full resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-card h-14 px-4 text-base font-normal leading-normal shadow-sm appearance-none transition-all"
              >
                <option disabled value="">
                  Select
                </option>
                {ageRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </label>
          <label className="flex flex-col gap-1.5 w-1/2">
            <p className="text-sm font-medium leading-normal">{t("gender")}</p>
            <div className="relative">
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="flex w-full resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-card h-14 px-4 text-base font-normal leading-normal shadow-sm appearance-none transition-all"
              >
                <option disabled value="">
                  Select
                </option>
                <option value="female">Sister</option>
                <option value="male">Brother</option>
                <option value="other">Prefer not to say</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </label>
        </div>

        {/* Islamic Tradition */}
        <label className="flex flex-col gap-1.5 w-full">
          <p className="text-sm font-medium leading-normal">Islamic Background (Optional)</p>
          <div className="relative">
            <select
              value={formData.tradition}
              onChange={(e) => handleChange("tradition", e.target.value)}
              className="flex w-full resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-card h-14 px-4 text-base font-normal leading-normal shadow-sm appearance-none transition-all"
            >
              {traditions.map((trad) => (
                <option key={trad.value} value={trad.value}>
                  {trad.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Helps us tailor content to your tradition</p>
        </label>

        {/* Content Style Toggle */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">school</span>
            <h3 className="text-lg font-bold leading-tight">Content Style</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Choose how you&apos;d like your content presented.</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange("contentMode", "casual")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                formData.contentMode === "casual"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span className="material-symbols-outlined text-2xl" style={{ color: formData.contentMode === "casual" ? "var(--primary)" : "var(--muted-foreground)" }}>
                favorite
              </span>
              <span className={`text-sm font-semibold ${formData.contentMode === "casual" ? "text-primary" : "text-foreground"}`}>
                Devotional
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Warm, accessible, spiritually uplifting
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => handleChange("contentMode", "academic")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                formData.contentMode === "academic"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span className="material-symbols-outlined text-2xl" style={{ color: formData.contentMode === "academic" ? "var(--primary)" : "var(--muted-foreground)" }}>
                library_books
              </span>
              <span className={`text-sm font-semibold ${formData.contentMode === "academic" ? "text-primary" : "text-foreground"}`}>
                Academic
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Scholarly, tafsir-based, in-depth analysis
              </span>
            </button>
          </div>
          
          {formData.contentMode === "academic" && (
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Academic mode includes:</span> Arabic linguistic analysis, citations from classical mufassirun (Ibn Kathir, al-Tabari, al-Qurtubi), hadith sciences, fiqh comparisons across madhabs, and references to scholarly works.
              </p>
            </div>
          )}
        </div>

        {/* Dive Deeper Options */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">explore</span>
            <h3 className="text-lg font-bold leading-tight">Dive Deeper Options</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Enable additional reflection options.</p>
          
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/50 transition-all">
              <input
                type="checkbox"
                checked={formData.diveDeeper.autismFamily}
                onChange={(e) => handleDiveDeeperChange("autismFamily", e.target.checked)}
                className="sr-only peer"
              />
              <div className={`size-10 rounded-full flex items-center justify-center transition-all ${formData.diveDeeper.autismFamily ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white" : "bg-muted text-muted-foreground"}`}>
                <span className="material-symbols-outlined">family_restroom</span>
              </div>
              <div className="flex-1">
                <span className={`font-semibold block ${formData.diveDeeper.autismFamily ? "text-primary" : "text-foreground"}`}>
                  Autism Family Support
                </span>
                <span className="text-xs text-muted-foreground">
                  Reflections for families with autistic loved ones
                </span>
              </div>
              <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.diveDeeper.autismFamily ? "border-primary bg-primary" : "border-border"}`}>
                {formData.diveDeeper.autismFamily && (
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                )}
              </div>
            </label>
          </div>
        </div>

        {canAccessPremium && (
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">spa</span>
              <h3 className="text-lg font-bold leading-tight">Life Stage</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Select your current life situation for personalized content.</p>
            
            {/* Nothing Special option first */}
            <label className="cursor-pointer group relative mb-4 block">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={formData.stageSituation === "Nothing special"}
                onChange={() => handleChange("stageSituation", "Nothing special")}
              />
              <div className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary hover:border-primary/50 inline-block">
                General / No specific stage
              </div>
            </label>

            {/* Grouped options */}
            {stageSituationGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option, idx) => (
                    <label key={idx} className="cursor-pointer group relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={formData.stageSituation === option}
                        onChange={() => handleChange("stageSituation", option)}
                      />
                      <div className="rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary hover:border-primary/50">
                        {option}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!canAccessPremium && (
          <div className="pt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: "24px" }}>
                workspace_premium
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground mb-1">Personalize Your Experience</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Unlock Life Stage personalization to get reflections tailored to your specific situation - whether you&apos;re preparing for Hajj, a new parent, or going through a challenging time.
                </p>
                <button
                  onClick={() => router.push("/subscription")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Learn about Premium →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="h-px bg-border my-4"></div>
        <button
          onClick={handleSave}
          className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-5 bg-primary text-primary-foreground text-base font-bold leading-normal tracking-[0.015em] shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <span className="truncate">{t("saveProfile")}</span>
        </button>
      </div>
    </div>
  )
}
