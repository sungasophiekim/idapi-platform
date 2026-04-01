import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Return a client that will fail gracefully when DB is not configured
    return new PrismaClient({ adapter: new PrismaPg({ connectionString: 'postgresql://localhost:5432/idapi' }) });
  }
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
