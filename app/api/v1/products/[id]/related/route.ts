import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

// GET /api/v1/products/[id]/related - Получить похожие товары
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '8')

    // Получаем текущий товар
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const categoryIds = product.categories.map(c => c.categoryId)

    // Получаем похожие товары
    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: id } },
          { isActive: true },
          { stock: { gt: 0 } },
          {
            OR: [
              // Товары того же бренда
              { brandId: product.brandId },
              // Товары из тех же категорий
              {
                categories: {
                  some: {
                    categoryId: { in: categoryIds },
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        brand: true,
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      // Сортируем по популярности (количество избранных)
      orderBy: [
        {
          favorites: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: relatedProducts,
    })
  } catch (error) {
    console.error('Get related products error:', error)
    return NextResponse.json(
      { error: 'Failed to get related products' },
      { status: 500 }
    )
  }
}