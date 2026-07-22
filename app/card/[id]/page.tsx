import { createClient } from '@supabase/supabase-js'
import { Metadata } from 'next'

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

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const card = await getCard(id)

  if (!card) {
    return { title: 'CiTie' }
  }

  return {
    title: card.title,
    description: card.summary || 'Descubre más en CiTie',
    openGraph: {
      title: card.title,
      description: card.summary || 'Descubre más en CiTie',
      images: card.image_url ? [card.image_url] : [],
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

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {card.image_url && (
          <img src={card.image_url} alt={card.title} className="w-full h-48 object-cover" />
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
          <a href="https://citieapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mt-3 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            <span>Compartido por</span>
            <img src="/logo_gris.png" alt="CiTie" className="h-4" />
          </a>
        </div>
      </div>
    </main>
  )
}