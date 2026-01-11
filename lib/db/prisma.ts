import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Parse the DATABASE_URL to get the actual PostgreSQL connection
  const databaseUrl = process.env.DATABASE_URL;

  // For Prisma 7, we need to use the TCP connection string for the adapter
  // The DATABASE_URL contains either prisma+postgres:// or postgres://
  let connectionString = databaseUrl;

  if (databaseUrl?.startsWith('prisma+postgres://')) {
    // Extract the actual postgres connection from the API key
    // For now, use a simple postgres connection
    connectionString = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
