# NuxtJS RAG AI Agent

Ứng dụng chatbot hiện đại sử dụng Nuxt 3, tích hợp ReAct AI Agent và kỹ thuật RAG (Retrieval-Augmented Generation) với cơ sở dữ liệu vector local.

## 🚀 Tính năng

- **Giao diện Premium**: Thiết kế tối giản, hiệu ứng Glassmorphism, hỗ trợ Dark mode.
- **ReAct Agent**: AI có khả năng suy nghĩ (Thought) và thực hiện hành động (Action) để tìm kiếm kiến thức.
- **RAG Integration**: Tìm kiếm dữ liệu liên quan từ PostgreSQL (pgvector) trước khi trả lời.
- **OpenAI Compatible**: Hoạt động với bất kỳ proxy nào tương thích OpenAI API (mặc định sử dụng `llm.wokushop.com`).

## 🛠 Yêu cầu hệ thống

- Node.js > 18.x
- Docker & Docker Compose (để chạy PostgreSQL local)
- API Key từ `llm.wokushop.com` hoặc OpenAI.

## 📦 Hướng dẫn cài đặt

### 1. Clone và cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình Environment
Tạo file `.env` từ nội dung sau (đã có sẵn trong project):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rag_db?schema=public"
AI_API_KEY="YOUR_API_KEY_HERE"
AI_BASE_URL="https://llm.wokushop.com/v1"
AI_MODEL="gemini-2.0-flash"
```

### 3. Khởi chạy Database
Chạy PostgreSQL với pgvector bằng Docker:
```bash
docker compose up -d
```

### 4. Đồng bộ Database Schema
```bash
npx prisma db push
```

### 5. Chạy nhanh bằng Script
Hoặc bạn có thể chạy tất cả các bước trên chỉ bằng 1 lệnh duy nhất:
```bash
./start.sh
```

### 6. Chạy ứng dụng (Thủ công)
```bash
npm run dev
```
Truy cập: `http://localhost:3000`

## 🧠 Cấu trúc Agent (ReAct)

Agent được triển khai trong `server/utils/agent.ts` theo quy trình:
1. **Thought**: AI phân tích yêu cầu của người dùng.
2. **Action**: Nếu chưa đủ thông tin, AI gọi công cụ `search_knowledge_base`.
3. **Observation**: Kết quả từ database vector được trả về.
4. **Final Answer**: Tổng hợp thông tin và phản hồi người dùng.

## 📂 Search Logic (RAG)
Kỹ thuật tìm kiếm similarity sử dụng toán tử `<=>` của pgvector:
```sql
SELECT content FROM "Document" 
ORDER BY embedding <=> '[vector_query]'::vector 
LIMIT 3;
```

## 📝 Ghi chú cho phần Embedding
Để nhúng dữ liệu vào database, bạn cần tạo các bản ghi trong bảng `Document` với cột `embedding` là một mảng `number[]` có 1536 chiều (tương ứng với model `text-embedding-3-small`).

## 📥 Nhúng dữ liệu vào Vector Database

Để Agent có thể trả lời về các dòng điện thoại, bạn cần nhúng dữ liệu từ file `phones.txt` vào database:

1. Đảm bảo file `.env` đã có `AI_API_KEY`.
2. Chạy lệnh sau:
```bash
npx tsx ingest.ts
```

Sau khi chạy xong, bạn có thể hỏi Agent những câu như: "Cấu hình iPhone 15 Pro Max như thế nào?" hoặc "Điện thoại nào bảo hành 24 tháng?". Agent sẽ tự động tìm kiếm trong database và trả lời.

---
*Chúc bạn có trải nghiệm tuyệt vời với AI Agent!*
