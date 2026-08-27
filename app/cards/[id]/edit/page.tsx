'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useCardForm } from '@/lib/useCardForm'
import { CardFormFields } from '@/components/CardFormFields'

/**
 * Edición de una tarjeta, sea suelta o de evento. Se resuelve su `event_id`
 * al cargar para saber a dónde volver y si mostrar el orden de aparición.
 */
export default function EditCardPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [eventId, setEventId] = useState<string | null>(null)
  const [resolving, setResolving] = useState(true)

  useEffect(() => {
    async function resolve() {
      const { data } = await supabase
        .from('cards')
        .select('event_id')
        .eq('id', id)
        .maybeSingle()
      setEventId(data?.event_id ?? null)
      setResolving(false)
    }
    resolve()
  }, [id])

  const form = useCardForm({ eventId, cardId: id })
  const backHref = eventId ? `/events/${eventId}` : '/cards'

  async function handleSave() {
    const ok = await form.save()
    if (ok) router.push(backHref)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <Link href={backHref} className="text-sm text-blue-500 hover:underline mb-1 block">
          ← Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar tarjeta</h1>
        <p className="text-sm text-gray-500 mb-8">
          El código QR no cambia, así que los impresos siguen sirviendo.
        </p>

        {resolving || form.loadingCard ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <CardFormFields
              form={form}
              showSortOrder={!!eventId}
              nounLabel="tarjeta"
              mode="edit"
              onSubmit={handleSave}
            />
          </div>
        )}
      </div>
    </main>
  )
}
