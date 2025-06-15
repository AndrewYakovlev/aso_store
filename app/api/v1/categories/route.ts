import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'
import { z } from 'zod'

// GET /api/v1/categories - Получить список категорий
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const parentId = searchParams.get('parentId')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    
    if (parentId !== null) {
      where.parentId = parentId === 'null' ? null : parentId
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
        ...(includeChildren && {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        }),
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Failed to get categories' },
      { status: 500 }
    )
  }
}

// Схема валидации для создания категории
const createCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только латиницу, цифры и дефис'),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
  // SEO поля
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
})

// POST /api/v1/categories - Создать категорию
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
    const validatedData = createCategorySchema.parse(body)

    // Проверка уникальности slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Категория с таким slug уже существует' },
        { status: 400 }
      )
    }

    // Проверка существования родительской категории
    if (validatedData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      })

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Родительская категория не найдена' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.create({
      data: validatedData,
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}