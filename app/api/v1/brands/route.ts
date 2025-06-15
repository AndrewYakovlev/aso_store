import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'
import { z } from 'zod'
import { generateUniqueSlugForBrand } from '@/shared/lib/utils/slug'

// GET /api/v1/brands - Получить список брендов
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const withCount = searchParams.get('withCount') === 'true'

    const where: any = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const brands = await prisma.brand.findMany({
      where,
      include: {
        ...(withCount && {
          _count: {
            select: {
              products: true,
            },
          },
        }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: brands,
    })
  } catch (error) {
    console.error('Get brands error:', error)
    return NextResponse.json(
      { error: 'Failed to get brands' },
      { status: 500 }
    )
  }
}

// Схема валидации для создания бренда
const createBrandSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только латиницу, цифры и дефис').optional(),
  logo: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

// POST /api/v1/brands - Создать бренд
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
    const validatedData = createBrandSchema.parse(body)

    // Проверка уникальности имени
    const existingBrandByName = await prisma.brand.findUnique({
      where: { name: validatedData.name },
    })

    if (existingBrandByName) {
      return NextResponse.json(
        { error: 'Бренд с таким названием уже существует' },
        { status: 400 }
      )
    }

    // Генерируем slug, если он не передан
    const slug = validatedData.slug || await generateUniqueSlugForBrand(validatedData.name)

    // Проверка уникальности slug, если он был передан вручную
    if (validatedData.slug) {
      const existingBrandBySlug = await prisma.brand.findUnique({
        where: { slug: validatedData.slug },
      })

      if (existingBrandBySlug) {
        return NextResponse.json(
          { error: 'Бренд с таким slug уже существует' },
          { status: 400 }
        )
      }
    }

    const brand = await prisma.brand.create({
      data: {
        ...validatedData,
        slug,
      },
    })

    return NextResponse.json({
      success: true,
      data: brand,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Create brand error:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}