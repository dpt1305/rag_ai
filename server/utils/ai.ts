import OpenAI from 'openai'

const getClient = () => {
  let config: any = {}
  try {
    config = useRuntimeConfig()
  } catch (e) {
    // Silently fail if not in Nuxt context
  }
  return new OpenAI({
    apiKey: process.env.AI_API_KEY || config.aiApiKey,
    baseURL: process.env.AI_BASE_URL || config.aiBaseUrl || 'https://llm.wokushop.com/v1',
  })
}

export const chatCompletion = async (messages: any[], model?: string) => {
  const client = getClient()
  const response = await client.chat.completions.create({
    model: model || process.env.AI_MODEL || 'gemini-2.0-flash',
    messages,
    temperature: 0.2, 
  })
  return response.choices?.[0]?.message
}

export const generateEmbedding = async (text: string) => {
  const client = getClient()
  const response = await client.embeddings.create({
    model: process.env.AI_EMBEDDING_MODEL || 'text-embedding-ada-002',
    input: text,
  })
  return response.data?.[0]?.embedding || []
}
