import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userRole = request.headers.get('x-user-role')
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { role } = await request.json()

    if (!['CUSTOMER', 'MANAGER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phoneVerified: true,
        emailVerified: true,
        createdAt: true,
        lastActivityAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Change user role error:', error)
    return NextResponse.json(
      { error: 'Failed to change user role' },
      { status: 500 }
    )
  }
}