import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/db/prisma'

// GET /api/v1/products/slug/[slug] - Получить товар по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const product = await prisma.product.findUnique({
      where: { slug },
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

    if (!product || (!product.isActive && request.headers.get('x-user-role') !== 'ADMIN')) {
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
    console.error('Get product by slug error:', error)
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    )
  }
}