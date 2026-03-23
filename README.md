# 🤖 NuxtJS RAG AI Agent (v4)

Ứng dụng chatbot hiện đại xây dựng trên **Nuxt 4**, tích hợp **ReAct AI Agent** và kỹ thuật **RAG** (Retrieval-Augmented Generation) chuyên sâu với PostgreSQL (pgvector).

---

## 🌟 Trải nghiệm người dùng & Tính năng

- **Giao diện Premium**: Thiết kế tối giản, hiệu ứng Glassmorphism, hỗ trợ Dark mode và trải nghiệm chat mượt mà.
- **ReAct Agent (Sạch & Bảo mật)**: AI có khả năng suy nghĩ (`Thought`) và thực hiện hành động (`Action`) nhưng các bước trung gian đã được lọc bỏ hoàn toàn trước khi hiển thị cho người dùng.
- **Hybrid Search (Tìm kiếm hỗn hợp)**: Kết hợp tìm kiếm Vector (Semantic Search) và tìm kiếm từ khóa (`ILIKE`). Tự động fallback nếu API Embedding gặp lỗi.
- **Nuxt 4 Structure**: Cấu trúc thư mục hiện đại (`app/` cho frontend và `server/` cho backend).

---

## 🛠 Hướng dẫn cài đặt & Triển khai

### 1. Cấu hình Environment
Tạo file `.env` với các thông số sau:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rag_db"
AI_API_KEY="KEY_CUA_BAN"
AI_BASE_URL="https://llm.wokushop.com/v1"
AI_MODEL="gemini-2.0-flash"
AI_EMBEDDING_MODEL="text-embedding-3-small"
```

### 2. Triển khai chỉ với 1 lệnh
Dự án đã có script tự động để bạn bắt đầu ngay lập tức:
```bash
chmod +x start.sh
./start.sh
```
*Lệnh này sẽ tự động khởi động Docker (PostgreSQL), cài đặt thư viện, đồng bộ database schema và chạy ứng dụng.*

---

## 📥 Quản lý tri thức (Data Ingestion)

Hệ thống hỗ trợ nạp dữ liệu từ toàn bộ thư mục `data/`. Bạn có thể thêm các file `.txt` (điện thoại, linh kiện, phụ kiện...) vào đây để mở rộng kiến thức cho AI.

**Cập nhật dữ liệu mới vào Vector Database:**
```bash
npx tsx ingest.ts
```

---

## 🧠 Kiến thức chuyên sâu: Xây dựng RAG & AI Agent

Phần này giúp bạn hiểu sâu hơn về cơ chế vận hành nội bộ của hệ thống.

### 1. RAG (Retrieval-Augmented Generation) là gì?
RAG là kỹ thuật kết hợp sức mạnh của LLM với dữ liệu thực tế của bạn thông qua quy trình: **Truy xuất (Retrieve) -> Tăng cường (Augment) -> Tạo phản hồi (Generate)**.

### 2. Các Vai Trò (Roles) trong Hội Thoại
Mỗi tin nhắn gửi cho AI luôn được định danh bằng một vai trò:
- **`system`**: Quy định "luật chơi" và tính cách (ví dụ: "Bạn là nhân viên tư vấn").
- **`user`**: Nội dung câu hỏi/yêu cầu trực tiếp từ khách hàng.
- **`assistant`**: Câu trả lời của AI (bao gồm cả suy nghĩ nội bộ và kết quả cuối cùng).
- **`tool`**: Kết quả từ các công cụ (như Database Search) trả về để AI tổng hợp.

### 3. Cách AI Hiểu Ngữ Cảnh (Context Management)
AI hiểu ngữ cảnh bằng cách đọc lại lịch sử chat. Để tránh tốn Token rác, chúng ta sử dụng:
- **Sliding Window**: Chỉ gửi 10-20 tin nhắn gần nhất.
- **Summarization**: Tóm tắt đoạn chat cũ để tiết kiệm không gian.
- **Vector Memory**: Chỉ bốc lại những câu chat cũ có liên quan nhất bằng tìm kiếm Vector.

### 4. Quy trình ReAct & Làm sạch Log (Polish)
AI thực hiện quy trình suy nghĩ nội bộ: `Thought` -> `Action` -> `Observation` -> `Final Answer`. Để đảm bảo thẩm mỹ, Backend thực hiện regex để loại bỏ các bước "nháp" này:

```typescript
// Logic làm sạch tin nhắn trong server/utils/agent.ts
finalAnswer = finalAnswer.replace(/(\*\*|__)?(Thought|Action|Action Input|Observation)(\*\*|__)?[:\s][\s\S]*?(?=(\*\*|__)?(?:Final Answer)(\*\*|__)?[:\s]|$)/gmi, '')
```

---

## 📂 Logic Tìm kiếm Hỗn hợp (Hybrid Search)

Hệ thống ưu tiên sử dụng **Cosine Similarity** (`<=>`) của pgvector để tìm kiếm theo ý nghĩa (Semantic):
```sql
SELECT content FROM "Document" 
ORDER BY embedding <=> '[vector_query]'::vector 
LIMIT 3;
```
Nếu API nhúng (Embedding) gặp lỗi hoặc hết hạn, hệ thống tự động chuyển sang tìm kiếm từ khóa (`ILIKE %query%`) để đảm bảo dịch vụ không bao giờ bị gián đoạn.
### 5. Các lưu ý quan trọng khi triển khai
- **Quản lý Ngữ cảnh (Context):** Đừng đưa quá nhiều tài liệu vào prompt. Hãy chọn lọc Top 3-5 kết quả liên quan nhất để AI không bị loãng thông tin.
- **Trình bày (Formatting):** Hệ thống yêu cầu AI sử dụng Markdown (bảng, danh sách) để kết quả trông chuyên nghiệp và dễ đọc hơn.
- **Cơ sở dữ liệu hỗ trợ:** Hiện dự án sử dụng **PostgreSQL (pgvector)** vì tính mạnh mẽ và phổ biến. Tuy nhiên, kiến thức này có thể áp dụng cho các DB vector khác như Pinecone hoặc ChromaDB.

---
*Dự án được hoàn thiện bởi Antigravity. Chào mừng bạn khám phá tương lai của AI!*

-------------------------------
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
