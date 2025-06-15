import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/shared/lib/db/prisma'
import { createOTP } from '@/shared/lib/auth/otp'
import { sendOTPSMS } from '@/shared/lib/sms/sms-service'

const sendOTPSchema = z.object({
  phone: z.string().regex(/^\+7\d{10}$/, 'Неверный формат телефона'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = sendOTPSchema.parse(body)

    // Проверяем или создаем пользователя
    let user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      })
    }

    // Генерируем OTP
    const code = await createOTP(user.id)

    // Отправляем SMS
    const smsResult = await sendOTPSMS(phone, code)

    if (!smsResult.success) {
      return NextResponse.json(
        { error: 'Failed to send SMS', details: smsResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        isNewUser: !user.phoneVerified,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}