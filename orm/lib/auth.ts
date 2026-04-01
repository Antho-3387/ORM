import bcrypt from 'bcryptjs'
import prisma from './prisma'

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })

  return user
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function verifyUserCredentials(email: string, password: string) {
  const user = await getUserByEmail(email)

  if (!user) {
    return null
  }

  const passwordMatch = await verifyPassword(password, user.password)

  if (!passwordMatch) {
    return null
  }

  return user
}
