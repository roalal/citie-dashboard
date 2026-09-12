import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { nuevoCodigoQr } from '@/lib/qrCode'

/**
 * Muchos organizadores escriben la direccion sin esquema: "chitie.app" en vez
 * de "https://chitie.app". La app hacia Uri.parse con eso y reventaba al abrir
 * la tarjeta. El 3 de septiembre de 2026 eran 7 de las 33 tarjetas con url.
 * Se normaliza al guardar para no seguir generando datos rotos.
 */
function normalizarUrl(valor: string): string {
  const texto = valor.trim()
  if (!texto) return ''
  if (/^https?:\/\//i.test(texto)) return texto
  // Un esquema distinto se deja como esta: no es cosa de este campo decidirlo,
  // y la app ya descarta lo que no sea http o https.
  if (/^[a-z][a-z0-9+.-]*:/i.test(texto)) return texto
  return `https://${texto}`
}

/**
 * `cardId` cambia el modo del formulario: sin él se crea una tarjeta nueva,
 * con él se cargan los valores existentes y `save()` actualiza en su sitio.
 * El resto del comportamiento —subida de imagen, validación— es el mismo, y
 * por eso ambas pantallas comparten este hook en vez de duplicarlo.
 */
export function useCardForm({
  eventId,
  cardId,
}: {
  eventId: string | null
  cardId?: string
}) {
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
  const [loadingCard, setLoadingCard] = useState(!!cardId)

  useEffect(() => {
    if (!cardId) return
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('cards')
        .select('title, summary, url, image_url, sort_order, active_from, active_until')
        .eq('id', cardId)
        .maybeSingle()

      if (cancelled) return
      if (error || !data) {
        setError('No se pudo cargar la tarjeta.')
        setLoadingCard(false)
        return
      }

      setTitle(data.title ?? '')
      setSummary(data.summary ?? '')
      setUrl(data.url ?? '')
      setImageUrl(data.image_url ?? '')
      setSortOrder(String(data.sort_order ?? 0))
      // El input datetime-local no acepta zona horaria ni segundos.
      setActiveFrom(data.active_from ? data.active_from.slice(0, 16) : '')
      setActiveUntil(data.active_until ? data.active_until.slice(0, 16) : '')
      setLoadingCard(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [cardId])

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

    const qr_code = nuevoCodigoQr('card')

    const { error: insertError } = await supabase.from('cards').insert({
      event_id: eventId,
      title: title.trim(),
      summary: summary.trim(),
      url: normalizarUrl(url),
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

  /** Actualiza la tarjeta existente. No toca qr_code ni is_triggered: el QR ya
   *  puede estar impreso, y la activación se maneja desde la pantalla del evento. */
  async function save(): Promise<boolean> {
    if (!cardId) return false
    if (!title.trim()) {
      setError('El título es obligatorio')
      return false
    }

    setLoading(true)
    setError('')
    setUploadingImage(!!imageFile)

    const imageResult = await uploadImageIfNeeded()
    setUploadingImage(false)

    if (imageResult.error) {
      setError('Error al subir la imagen: ' + imageResult.error)
      setLoading(false)
      return false
    }

    const { error: updateError } = await supabase
      .from('cards')
      .update({
        title: title.trim(),
        summary: summary.trim(),
        url: normalizarUrl(url),
        image_url: imageResult.url,
        sort_order: eventId ? parseInt(sortOrder) || 0 : undefined,
        active_from: activeFrom ? new Date(activeFrom).toISOString() : null,
        active_until: activeUntil ? new Date(activeUntil).toISOString() : null,
      })
      .eq('id', cardId)

    setLoading(false)
    if (updateError) {
      setError('Error al guardar: ' + updateError.message)
      return false
    }
    return true
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
    loadingCard,
    uploadingImage,
    error,
    submit,
    save,
  }
}

export type UseCardFormReturn = ReturnType<typeof useCardForm>
