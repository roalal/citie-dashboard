'use client'

import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useCardForm } from '@/lib/useCardForm'
import { CardFormFields } from '@/components/CardFormFields'

export default function NewCardPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const form = useCardForm({ eventId: id })

  async function handleSubmit(activateNow: boolean) {
    const result = await form.submit(activateNow)
    if (result) router.push(`/events/${id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/events/${id}`} className="text-sm text-blue-500 hover:underline mb-6 block">
          ← Volver al evento
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Nueva card</h1>

        <CardFormFields
          form={form}
          showSortOrder={true}
          nounLabel="card"
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  )
}
