import { searchDocuments } from './rag'
import { chatCompletion } from './ai'

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
}

export const runAgent = async (userPrompt: string, history: AgentMessage[] = []) => {
  const systemPrompt = `Bạn là nhân viên hỗ trợ khách hàng của cửa hàng thiết bị điện tử. 
Mục tiêu của bạn là giúp khách hàng tìm kiếm thông tin sản phẩm một cách chính xác nhất dựa trên kho dữ liệu của cửa hàng.

HƯỚNG DẪN:
-----------
1. Hãy luôn ưu tiên sử dụng công cụ 'search_knowledge_base' để tìm thông tin thực tế về sản phẩm, giá cả và thông số.
2. Nếu không tìm thấy thông tin trong hệ thống, hãy trả lời rằng: "Xin lỗi, hiện tại tôi không tìm thấy thông tin cụ thể về sản phẩm này trong kho hàng."
3. Trả lời bằng tiếng Việt một cách lịch sự, chuyên nghiệp.
4. Trình bày kết quả bằng Markdown (sử dụng bảng hoặc danh sách nếu cần).

CÔNG CỤ:
---------
- search_knowledge_base: Tìm kiếm dữ liệu sản phẩm trong hệ thống.

QUY TRÌNH:
-----------
Thought: Phân tích câu hỏi của khách hàng.
Action: search_knowledge_base
Action Input: [Từ khóa tìm kiếm]
Observation: [Kết quả từ hệ thống]
Final Answer: [Câu trả lời cho khách hàng dựa trên kết quả tìm thấy]

LƯU Ý QUAN TRỌNG: 
- Khi đưa ra 'Final Answer', TUYỆT ĐỐI KHÔNG ĐƯỢC lặp lại các bước Thought, Action hay Observation. Chỉ đưa ra câu trả lời cuối cùng cho khách hàng.
- Không sử dụng các từ khóa Thought, Action, Observation bên trong phần Final Answer.`

  let messages: AgentMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userPrompt }
  ]

  let iterations = 0
  const maxIterations = 5

  while (iterations < maxIterations) {
    const response = await chatCompletion(messages, process.env.AI_MODEL || 'gemini-2.0-flash')
    const content = response?.content || ''
    if (!content) {
      console.warn('[Agent] Received empty response from LLM.')
      break
    }
    console.log(`[Agent Iteration ${iterations}] LLM Output:`, content)
    
    // Push the assistant message to history
    // We split by Observation just in case the model hallucinates it immediately
    const cleanContent = content.split(/Observation:/i)[0].trim()
    messages.push({ role: 'assistant', content: cleanContent })
    
    // Check for Tool Call (Priority over Final Answer if both exist in a confused output)
    const actionMatch = content.match(/Action:\s*(search_knowledge_base)/i)
    const actionInputMatch = content.match(/Action Input:\s*(.*)/i)

    if (actionMatch && actionInputMatch) {
      const query = actionInputMatch[1]?.split('\n')[0].trim() || ''
      console.log(`[Agent] Tool Call: search_knowledge_base("${query}")`)
      
      try {
        const results = await searchDocuments(query)
        console.log(`[Agent] Search Results found: ${results.length}`)
        const observation = results.length > 0 
          ? results.map((r: any, i: number) => `[Document ${i+1}]: ${r.content}`).join('\n---\n')
          : "Không tìm thấy thông tin phù hợp trong kho dữ liệu."
        
        messages.push({ role: 'user', content: `Observation: ${observation}` })
      } catch (error: any) {
        messages.push({ role: 'user', content: `Observation: Error searching knowledge base: ${error.message}` })
      }
      iterations++
      continue
    }

    // If we've reached here, it's a final response turn
    let finalAnswer = content

    // 1. If "Final Answer:" exists, prioritize everything AFTER the LAST occurrence of it
    if (content.match(/Final Answer:/i)) {
      const parts = content.split(/Final Answer:/i)
      finalAnswer = parts[parts.length - 1].trim()
    }

    // 2. Aggressively strip any ReAct keywords and their associated blocks.
    // We look for any of the internal keywords (optionally bolded) and remove the entire block from start to end.
    const reactKeywords = ['Thought', 'Action', 'Action Input', 'Observation', 'Final Answer']
    
    reactKeywords.forEach(kw => {
      // Regex to match the keyword (bolded or not) and optionally a colon
      const kwRegex = new RegExp(`(\\*\\*|__)?${kw}(\\*\\*|__)?[:\\s]`, 'gmi')
      
      // If the keyword is found, we want to be careful. 
      // If it's the "Final Answer" keyword, we already handled it by taking the part after.
      // For others, if they appear in our "finalAnswer", they are leaks.
      if (kw !== 'Final Answer' && kwRegex.test(finalAnswer)) {
        // Remove the keyword line and everything that follows until another keyword or end of string
        // We'll use a more surgical approach: split by all keywords and take only the parts that don't start with keywords
        const allKeywordsRegex = /(\*\*|__)?(Thought|Action|Action Input|Observation|Final Answer)(\*\*|__)?[:\s]/gmi
        const segments = finalAnswer.split(allKeywordsRegex)
        // Note: split with capturing groups returns the groups in the array. 
        // Array structure: [textBefore, grp1, keyword, grp3, textAfter, grp1, keyword, grp3, textAfter...]
        
        let cleanedParts = []
        // The first element is always text before the first keyword match
        if (segments[0] && !segments[0].match(allKeywordsRegex)) {
          cleanedParts.push(segments[0])
        }
        
        // Loop through segments. Keywords are at indices 2, 6, 10...
        // But wait, it's easier to just use replace with a multiline match for the whole block
        finalAnswer = finalAnswer.replace(/(\*\*|__)?(Thought|Action|Action Input|Observation)(\*\*|__)?[:\s][\s\S]*?(?=(\*\*|__)?(?:Thought|Action|Action Input|Observation|Final Answer)(\*\*|__)?[:\s]|$)/gmi, '')
      }
    })

    // Final cleanup of any remaining keyword labels
    finalAnswer = finalAnswer
      .replace(/(\*\*|__)?(Thought|Action|Action Input|Observation|Final Answer)(\*\*|__)?[:\s]/gmi, '')
      .trim()

    if (finalAnswer) {
      console.log(`[Agent] Returning final cleaned answer:`, finalAnswer)
      return finalAnswer
    }

    iterations++
  }

  const lastMessage = messages[messages.length - 1]
  const lastContent = lastMessage?.content || ''
  
  // Try one last time to extract from Final Answer, otherwise return the whole message
  const finalSplit = lastContent.split('Final Answer:')
  const finalAnswer = finalSplit.length > 1 ? finalSplit.pop()?.trim() : lastContent.replace(/Thought:.*$/gm, '').trim()

  return finalAnswer || 'Xin lỗi, tôi không thể tìm thấy thông tin phù hợp.'
}
