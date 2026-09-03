/**
 * Exporta a PNG el QR que ya está dibujado en la página.
 *
 * Los QR de Chitie se imprimen o se proyectan; nadie los escanea desde el
 * dashboard. A 400 px eran 3.4 cm a 300 DPI, y al ampliarlos a tamaño de cartel
 * se pixelaban justo donde el decodificador necesita bordes nítidos.
 *
 * El detalle que hace que esto funcione: el SVG del DOM lleva width y height
 * del tamaño con el que se dibuja en pantalla (132 px en la página del evento).
 * Si se serializa tal cual y se pinta a 2000, el navegador puede rasterizarlo a
 * su tamaño intrínseco y luego ampliar el mapa de bits — un PNG de 2000 px
 * borroso, peor que uno nítido de 400. Por eso se clona y se le fija el tamaño
 * antes de serializar: el viewBox hace el resto y el vector se rasteriza ya a
 * resolución completa.
 */
const QR_EXPORT_PX = 2000

export function descargarQr(selector: string, nombreArchivo: string) {
  const original = document.querySelector(`${selector} svg`)
  if (!(original instanceof SVGElement)) return

  const clon = original.cloneNode(true) as SVGElement
  clon.setAttribute('width', String(QR_EXPORT_PX))
  clon.setAttribute('height', String(QR_EXPORT_PX))

  const canvas = document.createElement('canvas')
  canvas.width = QR_EXPORT_PX
  canvas.height = QR_EXPORT_PX
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const svgData = new XMLSerializer().serializeToString(clon)
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.onload = () => {
    // Fondo blanco explícito: el PNG con transparencia pierde el contraste que
    // el decodificador necesita si acaba sobre un fondo de color.
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, QR_EXPORT_PX, QR_EXPORT_PX)
    ctx.drawImage(img, 0, 0, QR_EXPORT_PX, QR_EXPORT_PX)
    URL.revokeObjectURL(url)

    const a = document.createElement('a')
    a.download = `${nombreArchivo}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }
  img.onerror = () => URL.revokeObjectURL(url)
  img.src = url
}

/** Nombre de archivo seguro a partir del título del evento o la tarjeta. */
export function nombreQr(titulo: string | undefined): string {
  const base = (titulo ?? 'chitie').trim().replace(/\s+/g, '-').toLowerCase()
  return `qr-${base || 'chitie'}`
}
