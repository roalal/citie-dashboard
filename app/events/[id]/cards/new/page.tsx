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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [sortOrder, setSortOrder] = useState('0')
  const [activeFrom, setActiveFrom] = useState('')
  const [activeUntil, setActiveUntil] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!title.trim()) {
      setError('El título es obligatorio')
      return
    }

    setLoading(true)
    setError('')

    let finalImageUrl = imageUrl.trim()

    if (imageFile) {
      setUploadingImage(true)
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('card-images')
        .upload(fileName, imageFile)

      if (uploadError) {
        setError('Error al subir la imagen: ' + uploadError.message)
        setLoading(false)
        setUploadingImage(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('card-images')
        .getPublicUrl(data.path)

      finalImageUrl = urlData.publicUrl
      setUploadingImage(false)
    }

    const qr_code = `citie-card-${Date.now()}`

    const { data: advertiserData } = await supabase
      .from('advertisers')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .single()

    const { error } = await supabase.from('cards').insert({
      event_id: id,
      title: title.trim(),
      summary: summary.trim(),
      url: url.trim(),
      image_url: finalImageUrl,
      sort_order: parseInt(sortOrder) || 0,
      active_from: activeFrom ? new Date(activeFrom).toISOString() : null,
      active_until: activeUntil ? new Date(activeUntil).toISOString() : null,
      qr_code,
      is_triggered: false,
      advertiser_id: advertiserData?.id,
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
              Imagen
            </label>
            <div className="flex flex-col gap-3">
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert('La imagen no puede pesar más de 2 MB')
                        e.target.value = ''
                        return
                      }
                      setImageFile(file)
                      setImagePreview(URL.createObjectURL(file))
                      setImageUrl('')
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-400 mt-1">JPG, PNG o WebP · Máximo 2 MB</p>
              </div>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">o usa una URL</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setImageFile(null)
                  setImagePreview('')
                }}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vigente desde
              </label>
              <input
                type="datetime-local"
                value={activeFrom}
                onChange={(e) => setActiveFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-xs text-gray-400 mt-1">Opcional — déjalo vacío para sin restricción</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vigente hasta
              </label>
              <input
                type="datetime-local"
                value={activeUntil}
                onChange={(e) => setActiveUntil(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-xs text-gray-400 mt-1">Opcional — déjalo vacío para sin restricción</p>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || uploadingImage}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploadingImage ? 'Subiendo imagen...' : loading ? 'Creando...' : 'Crear card'}
          </button>
        </div>
      </div>
    </main>
  )
}