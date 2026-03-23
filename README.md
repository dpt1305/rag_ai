# NuxtJS RAG AI Agent (v4)

Ứng dụng chatbot hiện đại sử dụng Nuxt 4, tích hợp ReAct AI Agent và kỹ thuật RAG (Retrieval-Augmented Generation) với cơ sở dữ liệu vector PostgreSQL (pgvector).

---

## 🚀 Tính năng nổi bật

- **Giao diện Premium**: Thiết kế tối giản, hiệu ứng Glassmorphism, hỗ trợ Dark mode và trải nghiệm chat mượt mà.
- **ReAct Agent (Sạch & Bảo mật)**: AI có khả năng suy nghĩ (Thought) và thực hiện hành động (Action) nhưng các bước trung gian đã được **ẩn hoàn toàn** khỏi người dùng cuối. 
- **Hybrid Search (Tìm kiếm hỗn hợp)**: Kết hợp tìm kiếm Vector (Semantic Search) và tìm kiếm từ khóa (`ILIKE`). Tự động fallback sang từ khóa nếu API Embedding gặp lỗi (403).
- **Nuxt 4 Structure**: Sử dụng thư mục `app/` cho mã nguồn frontend và `server/` cho backend/api.

---

## 🛠 Yêu cầu hệ thống

- **Node.js**: > 18.x
- **Docker**: Để chạy PostgreSQL + pgvector local.
- **AI API**: Key từ `llm.wokushop.com` hoặc OpenAI (hỗ trợ các model như `gemini-2.0-flash`).

---

## 📦 Hướng dẫn cài đặt nhanh

### 1. Chuẩn bị
Tạo file `.env` (ví dụ):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rag_db"
AI_API_KEY="AI_GOM_CUA_BAN"
AI_BASE_URL="https://llm.wokushop.com/v1"
AI_MODEL="gemini-2.0-flash"
AI_EMBEDDING_MODEL="text-embedding-3-small"
```

### 2. Chạy ứng dụng bằng một lệnh duy nhất
Nếu bạn đã có `.env`, chỉ cần chạy:
```bash
chmod +x start.sh
./start.sh
```
*Lệnh này sẽ tự động khởi động Docker, cài đặt thư viện, push schema và chạy ứng dụng.*

---

## 📥 Nhúng dữ liệu (Data Ingestion)

Hệ thống hỗ trợ nạp dữ liệu từ toàn bộ thư mục `data/`. Bạn có thể thêm các file `.txt` (điện thoại, linh kiện, phụ kiện...) vào đây.

Để nạp dữ liệu mới:
```bash
npx tsx ingest.ts
```

---

## 🧠 Tài liệu hướng dẫn chuyên sâu

Để hiểu rõ hơn về cách xây dựng, tối ưu hóa RAG và xử lý các lỗi thường gặp trong Agent, bạn có thể tham khảo:

- **[RAG_INSTRUCTION.md](file:///Users/dpt1305/1.Code/3.rag_agent/RAG_INSTRUCTION.md)**: Hướng dẫn chi tiết từng bước, ví dụ thực tế về System Prompt, Hybrid Search và bảo mật log nội bộ.

---

## 🧠 Kiến thức bổ trợ về AI Chatbot

Đây là phần ghi chú giúp bạn hiểu sâu hơn về cơ chế vận hành của các chatbot hiện đại:

### 1. Các Vai Trò (Roles) trong Hội Thoại
Mỗi tin nhắn gửi cho AI luôn được gắn một "nhãn" để AI biết ai đang nói:
- **`system`**: Quy định "luật chơi" và tính cách cho AI (ví dụ: "Bạn là chuyên gia tư vấn kỹ thuật").
- **`user`**: Nội dung câu hỏi/yêu cầu trực tiếp từ bạn.
- **`assistant`**: Câu trả lời của AI (bao gồm cả suy nghĩ nội bộ và kết quả cuối cùng).
- **`tool` / `function`**: Kết quả thực tế từ các công cụ (như Database Search) trả về để AI tổng hợp.

### 2. Cách AI Hiểu Ngữ Cảnh (Context)
AI không có bộ nhớ vĩnh viễn tự nhiên. Nó hiểu ngữ cảnh bằng cách **đọc lại toàn bộ lịch sử chat** mỗi khi bạn gửi tin nhắn mới.

### 3. Cách Xử Lý Khi Đoạn Chat Quá Dài
Gửi toàn bộ lịch sử sẽ gây tốn Token (phí) và làm AI chậm đi. Có 3 giải pháp chính:
- **Cửa sổ trượt (Sliding Window)**: Chỉ gửi 10-20 tin nhắn gần nhất. Đây là cách làm cân bằng nhất giữa tốc độ và trí nhớ.
- **Tóm tắt (Summarization)**: AI tự tóm tắt đoạn chat cũ thành 1 câu ngắn để tiết kiệm không gian.
- **Vector Memory (Long-term Memory)**: Lưu toàn bộ chat vào Database Vector và chỉ "bốc" lại những câu có liên quan nhất khi cần.

---

## 📂 Search Logic & Polish

- **Search**: Ưu tiên Cosine Similarity (`<=>`) nhưng có logic catch lỗi để dùng `ILIKE`.
- **Polish**: Backend thực hiện regex để loại bỏ `Thought`, `Action`, `Observation` trước khi gửi kết quả về Chat UI.

---
*Chúc bạn có trải nghiệm tuyệt vời với AI Agent cao cấp này!*
