import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'
import { z } from 'zod'

// Схема валидации для изменения порядка
const reorderSchema = z.object({
  updates: z.array(z.object({
    id: z.string(),
    sortOrder: z.number(),
    parentId: z.string().nullable().optional(),
  })),
})

// PUT /api/v1/categories/reorder - Изменить порядок категорий
export async function PUT(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { updates } = reorderSchema.parse(body)

    // Выполняем обновления в транзакции
    const result = await prisma.$transaction(
      updates.map(update => 
        prisma.category.update({
          where: { id: update.id },
          data: {
            sortOrder: update.sortOrder,
            ...(update.parentId !== undefined && { parentId: update.parentId }),
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Categories reordered successfully',
      data: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Reorder categories error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}