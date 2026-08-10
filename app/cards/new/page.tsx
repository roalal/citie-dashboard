'use client'

import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { useCardForm } from '@/lib/useCardForm'
import { CardFormFields } from '@/components/CardFormFields'
import { useState } from 'react'

export default function NewIndependentCardPage() {
  const form = useCardForm({ eventId: null })
  const [createdQr, setCreatedQr] = useState('')

  async function handleSubmit(activateNow: boolean) {
    const result = await form.submit(activateNow)
    if (result) setCreatedQr(result.qrCode)
  }

  if (createdQr) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Tarjeta creada!</h2>
              <p className="text-gray-500 text-sm">Escanea este QR para acceder a la tarjeta</p>
            </div>
            <QRCodeSVG value={createdQr} size={200} />
            <p className="text-xs text-gray-400 font-mono">{createdQr}</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => window.print()}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Imprimir QR
              </button>
              <Link
                href="/cards"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition text-center"
              >
                Ver tarjetas
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
        <Link href="/cards" className="text-sm text-blue-500 hover:underline mb-6 block">
          ← Tarjetas
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Nueva tarjeta independiente</h1>

        <CardFormFields
          form={form}
          showSortOrder={false}
          nounLabel="tarjeta"
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  )
}
