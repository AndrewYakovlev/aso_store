import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'
import { z } from 'zod'

// GET /api/v1/categories/[id] - Получить категорию по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
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
            characteristic: true,
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

    if (!category) {
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
    console.error('Get category error:', error)
    return NextResponse.json(
      { error: 'Failed to get category' },
      { status: 500 }
    )
  }
}

// Схема валидации для обновления категории
const updateCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').optional(),
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только латиницу, цифры и дефис').optional(),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  // SEO поля
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
})

// PATCH /api/v1/categories/[id] - Обновить категорию
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    // Проверка существования категории
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Проверка уникальности slug, если он изменяется
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const categoryWithSlug = await prisma.category.findUnique({
        where: { slug: validatedData.slug },
      })

      if (categoryWithSlug) {
        return NextResponse.json(
          { error: 'Категория с таким slug уже существует' },
          { status: 400 }
        )
      }
    }

    // Проверка существования родительской категории
    if (validatedData.parentId !== undefined) {
      if (validatedData.parentId === id) {
        return NextResponse.json(
          { error: 'Категория не может быть родительской для самой себя' },
          { status: 400 }
        )
      }

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

        // Проверка на циклическую зависимость
        let currentParent = parentCategory
        while (currentParent.parentId) {
          if (currentParent.parentId === id) {
            return NextResponse.json(
              { error: 'Обнаружена циклическая зависимость категорий' },
              { status: 400 }
            )
          }
          currentParent = await prisma.category.findUnique({
            where: { id: currentParent.parentId },
          }) as any
        }
      }
    }

    const category = await prisma.category.update({
      where: { id },
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
    
    console.error('Update category error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/categories/[id] - Удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (!userRole || userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Проверка существования категории
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Проверка наличия дочерних категорий
    if (category._count.children > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить категорию с дочерними категориями' },
        { status: 400 }
      )
    }

    // Проверка наличия товаров
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить категорию с товарами' },
        { status: 400 }
      )
    }

    // Мягкое удаление
    await prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}