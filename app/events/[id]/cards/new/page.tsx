'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function NewCardPage() {
  const router = useRouter()
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!title.trim()) {
      setError('El título es obligatorio')
      return
    }

    setLoading(true)
    setError('')

    const qr_code = `citie-card-${Date.now()}`

    const { error } = await supabase.from('cards').insert({
      event_id: id,
      title: title.trim(),
      summary: summary.trim(),
      url: url.trim(),
      image_url: imageUrl.trim(),
      sort_order: parseInt(sortOrder) || 0,
      qr_code,
      is_triggered: false,
    })

    if (error) {
      setError('Error al crear la card: ' + error.message)
      setLoading(false)
      return
    }

    router.push(`/events/${id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/events/${id}`} className="text-sm text-blue-500 hover:underline mb-6 block">
          ← Volver al evento
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Nueva card</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Bienvenida al congreso"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resumen
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Descripción breve del contenido..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de destino
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de imagen
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min="0"
              className="w-32 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">Define el orden en que aparece la card en el evento</p>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear card'}
          </button>
        </div>
      </div>
    </main>
  )
}