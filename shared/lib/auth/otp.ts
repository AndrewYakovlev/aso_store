import { prisma } from '@/shared/lib/db/prisma'

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 3

export function generateOTP(): string {
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)]
  }
  return otp
}

export async function createOTP(userId: string): Promise<string> {
  // Удаляем старые неиспользованные коды
  await prisma.otpCode.deleteMany({
    where: {
      userId,
      expiresAt: { lt: new Date() },
    },
  })

  // Генерируем новый код
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await prisma.otpCode.create({
    data: {
      userId,
      code,
      expiresAt,
    },
  })

  return code
}

export async function verifyOTP(userId: string, code: string): Promise<boolean> {
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      expiresAt: { gt: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otpRecord) {
    // Увеличиваем счетчик попыток для последнего кода
    await prisma.otpCode.updateMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      data: {
        attempts: { increment: 1 },
      },
    })
    return false
  }

  // Удаляем использованный код
  await prisma.otpCode.delete({
    where: { id: otpRecord.id },
  })

  // Удаляем все остальные коды пользователя
  await prisma.otpCode.deleteMany({
    where: { userId },
  })

  return true
}