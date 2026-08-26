import { QRCodeSVG } from 'qrcode.react'

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
 *   o poca luz, no queda ningún margen. Con 'M' sube al 15% y el código sigue
 *   cabiendo en la versión 2 (25x25 módulos) para los identificadores que
 *   generamos, así que no se vuelve más denso de lo que ya era.
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
      value={value}
      size={size}
      marginSize={4}
      level="M"
      bgColor="#FFFFFF"
      fgColor="#000000"
    />
  )
}
