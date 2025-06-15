import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { prisma } from '@/shared/lib/db/prisma'
import { verifyOTP } from '@/shared/lib/auth/otp'
import { signJWT } from '@/shared/lib/auth/jwt'
import { linkAnonymousToUser } from '@/shared/lib/auth/anonymous'

const verifyOTPSchema = z.object({
  userId: z.string(),
  code: z.string().length(6),
  anonymousId: z.string().optional(),
})

const AUTH_TOKEN_COOKIE = 'auth-token'
const AUTH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 дней

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, code, anonymousId } = verifyOTPSchema.parse(body)

    // Проверяем код
    const isValid = await verifyOTP(userId, code)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Обновляем пользователя
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerified: true,
        lastLoginAt: new Date(),
        lastActivityAt: new Date(),
      },
    })

    // Связываем анонимные данные с пользователем
    if (anonymousId) {
      await linkAnonymousToUser(anonymousId, userId)
    }

    // Создаем JWT токен
    const token = await signJWT({
      userId: user.id,
      role: user.role,
      anonymousId,
    })

    // Создаем response с токеном в cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    })

    // Устанавливаем cookie через response
    response.cookies.set(AUTH_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_TOKEN_MAX_AGE,
      path: '/',
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}