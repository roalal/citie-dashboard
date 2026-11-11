import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { esAdmin } from '@/lib/admin'

function esCorreoRegistrado(error: { code?: string; message?: string }): boolean {
  return error.code === 'email_exists' || /already (been )?registered/i.test(error.message ?? '')
}

/** La cuenta de Supabase Auth con ese correo, si existe (sin distinguir mayúsculas). */
async function buscarCuentaPorCorreo(email: string) {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const cuenta = data.users.find((u) => u.email?.toLowerCase() === email)
    if (cuenta) return cuenta
    if (data.users.length < 1000) return null
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: callerData } = await supabaseAdmin.auth.getUser(token)
    if (!esAdmin(callerData?.user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const name = String(body.name ?? '').trim()

    if (!email || !name) {
      return NextResponse.json({ error: 'Correo y nombre son obligatorios' }, { status: 400 })
    }

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: 'https://citie-dashboard.vercel.app/set-password',
      }
    )

    // La app y el panel comparten cuentas: el correo puede ser ya de alguien que
    // entró a la app (con Google, Apple, Facebook o su correo). Supabase no invita
    // a un correo registrado; en ese caso el organizador se liga a esa cuenta y la
    // persona entra al panel como entra a la app.
    let authUserId: string
    let existente = false
    if (inviteError) {
      if (!esCorreoRegistrado(inviteError)) {
        return NextResponse.json({ error: inviteError.message }, { status: 400 })
      }
      const cuenta = await buscarCuentaPorCorreo(email)
      if (!cuenta) {
        return NextResponse.json({ error: 'Ese correo ya tiene cuenta, pero no se encontró. Intenta de nuevo.' }, { status: 400 })
      }
      authUserId = cuenta.id
      existente = true
    } else {
      authUserId = inviteData.user.id
    }

    const { data: yaEsOrganizador } = await supabaseAdmin
      .from('advertisers')
      .select('id')
      .eq('auth_user_id', authUserId)
      .limit(1)
    if (yaEsOrganizador?.length) {
      return NextResponse.json({ error: 'Ese correo ya es de un organizador.' }, { status: 409 })
    }

    // Su fila en users: la de la app si ya la tenía; si no, una nueva.
    const { data: filaExistente } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    let userId: string
    if (filaExistente) {
      userId = filaExistente.id
      const { error } = await supabaseAdmin
        .from('users')
        .update({ is_anonymous: false, email: filaExistente.email ?? email })
        .eq('id', userId)
      if (error) {
        return NextResponse.json({ error: 'Error actualizando usuario: ' + error.message }, { status: 400 })
      }
    } else {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({ email, is_anonymous: false, auth_user_id: authUserId })
        .select()
        .single()
      if (userError) {
        return NextResponse.json({ error: 'Error creando usuario: ' + userError.message }, { status: 400 })
      }
      userId = userData.id
    }

    const { error: advertiserError } = await supabaseAdmin
      .from('advertisers')
      .insert({
        user_id: userId,
        auth_user_id: authUserId,
        name,
        email,
      })

    if (advertiserError) {
      return NextResponse.json({ error: 'Error creando anunciante: ' + advertiserError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, email, existente })
  } catch (error) {
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 })
  }
}