import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Públicas sin sesión: no requieren cookie de auth.
// /api/delete-account la llama la app móvil directamente, sin cookie de dashboard.
const PUBLIC_PATHS = new Set([
  '/set-password',
  '/terms',
  '/dmca',
  '/delete-account',
  '/api/delete-account',
])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('sb-access-token') ||
                req.cookies.getAll().find(c => c.name.includes('auth-token'))

  if (pathname === '/login') {
    if (token) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/card/')) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}