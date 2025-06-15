import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/shared/lib/auth/jwt'

const protectedPaths = [
  '/profile',
  '/panel',
  '/api/v1/admin',
  '/api/v1/auth/me',  // Добавляем me endpoint в защищенные маршруты
]

const publicPaths = [
  '/api/v1/auth/anonymous',
  '/api/v1/auth/send-otp',
  '/api/v1/auth/verify-otp',
  '/api/v1/auth/refresh',
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Пропускаем статические файлы и API для авторизации
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // Проверяем защищенные маршруты
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  
  if (isProtectedPath) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      console.log(`[Middleware] No token for protected path: ${path}`)
      // Для API возвращаем 401
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      // Для страниц редиректим на главную
      const url = new URL('/', request.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }

    try {
      const payload = await verifyJWT(token)
      console.log(`[Middleware] Token verified for user: ${payload.userId}, role: ${payload.role}`)
      
      // Проверяем доступ к админке
      if (path.startsWith('/panel') || path.startsWith('/api/v1/admin')) {
        if (payload.role !== 'ADMIN' && payload.role !== 'MANAGER') {
          console.log(`[Middleware] Access denied to panel for role: ${payload.role}`)
          if (path.startsWith('/api/')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
          }
          return NextResponse.redirect(new URL('/', request.url))
        }
      }

      // Добавляем информацию о пользователе в headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-role', payload.role)
      if (payload.anonymousId) {
        requestHeaders.set('x-anonymous-id', payload.anonymousId)
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error(`[Middleware] Invalid token for path: ${path}`, error)
      // Токен невалидный
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      const url = new URL('/', request.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}