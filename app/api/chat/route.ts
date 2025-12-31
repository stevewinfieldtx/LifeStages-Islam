import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"

export async function POST(req: Request) {
  try {
    const { message, verseReference, verseText, history, source, tradition = "secular" } = await req.json()

    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const traditionGuidance = {
      secular: "Use accessible, practical language. Focus on how the teaching applies to daily life. Reference teachers like Jon Kabat-Zinn, Tara Brach, Jack Kornfield when relevant.",
      theravada: "Use Pali terminology appropriately (Dhamma, Sati, Dukkha). Reference the Buddha's original teachings, Ajahn Chah, Bhikkhu Bodhi when relevant.",
      mahayana: "Emphasize compassion, interconnection, the bodhisattva path. Reference teachers like Thich Nhat Hanh. Use Sanskrit terms where appropriate.",
      zen: "Be direct, sometimes paradoxical. Point to immediate experience rather than concepts. Reference Shunryu Suzuki, koans when relevant.",
      tibetan: "Include warmth about working with emotions, mind training. Reference Pema Chödrön, the Dalai Lama, lojong teachings when relevant.",
    }

    const systemPrompt = `You are a helpful, wise dharma friend helping someone explore Buddhist teachings. You are discussing: ${verseReference} ("${verseText}").
${source ? `This teaching is from: ${source}` : ""}

Tradition: ${tradition}
${traditionGuidance[tradition as keyof typeof traditionGuidance] || traditionGuidance.secular}

Guidelines:
- Keep responses concise (under 100 words) and conversational
- Ask open-ended questions to help the practitioner reflect and deepen understanding
- Be warm, encouraging, and supportive - like a wise dharma friend
- Reference the specific teaching when relevant
- Connect to meditation practice and daily life application
- Feel free to reference related teachings, teachers, or practices
- If they ask about other topics, gently guide back to the teaching at hand
- Never be preachy - Buddhism is about personal discovery, not moralizing
- Meet people where they are - don't assume any particular level of practice
- NEVER invent quotes or attribute fake teachings to the Buddha or other teachers`

    // Build conversation history for context
    const conversationContext =
      history
        ?.slice(-6)
        .map((msg: { sender: string; text: string }) => `${msg.sender}: ${msg.text}`)
        .join("\n") || ""

    const prompt = conversationContext
      ? `Previous conversation:\n${conversationContext}\n\nPractitioner: ${message}\n\nRespond helpfully:`
      : `Practitioner: ${message}\n\nRespond helpfully:`

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemPrompt,
      prompt,
      maxTokens: 500,
    })

    return Response.json({ response: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ response: "I apologize, but I had trouble responding. Please try again." }, { status: 500 })
  }
}
