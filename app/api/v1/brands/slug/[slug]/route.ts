import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

// GET /api/v1/brands/slug/[slug] - Получить бренд по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!brand || (!brand.isActive && request.headers.get('x-user-role') !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: brand,
    })
  } catch (error) {
    console.error('Get brand by slug error:', error)
    return NextResponse.json(
      { error: 'Failed to get brand' },
      { status: 500 }
    )
  }
}