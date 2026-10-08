import { QRCodeSVG } from 'qrcode.react'
import { contenidoQr } from '@/lib/qrCode'

/**
 * Único punto donde se dibuja un QR de Chitie.
 *
 * qrcode.react trae `marginSize: 0` y `level: 'L'` por defecto, y ninguno de
 * los dos sirve para códigos impresos:
 *
 * - Sin margen no hay zona de silencio. La especificación exige 4 módulos, y
 *   sin ellos el código solo se lee cuando queda sobre una superficie blanca
 *   que se la presta por accidente. Sobre fondo de color falla en silencio:
 *   la cámara funciona, el decodificador no encuentra nada y no hay error que
 *   reportar. Es lo que reportaron dos usuarios distintos.
 * - El nivel 'L' recupera solo el 7%. En cámaras de gama baja, con desenfoque
 *   o poca luz, no queda ningún margen. Con 'M' sube al 15%.
 *
 * Recibe el código de la base y dibuja su enlace (ver `contenidoQr`), para que
 * la cámara normal del teléfono lleve a descargar la app. Con el enlace queda
 * en 29x29 módulos, igual que con el código de 16 caracteres.
 */
export function ScannableQr({
  value,
  size,
}: {
  value: string
  size: number
}) {
  return (
    <QRCodeSVG
      value={contenidoQr(value)}
      size={size}
      marginSize={4}
      level="M"
      bgColor="#FFFFFF"
      fgColor="#000000"
    />
  )
}
