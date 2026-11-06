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
  // Regreso de Google y los demás: aún no hay sesión, se crea ahí.
  '/auth/callback',
])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // La sesión de Supabase va en sb-<proyecto>-auth-token (o en trozos .0, .1…).
  // Al tocar "Continuar con Google" se crea además ...-auth-token-code-verifier,
  // que no es una sesión: si la persona cancela en Google o algo falla, esa
  // cookie se queda, y contarla como sesión la dejaba fuera de /login, en un
  // panel vacío.
  const token = req.cookies.get('sb-access-token') ||
                req.cookies.getAll().find(c => /-auth-token(\.\d+)?$/.test(c.name))

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