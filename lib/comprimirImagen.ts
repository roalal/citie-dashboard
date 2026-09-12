/**
 * Comprime una imagen en el navegador antes de subirla.
 *
 * Hasta ahora se subía el archivo tal cual salía del teléfono o la cámara:
 * media de 553 KB y hasta 1.6 MB, para una tarjeta que se muestra a unos
 * 400 px de ancho. Con 15 tarjetas y 150 asistentes eso es 1.2 GB de salida en
 * un solo evento, de los 5 GB que da el plan gratuito al mes.
 *
 * Y la cuota es el menor de los problemas: en los eventos de Solidfarma la
 * gente entra con datos móviles, así que cada megabyte de más es una tarjeta
 * que tarda en aparecer, o que no aparece.
 *
 * WebP y no JPEG porque **conserva la transparencia**: un logo en PNG
 * convertido a JPEG saldría con el fondo en negro. Flutter lee WebP de forma
 * nativa en Android y iOS, así que la app no necesita nada.
 */

/** A 1080 px de ancho una tarjeta se ve nítida hasta en pantallas densas. */
export const LADO_MAX = 1080
export const CALIDAD = 0.82

export type ImagenComprimida = {
  blob: Blob
  extension: string
  tipo: string
}

/**
 * Devuelve la versión comprimida, o `null` si no hay nada que ganar — en cuyo
 * caso quien llama debe subir el original. Nunca lanza: si algo falla, el
 * original se sube igual y la tarjeta se crea.
 */
export async function comprimirImagen(file: File): Promise<ImagenComprimida | null> {
  if (!file.type.startsWith('image/')) return null
  // Los GIF pueden estar animados y el canvas se quedaría con el primer
  // fotograma, así que no se tocan.
  if (file.type === 'image/gif') return null

  try {
    // `imageOrientation: 'from-image'` aplica la orientación EXIF. Sin esto,
    // las fotos hechas con el teléfono en vertical se dibujan giradas en el
    // canvas: es el fallo clásico de comprimir en el navegador.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

    const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height))
    const ancho = Math.round(bitmap.width * escala)
    const alto = Math.round(bitmap.height * escala)

    const lienzo = document.createElement('canvas')
    lienzo.width = ancho
    lienzo.height = alto

    const ctx = lienzo.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, ancho, alto)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      lienzo.toBlob(resolve, 'image/webp', CALIDAD),
    )

    // Si el navegador no sabe escribir WebP devuelve null o un PNG. Antes que
    // arriesgar un JPEG con el fondo en negro, se sube el original.
    if (!blob || blob.type !== 'image/webp') return null

    // Una imagen ya optimizada puede salir más grande al recodificarla.
    if (blob.size >= file.size) return null

    return { blob, extension: 'webp', tipo: 'image/webp' }
  } catch {
    return null
  }
}
