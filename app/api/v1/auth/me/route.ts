import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const token = request.cookies.get('auth-token')?.value
    
    console.log('[Me] User ID from header:', userId)
    console.log('[Me] Token from cookie:', token ? 'exists' : 'missing')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phoneVerified: true,
        emailVerified: true,
        customerGroup: {
          select: {
            id: true,
            name: true,
            discountPercent: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Обновляем последнюю активность
    await prisma.user.update({
      where: { id: userId },
      data: { lastActivityAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}