import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const { device_id } = await req.json()

    if (!device_id) {
      return NextResponse.json({ error: 'device_id es obligatorio' }, { status: 400 })
    }

    const { data: userRow, error: userLookupError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('device_id', device_id)
      .maybeSingle()

    if (userLookupError) {
      return NextResponse.json({ error: 'Error buscando usuario: ' + userLookupError.message }, { status: 400 })
    }

    if (userRow) {
      const { error: savedCardsError } = await supabaseAdmin
        .from('saved_cards')
        .delete()
        .eq('user_id', userRow.id)

      if (savedCardsError) {
        return NextResponse.json({ error: 'Error borrando tarjetas guardadas: ' + savedCardsError.message }, { status: 400 })
      }

      const { error: userDeleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userRow.id)

      if (userDeleteError) {
        return NextResponse.json({ error: 'Error borrando usuario: ' + userDeleteError.message }, { status: 400 })
      }
    }

    // Si además hay una sesión de Supabase Auth (login con email/contraseña),
    // se borra también la cuenta de Auth asociada al token enviado.
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length)
      const { data: authData } = await supabaseAdmin.auth.getUser(token)
      if (authData?.user) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 })
  }
}
