'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ScannableQr } from '@/components/ScannableQr'
import { confirmAndDelete } from '@/lib/contentApi'
import { descargarQr, nombreQr } from '@/lib/downloadQr'


type Card = {
  id: string
  title: string
  summary: string
  image_url: string
  url: string
  is_triggered: boolean
  sort_order: number
}

type Event = {
  id: string
  name: string
  status: string
  qr_code: string
}

export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    const [{ data: eventData }, { data: cardsData }] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase
        .from('cards')
        .select('*')
        .eq('event_id', id)
        .order('sort_order', { ascending: true }),
    ])

    if (eventData) setEvent(eventData)
    if (cardsData) setCards(cardsData)
    setLoading(false)
  }

  async function triggerCard(cardId: string) {
    await supabase
      .from('cards')
      .update({ is_triggered: true })
      .eq('id', cardId)
    fetchData()
  }

  async function removeCard(cardId: string) {
    setBusyId(cardId)
    const error = await confirmAndDelete({ type: 'card', id: cardId }, 'la tarjeta')
    setBusyId(null)
    setActionError(error ?? '')
    if (!error) fetchData()
  }

  async function untriggerCard(cardId: string) {
    await supabase
      .from('cards')
      .update({ is_triggered: false })
      .eq('id', cardId)
    fetchData()
  }

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    finished: 'bg-red-100 text-red-600',
  }

  const statusLabel: Record<string, string> = {
    draft: 'Borrador',
    active: 'Activo',
    finished: 'Finalizado',
  }

  if (loading) return <main className="min-h-screen bg-gray-50 p-8"><p className="text-gray-400">Cargando...</p></main>

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/events" className="text-sm text-blue-500 hover:underline mb-4 block">
          ← Eventos
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-start gap-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{event?.name}</h1>
                  {event && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[event.status]}`}>
                      {statusLabel[event.status]}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{cards.length} cards en este evento</p>
              </div>
              {event?.qr_code && (
                  <div id="event-qr" className="flex flex-col items-center gap-2">
                  <ScannableQr value={event.qr_code} size={132} />
                  <p className="text-xs text-gray-400">{event.qr_code}</p>
                </div>
              )}
            </div>
          <div className="flex gap-2">
            <button
              onClick={() => descargarQr('#event-qr', nombreQr(event?.name))}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Descargar QR
            </button>
            <Link
              href={`/events/${id}/edit`}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Editar evento
            </Link>
            <Link
              href={`/events/${id}/cards/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              + Nueva card
            </Link>
          </div>
        </div>

        {actionError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {cards.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 mb-4">No hay cards en este evento todavía</p>
            <Link
              href={`/events/${id}/cards/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Agregar primera card
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`bg-white rounded-xl border p-5 flex items-center justify-between transition ${
                  card.is_triggered ? 'border-green-400 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-300 font-mono text-sm w-6 text-center">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{card.title}</p>
                    <p className="text-gray-500 text-sm">{card.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {card.is_triggered ? (
                    <>
                      <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-100 rounded-full">
                        Activa
                      </span>
                      <button
                        onClick={() => untriggerCard(card.id)}
                        className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                      >
                        Desactivar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => triggerCard(card.id)}
                      className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700 transition"
                    >
                      ▶ Disparar
                    </button>
                  )}
                  <Link
                    href={`/cards/${card.id}/edit`}
                    className="text-sm text-gray-500 hover:text-gray-800 px-2 py-1.5"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => removeCard(card.id)}
                    disabled={busyId === card.id}
                    className="text-sm text-red-500 hover:text-red-700 px-2 py-1.5 disabled:opacity-40"
                  >
                    {busyId === card.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}