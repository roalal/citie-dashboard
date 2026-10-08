import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { ADMIN_EMAIL } from '@/lib/admin'

/**
 * Solicitudes del formulario de chitie.app/contacto.
 *
 * La tabla no deja leer con la llave pública (la página de contacto solo
 * puede insertar), así que la lista sale de aquí, con la llave de servicio y
 * solo para la cuenta de administración.
 */
async function esAdmin(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null
  if (!token) return false
  const { data } = await supabaseAdmin.auth.getUser(token)
  return data?.user?.email === ADMIN_EMAIL
}

export async function GET(req: NextRequest) {
  if (!(await esAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('solicitudes_contacto')
    .select('id, created_at, nombre, empresa, medio, correo, telefono, mensaje, atendida')
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ solicitudes: data })
}

export async function PATCH(req: NextRequest) {
  if (!(await esAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id, atendida } = await req.json()
  if (typeof id !== 'string' || typeof atendida !== 'boolean') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('solicitudes_contacto')
    .update({ atendida })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
