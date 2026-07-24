'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfilePage() {
  const [advertiserId, setAdvertiserId] = useState('')
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('advertisers')
      .select('id, name, logo_url')
      .eq('auth_user_id', userData.user?.id)
      .single()

    if (!error && data) {
      setAdvertiserId(data.id)
      setName(data.name || '')
      setLogoUrl(data.logo_url || '')
    }

    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')

    let finalLogoUrl = logoUrl

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `avatar-${advertiserId}-${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('card-images')
        .upload(fileName, imageFile)

      if (uploadError) {
        setError('Error al subir la imagen: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('card-images')
        .getPublicUrl(data.path)

      finalLogoUrl = urlData.publicUrl
    }

    const { error: updateError } = await supabase
      .from('advertisers')
      .update({ name: name.trim(), logo_url: finalLogoUrl })
      .eq('id', advertiserId)

    if (updateError) {
      setError('Error al guardar: ' + updateError.message)
      setSaving(false)
      return
    }

    setLogoUrl(finalLogoUrl)
    setImageFile(null)
    setImagePreview('')
    setSuccess('Perfil actualizado correctamente')
    setSaving(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-6 block">
          ← Inicio
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi perfil</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            {imagePreview || logoUrl ? (
              <img
                src={imagePreview || logoUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                {name.trim().charAt(0).toUpperCase() || '?'}
              </div>
            )}
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
                }
              }}
              className="text-sm text-gray-600"
            />
            <p className="text-xs text-gray-400">JPG, PNG o WebP · Máximo 2 MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del anunciante
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre visible para los asistentes"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </main>
  )
}