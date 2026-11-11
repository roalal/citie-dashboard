import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { ADMIN_USER_ID } from '@/lib/admin'

/** La cuenta es la del administrador o la de un organizador (tiene anunciante). */
async function esCuentaDelPanel(authUserId: string | null, userRowId: string | null): Promise<boolean> {
  if (authUserId === ADMIN_USER_ID) return true
  const filtros = [
    authUserId ? `auth_user_id.eq.${authUserId}` : null,
    userRowId ? `user_id.eq.${userRowId}` : null,
  ].filter(Boolean)
  if (!filtros.length) return false
  const { data, error } = await supabaseAdmin
    .from('advertisers')
    .select('id')
    .or(filtros.join(','))
    .limit(1)
  // Si no se puede comprobar, no se borra: mejor un error que perder una cuenta del panel.
  if (error) throw error
  return (data?.length ?? 0) > 0
}

export async function POST(req: NextRequest) {
  try {
    const { device_id } = await req.json().catch(() => ({ device_id: undefined }))

    // Every client now carries a real Supabase Auth session (anonymous or
    // logged in), so the Bearer token is the trustworthy way to resolve
    // which account to delete. device_id is kept only as a fallback for any
    // row created before the anonymous-auth migration.
    let authUserId: string | null = null
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length)
      const { data: authData } = await supabaseAdmin.auth.getUser(token)
      authUserId = authData?.user?.id ?? null
    }

    if (!authUserId && !device_id) {
      return NextResponse.json({ error: 'Falta sesión o device_id' }, { status: 400 })
    }

    let userRowId: string | null = null

    if (authUserId) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle()
      userRowId = data?.id ?? null
    }

    if (!userRowId && device_id) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('device_id', device_id)
        .maybeSingle()
      userRowId = data?.id ?? null
    }

    // Candado: la app y el panel comparten cuentas (el mismo Supabase Auth). Quien
    // entra a la app con el correo del panel está en esa misma cuenta, y "Eliminar
    // cuenta" se llevaría la del administrador o la de un organizador con sus
    // eventos. Esas no se borran desde aquí.
    if (await esCuentaDelPanel(authUserId, userRowId)) {
      return NextResponse.json(
        {
          error: 'Esta cuenta administra eventos en Chitie. Para borrarla, escríbenos a privacidad@chitie.app.',
          codigo: 'cuenta_del_panel',
        },
        { status: 409 }
      )
    }

    if (userRowId) {
      const { error: savedCardsError } = await supabaseAdmin
        .from('saved_cards')
        .delete()
        .eq('user_id', userRowId)

      if (savedCardsError) {
        return NextResponse.json({ error: 'Error borrando tarjetas guardadas: ' + savedCardsError.message }, { status: 400 })
      }

      const { error: userDeleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userRowId)

      if (userDeleteError) {
        return NextResponse.json({ error: 'Error borrando usuario: ' + userDeleteError.message }, { status: 400 })
      }
    }

    // Los registros de uso (desde la app 1.5.1) se guardan con auth.uid(), no
    // con users.id. La página de eliminación promete borrarlos: lo exige la
    // política de cuentas de Google Play. Antes del usuario de Auth, para que
    // no queden ids huérfanos si esto falla a medias.
    if (authUserId) {
      for (const tabla of ['interacciones', 'escaneos'] as const) {
        const { error } = await supabaseAdmin.from(tabla).delete().eq('user_id', authUserId)
        if (error) {
          return NextResponse.json({ error: `Error borrando ${tabla}: ${error.message}` }, { status: 400 })
        }
      }
    }

    // Deleting the auth user also cascades to its `users` row (if any)
    // via the auth_user_id foreign key — the manual delete above just
    // makes this work for legacy device_id-only rows too.
    if (authUserId) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 })
  }
}
