import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

interface CategoryWithChildren {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  _count: {
    products: number
  }
  children?: CategoryWithChildren[]
}

// GET /api/v1/categories/tree - Получить дерево категорий
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = includeInactive ? {} : { isActive: true }

    // Получаем все категории одним запросом
    const categories = await prisma.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    // Строим дерево категорий
    const categoryMap = new Map<string, CategoryWithChildren>()
    const rootCategories: CategoryWithChildren[] = []

    // Создаем мапу всех категорий
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Строим иерархию
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id)!
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(categoryNode)
        } else {
          // Если родитель не найден, добавляем в корень
          rootCategories.push(categoryNode)
        }
      } else {
        rootCategories.push(categoryNode)
      }
    })

    // Сортируем детей на каждом уровне
    const sortChildren = (categories: CategoryWithChildren[]) => {
      categories.forEach(category => {
        if (category.children && category.children.length > 0) {
          category.children.sort((a, b) => a.sortOrder - b.sortOrder)
          sortChildren(category.children)
        }
      })
    }

    sortChildren(rootCategories)

    return NextResponse.json({
      success: true,
      data: rootCategories,
    })
  } catch (error) {
    console.error('Get categories tree error:', error)
    return NextResponse.json(
      { error: 'Failed to get categories tree' },
      { status: 500 }
    )
  }
}