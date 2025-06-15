import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/shared/lib/db/prisma'

const ANONYMOUS_TOKEN_COOKIE = 'anon_token'
const ANONYMOUS_TOKEN_MAX_AGE = 365 * 24 * 60 * 60 // 365 дней

export function generateAnonymousToken(): string {
  return randomBytes(32).toString('hex')
}

export function generateSessionId(): string {
  return randomBytes(16).toString('hex')
}

export async function getOrCreateAnonymousUser(request: Request) {
  const cookieStore = await cookies()
  const existingToken = cookieStore.get(ANONYMOUS_TOKEN_COOKIE)?.value

  if (existingToken) {
    // Проверяем существующий токен
    const anonymousUser = await prisma.anonymousUser.findUnique({
      where: { token: existingToken },
    })

    if (anonymousUser) {
      // Обновляем lastActivity
      await prisma.anonymousUser.update({
        where: { id: anonymousUser.id },
        data: { lastActivity: new Date() },
      })

      // Продлеваем cookie
      cookieStore.set(ANONYMOUS_TOKEN_COOKIE, existingToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ANONYMOUS_TOKEN_MAX_AGE,
        path: '/',
      })

      return anonymousUser
    }
  }

  // Создаем нового анонимного пользователя
  const token = generateAnonymousToken()
  const sessionId = generateSessionId()
  
  const anonymousUser = await prisma.anonymousUser.create({
    data: {
      token,
      sessionId,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    },
  })

  // Устанавливаем cookie
  cookieStore.set(ANONYMOUS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ANONYMOUS_TOKEN_MAX_AGE,
    path: '/',
  })

  return anonymousUser
}

export async function linkAnonymousToUser(anonymousId: string, userId: string) {
  // Связываем анонимного пользователя с реальным
  await prisma.anonymousUser.update({
    where: { id: anonymousId },
    data: { userId },
  })

  // Переносим корзину
  const anonymousCarts = await prisma.cart.findMany({
    where: { anonymousId },
    include: { items: true },
  })

  for (const cart of anonymousCarts) {
    // Ищем корзину пользователя
    let userCart = await prisma.cart.findFirst({
      where: { userId },
    })

    if (!userCart) {
      // Создаем корзину для пользователя
      userCart = await prisma.cart.create({
        data: { userId },
      })
    }

    // Переносим товары
    for (const item of cart.items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          chatProductId: item.chatProductId,
        },
      })

      if (existingItem) {
        // Обновляем количество
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        })
      } else {
        // Создаем новый элемент
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            chatProductId: item.chatProductId,
            quantity: item.quantity,
            price: item.price,
          },
        })
      }
    }
  }

  // Переносим избранное
  const anonymousFavorites = await prisma.favorite.findMany({
    where: { anonymousId },
  })

  for (const favorite of anonymousFavorites) {
    await prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId,
          productId: favorite.productId,
        },
      },
      update: {},
      create: {
        userId,
        productId: favorite.productId,
      },
    })
  }

  // Переносим историю просмотров
  await prisma.viewHistory.updateMany({
    where: { anonymousId },
    data: { userId, anonymousId: null },
  })

  // Переносим историю поиска
  await prisma.searchHistory.updateMany({
    where: { anonymousId },
    data: { userId, anonymousId: null },
  })

  // Переносим чаты
  await prisma.chat.updateMany({
    where: { anonymousId },
    data: { userId, anonymousId: null },
  })
}