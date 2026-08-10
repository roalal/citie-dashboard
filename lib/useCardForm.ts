import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useCardForm({ eventId }: { eventId: string | null }) {
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

  function handleImageFileSelected(file: File | null) {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no puede pesar más de 2 MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImageUrl('')
  }

  function clearImageFile() {
    setImageFile(null)
    setImagePreview('')
  }

  function handleImageUrlChanged(value: string) {
    setImageUrl(value)
    setImageFile(null)
    setImagePreview('')
  }

  async function uploadImageIfNeeded(): Promise<{ url: string; error?: string }> {
    if (!imageFile) return { url: imageUrl.trim() }

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { data, error: uploadError } = await supabase.storage
      .from('card-images')
      .upload(fileName, imageFile)

    if (uploadError) return { url: '', error: uploadError.message }

    const { data: urlData } = supabase.storage
      .from('card-images')
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl }
  }

  async function lookupAdvertiserId(): Promise<string | undefined> {
    const { data } = await supabase
      .from('advertisers')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .single()
    return data?.id
  }

  // `activateNow` decide si la tarjeta queda visible al instante para quien
  // escanee, o si se prepara apagada para dispararla durante el evento.
  async function submit(activateNow: boolean): Promise<{ qrCode: string } | null> {
    if (!title.trim()) {
      setError('El título es obligatorio')
      return null
    }

    setLoading(true)
    setError('')
    setUploadingImage(!!imageFile)

    const [imageResult, advertiserId] = await Promise.all([
      uploadImageIfNeeded(),
      lookupAdvertiserId(),
    ])

    setUploadingImage(false)

    if (imageResult.error) {
      setError('Error al subir la imagen: ' + imageResult.error)
      setLoading(false)
      return null
    }

    const qr_code = `chitie-card-${Date.now()}`

    const { error: insertError } = await supabase.from('cards').insert({
      event_id: eventId,
      title: title.trim(),
      summary: summary.trim(),
      url: url.trim(),
      image_url: imageResult.url,
      sort_order: eventId ? parseInt(sortOrder) || 0 : undefined,
      active_from: activeFrom ? new Date(activeFrom).toISOString() : null,
      active_until: activeUntil ? new Date(activeUntil).toISOString() : null,
      qr_code,
      is_triggered: activateNow,
      advertiser_id: advertiserId,
    })

    if (insertError) {
      setError('Error al crear la tarjeta: ' + insertError.message)
      setLoading(false)
      return null
    }

    setLoading(false)
    return { qrCode: qr_code }
  }

  return {
    fields: { title, summary, url, imageUrl, imageFile, imagePreview, activeFrom, activeUntil, sortOrder },
    setTitle,
    setSummary,
    setUrl,
    setActiveFrom,
    setActiveUntil,
    setSortOrder,
    handleImageFileSelected,
    clearImageFile,
    handleImageUrlChanged,
    loading,
    uploadingImage,
    error,
    submit,
  }
}

export type UseCardFormReturn = ReturnType<typeof useCardForm>
