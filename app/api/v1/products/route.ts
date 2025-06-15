import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'
import { z } from 'zod'
import { generateUniqueSlugForProduct } from '@/shared/lib/utils/slug'

// GET /api/v1/products - Получить список товаров с фильтрацией и пагинацией
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Параметры пагинации
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Параметры фильтрации
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const brandId = searchParams.get('brandId')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock')
    const isActive = searchParams.get('isActive')
    const isOriginal = searchParams.get('isOriginal')
    
    // Параметры сортировки
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Формируем условия фильтрации
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      where.categories = {
        some: { categoryId },
      }
    }

    if (brandId) {
      where.brandId = brandId
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (inStock !== null) {
      where.stock = inStock === 'true' ? { gt: 0 } : 0
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    if (isOriginal !== null) {
      where.isOriginal = isOriginal === 'true'
    }

    // Формируем объект сортировки
    const orderBy: any = {}
    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder
        break
      case 'price':
        orderBy.price = sortOrder
        break
      case 'stock':
        orderBy.stock = sortOrder
        break
      case 'createdAt':
      default:
        orderBy.createdAt = sortOrder
        break
    }

    // Получаем общее количество товаров
    const totalCount = await prisma.product.count({ where })

    // Получаем товары
    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            vehicleApplications: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    })

    // Формируем метаданные пагинации
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    )
  }
}

// Схема валидации для создания товара
const createProductSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только латиницу, цифры и дефис').optional(),
  sku: z.string().min(1, 'Артикул обязателен'),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  price: z.number().positive('Цена должна быть положительной'),
  comparePrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0, 'Количество не может быть отрицательным').default(0),
  deliveryDays: z.number().int().positive().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().nullable(),
  minOrderQuantity: z.number().int().positive().optional().default(1),
  brandId: z.string().min(1, 'Бренд обязателен'),
  isOriginal: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  categoryIds: z.array(z.string()).min(1, 'Выберите хотя бы одну категорию'),
  images: z.array(z.object({
    url: z.string().url('Некорректный URL изображения'),
    alt: z.string().optional().nullable(),
    sortOrder: z.number().optional().default(0),
  })).optional().default([]),
  // SEO поля
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
})

// POST /api/v1/products - Создать товар
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    // Генерируем slug, если он не передан
    const slug = validatedData.slug || await generateUniqueSlugForProduct(validatedData.name, validatedData.sku)

    // Проверка уникальности slug, если он был передан вручную
    if (validatedData.slug) {
      const existingProductBySlug = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      })

      if (existingProductBySlug) {
        return NextResponse.json(
          { error: 'Товар с таким slug уже существует' },
          { status: 400 }
        )
      }
    }

    // Проверка уникальности SKU
    const existingProductBySku = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    })

    if (existingProductBySku) {
      return NextResponse.json(
        { error: 'Товар с таким артикулом уже существует' },
        { status: 400 }
      )
    }

    // Проверка существования бренда
    const brand = await prisma.brand.findUnique({
      where: { id: validatedData.brandId },
    })

    if (!brand) {
      return NextResponse.json(
        { error: 'Бренд не найден' },
        { status: 400 }
      )
    }

    // Проверка существования категорий
    const categories = await prisma.category.findMany({
      where: {
        id: { in: validatedData.categoryIds },
      },
    })

    if (categories.length !== validatedData.categoryIds.length) {
      return NextResponse.json(
        { error: 'Одна или несколько категорий не найдены' },
        { status: 400 }
      )
    }

    // Извлекаем данные для создания связей
    const { categoryIds, images, ...productData } = validatedData

    // Создаем товар с изображениями и категориями
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        images: {
          create: images,
        },
        categories: {
          create: categoryIds.map((categoryId, index) => ({
            categoryId,
            isPrimary: index === 0,
          })),
        },
      },
      include: {
        brand: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            vehicleApplications: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}