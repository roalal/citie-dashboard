'use client'

console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewEventPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    setLoading(true)
    setError('')

    const qr_code = `citie-event-${Date.now()}`

    const { error } = await supabase.from('events').insert({
      name: name.trim(),
      description: description.trim(),
      qr_code,
      status: 'draft',
    })

    if (error) {
      setError('Error al crear el evento: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/events')
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