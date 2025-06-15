import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, signJWT } from '@/shared/lib/auth/jwt'
import { prisma } from '@/shared/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    console.log('[Refresh] Token from cookie:', token ? 'exists' : 'missing')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    try {
      const payload = await verifyJWT(token)
      
      // Проверяем, существует ли пользователь
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          role: true,
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        )
      }

      // Создаем новый токен
      const newToken = await signJWT({
        userId: user.id,
        role: user.role,
        anonymousId: payload.anonymousId,
      })

      // Обновляем lastActivityAt
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActivityAt: new Date() },
      })

      const response = NextResponse.json({
        success: true,
        data: {
          userId: user.id,
          role: user.role,
        },
      })

      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 дней
        path: '/',
      })
      
      console.log('[Refresh] New token set in cookie')

      return response
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    )
  }
}