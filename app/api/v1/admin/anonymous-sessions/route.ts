import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const hasActivity = searchParams.get('hasActivity') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}
    
    if (hasActivity) {
      where.OR = [
        { cartItems: { some: {} } },
        { favoriteProducts: { some: {} } },
        { chats: { some: {} } },
      ]
    }

    const sessions = await prisma.anonymousUser.findMany({
      where,
      select: {
        id: true,
        token: true,
        createdAt: true,
        lastActivityAt: true,
        linkedUserId: true,
        linkedUser: {
          select: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            cartItems: true,
            favoriteProducts: true,
            chats: true,
          },
        },
      },
      orderBy: { lastActivityAt: 'desc' },
      take: limit,
    })

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      token: session.token,
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt,
      linkedUser: session.linkedUser,
      activity: {
        cartItems: session._count.cartItems,
        favoriteProducts: session._count.favoriteProducts,
        chats: session._count.chats,
      },
    }))

    return NextResponse.json({
      success: true,
      data: formattedSessions,
    })
  } catch (error) {
    console.error('Get anonymous sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to get anonymous sessions' },
      { status: 500 }
    )
  }
}