import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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
