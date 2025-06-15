import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

// GET /api/v1/categories/slug/[slug] - Получить категорию по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: {
            product: {
              isActive: true,
              stock: { gt: 0 },
            },
          },
          include: {
            product: {
              include: {
                brand: true,
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
          take: 20,
        },
        characteristics: {
          include: {
            characteristic: {
              include: {
                values: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })

    if (!category || (!category.isActive && request.headers.get('x-user-role') !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Get category by slug error:', error)
    return NextResponse.json(
      { error: 'Failed to get category' },
      { status: 500 }
    )
  }
}