'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Event = {
  id: string
  name: string
  description: string
  status: string
  created_at: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setEvents(data)
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('events').update({ status }).eq('id', id)
    fetchEvents()
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

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-blue-500 hover:underline mb-1 block">← Inicio</Link>
            <h1 className="text-3xl font-bold text-gray-900">Eventos en vivo</h1>
          </div>
          <Link href="/events/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Nuevo evento
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 mb-4">No hay eventos todavía</p>
            <Link href="/events/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Crear primer evento
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-semibold text-gray-800">{event.name}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[event.status]}`}>
                      {statusLabel[event.status]}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{event.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/events/${event.id}`} className="text-sm text-blue-500 hover:underline px-3 py-2">
                    Ver cards
                  </Link>
                  {event.status === 'draft' && (
                    <button onClick={() => updateStatus(event.id, 'active')} className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition">
                      Activar
                    </button>
                  )}
                  {event.status === 'active' && (
                    <button onClick={() => updateStatus(event.id, 'finished')} className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition">
                      Finalizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}