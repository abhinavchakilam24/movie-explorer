import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL environment variable is not set');
  }

  const adapter = new PrismaLibSQL({ url, authToken });

  return new PrismaClient({ adapter } as never);
}

export const prisma = global.__prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;
