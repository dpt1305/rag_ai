import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { generateEmbedding } from './server/utils/ai'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  const dataDir = path.join(process.cwd(), 'data')
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.txt'))

  console.log(`Tìm thấy ${files.length} tệp dữ liệu trong thư mục data/`)

  // Xóa dữ liệu cũ để tránh trùng lặp nếu cần
  console.log('Đang làm sạch dữ liệu cũ...')
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Document";')

  for (const file of files) {
    const filePath = path.join(dataDir, file)
    console.log(`\n>>> Đang xử lý tệp: ${file}`)
    
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim() !== '' && !line.startsWith('['))

    console.log(`Tìm thấy ${lines.length} dòng dữ liệu...`)

    for (const line of lines) {
      console.log(`Đang xử lý [${file}]: ${line.substring(0, 50)}...`)
      
      let vectorString: string | null = null
      try {
        const embedding = await generateEmbedding(line)
        if (embedding && embedding.length > 0) {
          vectorString = `'[${embedding.join(',')}]'::vector`
        }
      } catch (err: any) {
        console.warn(`⚠️  Không thể tạo embedding cho dòng này (403/Error). Sẽ chỉ lưu text để search keyword.`)
      }

      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Document" (id, content, embedding, "updatedAt")
          VALUES ('${Math.random().toString(36).substring(7)}', '${line.replace(/'/g, "''")}', ${vectorString || 'NULL'}, NOW());
        `)
      } catch (err: any) {
        console.error(`❌ Lỗi khi lưu vào database:`, err.message)
      }
    }
  }

  console.log('\n✅ Hoàn thành nhúng toàn bộ dữ liệu!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
