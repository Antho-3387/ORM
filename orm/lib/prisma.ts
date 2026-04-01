import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "file:./dev.db",
      },
    },
  })
}

declare const globalThis: {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined
} & typeof global

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma