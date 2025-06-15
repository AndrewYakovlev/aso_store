import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

// GET /api/v1/products/search - Поиск товаров с подсказками
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          categories: [],
          brands: [],
        },
      })
    }

    // Поиск товаров
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        stock: true,
        brand: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
            alt: true,
          },
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
      },
      take: limit,
    })

    // Поиск категорий
    const categories = await prisma.category.findMany({
      where: {
        AND: [
          { isActive: true },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      take: 5,
    })

    // Поиск брендов
    const brands = await prisma.brand.findMany({
      where: {
        AND: [
          { isActive: true },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      take: 5,
    })

    // Сохраняем поисковый запрос для аналитики
    prisma.searchQuery.upsert({
      where: { query: query.toLowerCase() },
      create: { query: query.toLowerCase() },
      update: {
        count: { increment: 1 },
        lastUsedAt: new Date(),
      },
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      data: {
        products,
        categories,
        brands,
      },
    })
  } catch (error) {
    console.error('Search products error:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}