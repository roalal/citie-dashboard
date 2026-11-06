import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { ADMIN_EMAIL } from '@/lib/admin'

/**
 * Regreso de Google (o Microsoft, Apple…). Cambia el código por la sesión y
 * deja entrar solo a quien ya tiene invitación: un anunciante o el
 * administrador. Supabase une la cuenta del proveedor a la de la invitación
 * cuando el correo coincide; si no coincide, aquí no hay anunciante y se
 * cierra esa sesión.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const login = (error: string) =>
    NextResponse.redirect(`${origin}/login?error=${error}`)

  if (!code) return login(searchParams.get('error') ? 'proveedor' : 'sin_codigo')

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (lista) =>
          lista.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    },
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  const user = data?.user
  if (error || !user) return login('sesion')

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    const { data: anunciante } = await supabaseAdmin
      .from('advertisers')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!anunciante) {
      // Solo esta sesión: la cuenta puede ser de un asistente que usa la app
      // con ese mismo correo, y no hay que sacarlo de ella.
      await supabase.auth.signOut({ scope: 'local' })
      return login('sin_invitacion')
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
