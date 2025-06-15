import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userRole = request.headers.get('x-user-role')
    
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        customerGroup: true,
        orders: {
          include: {
            status: true,
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        carts: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          take: 1,
          orderBy: { updatedAt: 'desc' },
        },
        favorites: {
          include: {
            product: true,
          },
          take: 20,
        },
        anonymousSessions: {
          select: {
            id: true,
            token: true,
            sessionId: true,
            createdAt: true,
            lastActivity: true,
          },
        },
        _count: {
          select: {
            orders: true,
            carts: true,
            favorites: true,
            chats: true,
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

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Get user details error:', error)
    return NextResponse.json(
      { error: 'Failed to get user details' },
      { status: 500 }
    )
  }
}