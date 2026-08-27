import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { ADMIN_EMAIL } from '@/lib/admin'

/**
 * Borrado de eventos y tarjetas.
 *
 * Vive en el servidor por una razón concreta: tras la migración de RLS,
 * `saved_cards` solo es legible por su dueño. Un conteo hecho desde el
 * navegador del dashboard devolvería cero aunque diez usuarios tuvieran la
 * tarjeta guardada, y borraríamos contenido que está en la lista de alguien
 * creyendo que no le afecta a nadie. Con la service role key el conteo es real.
 *
 * `action: 'check'` devuelve qué colgaría del borrado, para poder avisar antes
 * de confirmar. `action: 'delete'` ejecuta, hijos primero, y se niega si algún
 * usuario ya guardó contenido: eso se archiva ("Finalizar"), no se borra.
 */

type Body = {
  action: 'check' | 'delete'
  type: 'event' | 'card'
  id: string
}

type Caller = { isAdmin: boolean; advertiserId: string | null }

async function resolveCaller(req: NextRequest): Promise<Caller | null> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null
  if (!token) return null

  const { data } = await supabaseAdmin.auth.getUser(token)
  const user = data?.user
  if (!user) return null

  const { data: advertiser } = await supabaseAdmin
    .from('advertisers')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  return {
    isAdmin: user.email === ADMIN_EMAIL,
    advertiserId: advertiser?.id ?? null,
  }
}

/** El admin puede con todo; un anunciante, solo con lo suyo. */
function canTouch(caller: Caller, ownerId: string | null): boolean {
  if (caller.isAdmin) return true
  return !!ownerId && ownerId === caller.advertiserId
}

async function countSaved(cardIds: string[]): Promise<number> {
  if (cardIds.length === 0) return 0
  const { count } = await supabaseAdmin
    .from('saved_cards')
    .select('card_id', { count: 'exact', head: true })
    .in('card_id', cardIds)
  return count ?? 0
}

export async function POST(req: NextRequest) {
  try {
    const caller = await resolveCaller(req)
    if (!caller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { action, type, id } = (await req.json()) as Body
    if (!id || (type !== 'event' && type !== 'card')) {
      return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
    }

    // ---- Tarjeta suelta o de evento ----
    if (type === 'card') {
      const { data: card } = await supabaseAdmin
        .from('cards')
        .select('id, title, advertiser_id')
        .eq('id', id)
        .maybeSingle()

      if (!card) {
        return NextResponse.json({ error: 'La tarjeta ya no existe' }, { status: 404 })
      }
      if (!canTouch(caller, card.advertiser_id)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }

      const saved = await countSaved([card.id])

      if (action === 'check') {
        return NextResponse.json({ cards: 1, saved, name: card.title })
      }

      if (saved > 0) {
        return NextResponse.json(
          {
            error: `No se puede eliminar: ${saved} ${saved === 1 ? 'usuario la tiene' : 'usuarios la tienen'} guardada. Desactívala en su lugar para que deje de aparecer.`,
          },
          { status: 409 }
        )
      }

      const { error } = await supabaseAdmin.from('cards').delete().eq('id', id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ ok: true })
    }

    // ---- Evento, con sus tarjetas ----
    const { data: event } = await supabaseAdmin
      .from('events')
      .select('id, name, advertiser_id')
      .eq('id', id)
      .maybeSingle()

    if (!event) {
      return NextResponse.json({ error: 'El evento ya no existe' }, { status: 404 })
    }
    if (!canTouch(caller, event.advertiser_id)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { data: cards } = await supabaseAdmin
      .from('cards')
      .select('id')
      .eq('event_id', id)

    const cardIds = (cards ?? []).map((c) => c.id)
    const saved = await countSaved(cardIds)

    if (action === 'check') {
      return NextResponse.json({ cards: cardIds.length, saved, name: event.name })
    }

    if (saved > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar: ${saved} ${saved === 1 ? 'tarjeta guardada por un usuario' : 'tarjetas guardadas por usuarios'}. Usa "Finalizar" para archivar el evento sin borrar lo que la gente guardó.`,
        },
        { status: 409 }
      )
    }

    // Las tarjetas primero: así el borrado funciona sin depender de que la
    // llave foránea esté declarada en cascada.
    if (cardIds.length > 0) {
      const { error: cardsError } = await supabaseAdmin
        .from('cards')
        .delete()
        .eq('event_id', id)
      if (cardsError) {
        return NextResponse.json({ error: cardsError.message }, { status: 400 })
      }
    }

    const { error } = await supabaseAdmin.from('events').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, deletedCards: cardIds.length })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error inesperado'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
