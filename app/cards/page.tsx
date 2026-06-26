'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

type Card = {
  id: string
  title: string
  summary: string
  url: string
  image_url: string
  qr_code: string
  active_from: string
  active_until: string
  is_triggered: boolean
  created_at: string
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  async function fetchCards() {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .is('event_id', null)
      .order('created_at', { ascending: false })

    if (!error && data) setCards(data)
    setLoading(false)
  }

  async function toggleCard(id: string, current: boolean) {
    await supabase
      .from('cards')
      .update({ is_triggered: !current })
      .eq('id', id)
    fetchCards()
  }

  async function deleteCard(id: string) {
    if (!confirm('¿Eliminar esta tarjeta?')) return
    await supabase.from('cards').delete().eq('id', id)
    fetchCards()
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-blue-500 hover:underline mb-1 block">← Inicio</Link>
            <h1 className="text-3xl font-bold text-gray-900">Tarjetas independientes</h1>
            <p className="text-gray-500 text-sm mt-1">Cada tarjeta tiene su propio QR único</p>
          </div>
          <Link
            href="/cards/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Nueva tarjeta
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 mb-4">No hay tarjetas independientes todavía</p>
            <Link
              href="/cards/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Crear primera tarjeta
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cards.map((card) => (
              <div key={card.id} className="bg-white rounded-xl border border-gray-200 p-5 flex gap-6 items-start">
                <div id={`card-qr-${card.id}`}>
                  <QRCodeSVG value={card.qr_code} size={80} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-semibold text-gray-800">{card.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${card.is_triggered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {card.is_triggered ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  {card.summary && <p className="text-gray-500 text-sm mb-2">{card.summary}</p>}
                  {card.url && (
                    <a href={card.url} target="_blank" className="text-blue-500 text-xs hover:underline">
                      {card.url}
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleCard(card.id, card.is_triggered)}
                    className={`text-sm px-3 py-1.5 rounded-lg transition ${card.is_triggered ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  >
                    {card.is_triggered ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => {
                      const svg = document.querySelector(`#card-qr-${card.id} svg`) as SVGElement
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
                        a.download = `qr-${card.title.replace(/\s+/g, '-').toLowerCase()}.png`
                        a.href = canvas.toDataURL('image/png')
                        a.click()
                      }
                      img.src = url
                    }}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                  >
                    Descargar QR
                  </button>
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                  >
                    Eliminar
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