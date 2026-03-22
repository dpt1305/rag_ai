import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { generateEmbedding } from './ai'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

export const searchDocuments = async (query: string, limit: number = 5) => {
  // Try to use vector search first, but catch any errors (like 403)
  try {
    const embedding = await generateEmbedding(query)
    if (embedding.length > 0) {
      const vectorString = `[${embedding.join(',')}]`
      return await prisma.$queryRawUnsafe<any[]>(`
        SELECT id, content, metadata, 1 - (embedding <=> '${vectorString}'::vector) as score
        FROM "Document"
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> '${vectorString}'::vector
        LIMIT ${limit};
      `)
    }
  } catch (err: any) {
    console.error('Vector search failed, falling back to keyword search:', err.message)
  }

  // Fallback: Keyword search using PostgreSQL ILIKE for each word
  const words = query.split(/\s+/).filter(w => w.length > 1)
  const conditions = words.map(w => `content ILIKE '%${w.replace(/'/g, "''")}%'`).join(' OR ')
  
  if (!conditions) {
    return await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, content, metadata, 1.0 as score FROM "Document" ORDER BY "updatedAt" DESC LIMIT ${limit};
    `)
  }

  return await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, content, metadata, 1.0 as score
    FROM "Document"
    WHERE ${conditions}
    ORDER BY CASE WHEN content ILIKE '%${query.replace(/'/g, "''")}%' THEN 0 ELSE 1 END, "updatedAt" DESC
    LIMIT ${limit};
  `)
}
