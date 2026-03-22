# Hướng dẫn chi tiết về RAG (Retrieval-Augmented Generation)

Tài liệu này hướng dẫn cách xây dựng và tối ưu hóa hệ thống RAG, giúp AI có khả năng truy xuất dữ liệu từ kho kiến thức riêng của bạn, kèm theo các ví dụ thực tế trong dự án này.

---

## 1. RAG là gì?
RAG là kỹ thuật kết hợp sức mạnh của Mô hình ngôn ngữ lớn (LLM) với dữ liệu thực tế của bạn thông qua quy trình: **Truy xuất -> Tăng cường -> Tạo phản hồi**.

---

## 2. Ví dụ thực tế trong dự án này

### A. Cấu trúc dữ liệu (Data Format)
Dữ liệu thô được lưu trong các file `.txt` tại thư mục `data/`. Mỗi dòng là một thông tin sản phẩm:
> `1. iPhone 15 Pro Max - RAM: 12GB, Bộ nhớ: 256GB, Bảo hành: 12 tháng. Giá: 29.990.000đ.`

### B. Hướng dẫn AI (System Prompt)
Chúng ta định nghĩa quy trình ReAct (Thought/Action/Observation) nhưng phải cực kỳ nghiêm ngặt để tránh bị lộ các bước này cho khách hàng:
```typescript
const systemPrompt = `
QUY TRÌNH:
Thought: ... | Action: ... | Action Input: ... | Observation: ... | Final Answer: ...

LƯU Ý QUAN TRỌNG: 
- Khi đưa ra 'Final Answer', TUYỆT ĐỐI KHÔNG ĐƯỢC lặp lại các bước Thought, Action hay Observation. 
- Không sử dụng các từ khóa này bên trong phần Final Answer.
`
```

### C. Cơ chế Hybrid Search & Cleaning
Chúng ta sử dụng Regex mạnh để lọc bỏ mọi "rác" kỹ thuật nếu AI lỡ tay viết ra:
```typescript
// Ví dụ logic xóa bỏ các bước nội bộ trong agent.ts
finalAnswer = finalAnswer.replace(/(\*\*|__)?(Thought|Action|Action Input|Observation)(\*\*|__)?[:\s][\s\S]*?(?=(\*\*|__)?(?:Final Answer)(\*\*|__)?[:\s]|$)/gmi, '')
```

---

## 3. Các lưu ý quan trọng khi triển khai
- **Hiding Internal Logs:** Một số model LLM (như Gemini) có xu hướng lặp lại toàn bộ quá trình suy nghĩ trong câu trả lời cuối. Luôn cần một lớp "Parsing" ở Backend để làm sạch dữ liệu trước khi gửi lên Frontend.
- **Context Management:** Đừng đưa quá nhiều tài liệu vào prompt. Hãy chọn lọc Top 3-5 kết quả liên quan nhất.
- **Fallbuck Search:** Luôn có cơ chế tìm kiếm từ khóa (`ILIKE`) phòng khi API Embedding bị lỗi hoặc hết hạn.
- **Formatting:** Yêu cầu AI trình bày bằng Markdown để kết quả trông chuyên nghiệp hơn (bảng, danh sách).

---

## 4. Các loại Database hỗ trợ
- **PostgreSQL (pgvector):** Hiện đang dùng cho dự án này, rất mạnh mẽ và quen thuộc.
- **Pinecone / ChromaDB:** Nếu bạn cần mở rộng quy mô lên hàng triệu tài liệu.

---

Tài liệu này sẽ giúp bạn hiểu sâu hơn về cách hệ thống hiện tại đang vận hành và cách để bảo trì nó trong tương lai.
