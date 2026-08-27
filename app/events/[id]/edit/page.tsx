'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// El color decide la franja que la app pinta sobre cada tarjeta del evento.
// Al crear se asigna uno al azar; hasta ahora no había forma de cambiarlo.
const EVENT_COLORS = [
  '#2563EB', '#16A34A', '#D97706', '#DB2777',
  '#7C3AED', '#0D9488', '#DC2626', '#4B5563',
]

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(EVENT_COLORS[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('events')
        .select('name, description, color')
        .eq('id', id)
        .maybeSingle()

      if (error || !data) {
        setError('No se pudo cargar el evento.')
        setLoading(false)
        return
      }
      setName(data.name ?? '')
      setDescription(data.description ?? '')
      if (data.color) setColor(data.color)
      setLoading(false)
    }
    load()
  }, [id])

  async function save() {
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('events')
      .update({
        name: name.trim(),
        description: description.trim(),
        color,
      })
      .eq('id', id)

    setSaving(false)
    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }
    router.push(`/events/${id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <Link href={`/events/${id}`} className="text-sm text-blue-500 hover:underline mb-1 block">
          ← Volver al evento
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar evento</h1>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Nombre</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Descripción</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Color del evento</span>
              <span className="text-xs text-gray-500">
                Es la franja que la app pinta sobre las tarjetas de este evento.
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                    style={{ backgroundColor: c }}
                    className={`w-9 h-9 rounded-full transition ${
                      color === c ? 'ring-2 ring-offset-2 ring-gray-800' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <Link
                href={`/events/${id}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                Cancelar
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
