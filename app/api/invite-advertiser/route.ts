import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Correo y nombre son obligatorios' }, { status: 400 })
    }

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: 'https://citie-dashboard.vercel.app/set-password',
      }
    )

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }

    const authUserId = inviteData.user.id

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({ email, is_anonymous: false })
      .select()
      .single()

    if (userError) {
      return NextResponse.json({ error: 'Error creando usuario: ' + userError.message }, { status: 400 })
    }

    const { error: advertiserError } = await supabaseAdmin
      .from('advertisers')
      .insert({
        user_id: userData.id,
        auth_user_id: authUserId,
        name,
        email,
      })

    if (advertiserError) {
      return NextResponse.json({ error: 'Error creando anunciante: ' + advertiserError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, email })
  } catch (error) {
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 })
  }
}