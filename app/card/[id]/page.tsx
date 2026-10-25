import { createClient } from '@supabase/supabase-js'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getCard(id: string) {
  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .eq('is_triggered', true)
    .maybeSingle()
  return data
}

// Quien pide la página para armar la vista previa del enlace (WhatsApp,
// Telegram, redes) no es una persona abriendo la tarjeta.
const NO_PERSONAS =
  /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|twitter|linkedin|embedly|vercel/i

/**
 * Cuenta las aperturas de una tarjeta compartida: es lo que mide cuánto viaja
 * el contenido fuera del evento. Solo tipo, tarjeta y si fue Android o iPhone;
 * nada personal. Nunca rompe la página.
 */
async function anotarApertura(card: { id: string; event_id: string | null }) {
  try {
    const ua = (await headers()).get('user-agent') ?? ''
    if (!ua || NO_PERSONAS.test(ua)) return
    const plataforma = /android/i.test(ua)
      ? 'android'
      : /iphone|ipad|ipod/i.test(ua)
        ? 'ios'
        : 'otro'
    await supabaseAdmin.from('interacciones').insert({
      tipo: 'abrir_compartida',
      card_id: card.id,
      event_id: card.event_id,
      origen: 'web',
      plataforma,
    })
  } catch {
    // Las métricas nunca deben impedir que se vea la tarjeta.
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const card = await getCard(id)

  if (!card) {
    return { title: 'Chitie' }
  }

  return {
    title: card.title,
    description: card.summary || 'Descubre más en Chitie',
    openGraph: {
      title: card.title,
      description: card.summary || 'Descubre más en Chitie',
      // Sin foto propia, la de Chitie: antes salía un enlace sin imagen.
      images: card.image_url ? [card.image_url] : ['/og.png'],
    },
  }
}

export default async function CardSharePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const card = await getCard(id)

  if (!card) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Contenido no disponible</h1>
          <p className="text-gray-500 text-sm">Esta tarjeta ya no está activa.</p>
        </div>
      </main>
    )
  }

  await anotarApertura(card)

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {card.image_url && (
          <div className="relative w-full h-48">
            <Image src={card.image_url} alt={card.title} fill className="object-cover" />
          </div>
        )}
        <div className="p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h1>
          {card.summary && (
            <p className="text-gray-500 text-sm mb-6">{card.summary}</p>
          )}
          {card.url && (
            <a href={card.url} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
              Ver más
            </a>
          )}
          <a href="https://chitie.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mt-3 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            <span>Compartido por</span>
            <Image src="/logo_gris.png" alt="Chitie" width={753} height={241} className="h-4 w-auto" />
          </a>
        </div>
      </div>
    </main>
  )
}