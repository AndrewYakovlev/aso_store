import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'
import { z } from 'zod'

// GET /api/v1/products/[id] - Получить товар по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }, // Поддержка получения по slug
        ],
      },
      include: {
        brand: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        categories: {
          include: {
            category: {
              include: {
                parent: true,
              },
            },
          },
        },
        characteristics: {
          include: {
            characteristic: true,
            characteristicValue: true,
          },
        },
        vehicleApplications: {
          include: {
            modification: {
              include: {
                generation: {
                  include: {
                    model: {
                      include: {
                        make: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        crossReferences: {
          include: {
            crossBrand: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            viewHistory: true,
            cartItems: true,
            orderItems: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Увеличиваем счетчик просмотров (без ожидания)
    const userId = request.headers.get('x-user-id')
    const sessionId = request.headers.get('x-session-id')
    
    prisma.productView.create({
      data: {
        productId: product.id,
        userId,
        sessionId,
        source: 'direct',
        referrer: request.headers.get('referer'),
      },
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    )
  }
}

// Схема валидации для обновления товара
const updateProductSchema = z.object({
  name: z.string().min(1, 'Название обязательно').optional(),
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только латиницу, цифры и дефис').optional(),
  sku: z.string().min(1, 'Артикул обязателен').optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  price: z.number().positive('Цена должна быть положительной').optional(),
  comparePrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0, 'Количество не может быть отрицательным').optional(),
  deliveryDays: z.number().int().positive().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().nullable(),
  minOrderQuantity: z.number().int().positive().optional(),
  brandId: z.string().min(1, 'Бренд обязателен').optional(),
  isOriginal: z.boolean().optional(),
  isActive: z.boolean().optional(),
  categoryIds: z.array(z.string()).min(1, 'Выберите хотя бы одну категорию').optional(),
  images: z.array(z.object({
    id: z.string().optional(),
    url: z.string().url('Некорректный URL изображения'),
    alt: z.string().optional().nullable(),
    sortOrder: z.number().optional().default(0),
  })).optional(),
  // SEO поля
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
})

// PATCH /api/v1/products/[id] - Обновить товар
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
    const validatedData = updateProductSchema.parse(body)

    // Проверка существования товара
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
      },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Проверка уникальности slug, если он изменяется
    if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
      const productWithSlug = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      })

      if (productWithSlug) {
        return NextResponse.json(
          { error: 'Товар с таким slug уже существует' },
          { status: 400 }
        )
      }
    }

    // Проверка уникальности SKU, если он изменяется
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const productWithSku = await prisma.product.findUnique({
        where: { sku: validatedData.sku },
      })

      if (productWithSku) {
        return NextResponse.json(
          { error: 'Товар с таким артикулом уже существует' },
          { status: 400 }
        )
      }
    }

    // Проверка существования бренда, если он изменяется
    if (validatedData.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: validatedData.brandId },
      })

      if (!brand) {
        return NextResponse.json(
          { error: 'Бренд не найден' },
          { status: 400 }
        )
      }
    }

    // Проверка существования категорий, если они изменяются
    if (validatedData.categoryIds) {
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
    }

    // Извлекаем данные для обновления связей
    const { categoryIds, images, ...productData } = validatedData

    // Обновляем товар в транзакции
    const product = await prisma.$transaction(async (tx) => {
      // Обновляем основные данные товара
      const updatedProduct = await tx.product.update({
        where: { id },
        data: productData,
      })

      // Обновляем категории, если они переданы
      if (categoryIds) {
        // Удаляем старые связи
        await tx.productCategory.deleteMany({
          where: { productId: id },
        })

        // Создаем новые связи
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId, index) => ({
            productId: id,
            categoryId,
            isPrimary: index === 0,
          })),
        })
      }

      // Обновляем изображения, если они переданы
      if (images) {
        // Получаем ID существующих изображений
        const existingImageIds = existingProduct.images.map(img => img.id)
        const updatedImageIds = images
          .filter(img => img.id)
          .map(img => img.id!)

        // Удаляем изображения, которых нет в новом списке
        const imagesToDelete = existingImageIds.filter(
          id => !updatedImageIds.includes(id)
        )
        
        if (imagesToDelete.length > 0) {
          await tx.productImage.deleteMany({
            where: {
              id: { in: imagesToDelete },
            },
          })
        }

        // Обновляем существующие и создаем новые изображения
        for (const image of images) {
          if (image.id) {
            // Обновляем существующее изображение
            await tx.productImage.update({
              where: { id: image.id },
              data: {
                url: image.url,
                alt: image.alt,
                sortOrder: image.sortOrder,
              },
            })
          } else {
            // Создаем новое изображение
            await tx.productImage.create({
              data: {
                productId: id,
                url: image.url,
                alt: image.alt,
                sortOrder: image.sortOrder,
              },
            })
          }
        }
      }

      // Возвращаем обновленный товар со всеми связями
      return await tx.product.findUnique({
        where: { id },
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
    
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/products/[id] - Удалить товар
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

    // Проверка существования товара
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cartItems: true,
            orderItems: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Проверка наличия товара в корзинах
    if (product._count.cartItems > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить товар, который находится в корзинах пользователей' },
        { status: 400 }
      )
    }

    // Проверка наличия товара в заказах
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить товар, который есть в заказах' },
        { status: 400 }
      )
    }

    // Мягкое удаление
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}