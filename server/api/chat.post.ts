import { runAgent } from '../utils/agent'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt, history } = body

  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required',
    })
  }

  try {
    const response = await runAgent(prompt, history || [])
    return { response }
  } catch (error: any) {
    console.error('Agent Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error',
    })
  }
})
