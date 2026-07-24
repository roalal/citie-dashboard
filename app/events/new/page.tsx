'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

export default function NewEventPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdEvent, setCreatedEvent] = useState<{id: string, name: string, qr_code: string} | null>(null)

  async function handleSubmit() {
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    setLoading(true)
    setError('')

    const qr_code = `citie-event-${Date.now()}`

    const EVENT_COLORS = [
      '#2563EB', '#16A34A', '#D97706', '#DB2777',
      '#7C3AED', '#0D9488', '#DC2626', '#4B5563',
    ]
    const color = EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]

    const { data: advertiserData } = await supabase
      .from('advertisers')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .single()

    const { data, error } = await supabase.from('events').insert({
      name: name.trim(),
      description: description.trim(),
      qr_code,
      status: 'draft',
      advertiser_id: advertiserData?.id,
      color,
    }).select().single()

    if (error) {
      setError('Error al crear el evento: ' + error.message)
      setLoading(false)
      return
    }

    setCreatedEvent(data)
    setLoading(false)
  }

  if (createdEvent) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Evento creado!</h2>
              <p className="text-gray-500 text-sm">
                <strong>{createdEvent.name}</strong>
              </p>
            </div>

           <div id="event-qr" className="flex flex-col items-center gap-2 w-full">
              <p className="text-sm font-medium text-gray-700">QR del evento</p>
              <QRCodeSVG value={createdEvent.qr_code} size={180} />
              <p className="text-xs text-gray-400 font-mono">{createdEvent.qr_code}</p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => window.print()}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Imprimir
                </button>
                <button
                  onClick={() => {
                    const svg = document.querySelector('#event-qr svg') as SVGElement
                    if (!svg) return
                    const canvas = document.createElement('canvas')
                    canvas.width = 400
                    canvas.height = 400
                    const ctx = canvas.getContext('2d')
                    if (!ctx) return
                    const img = new Image()
                    const svgData = new XMLSerializer().serializeToString(svg)
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
                    const url = URL.createObjectURL(svgBlob)
                    img.onload = () => {
                      ctx.fillStyle = 'white'
                      ctx.fillRect(0, 0, 400, 400)
                      ctx.drawImage(img, 0, 0, 400, 400)
                      URL.revokeObjectURL(url)
                      const a = document.createElement('a')
                      a.download = `qr-${createdEvent.name.replace(/\s+/g, '-').toLowerCase()}.png`
                      a.href = canvas.toDataURL('image/png')
                      a.click()
                    }
                    img.src = url
                  }}
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition"
                >
                  Descargar PNG
                </button>
              </div>
            </div>

            <div className="w-full border-t border-gray-100 pt-4 flex flex-col gap-3">
              <p className="text-sm text-gray-500 text-center">
                Los asistentes escanearán este QR para ver las actividades del evento
              </p>
              <Link
                href={`/events/${createdEvent.id}/cards/new`}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition text-center"
              >
                + Agregar primera card
              </Link>
              <Link
                href={`/events/${createdEvent.id}`}
                className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition text-center"
              >
                Ver evento
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/events" className="text-sm text-blue-500 hover:underline mb-6 block">
          ← Eventos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Nuevo evento</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del evento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Congreso de Tecnología 2025"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente el evento..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear evento'}
          </button>
        </div>
      </div>
    </main>
  )
}