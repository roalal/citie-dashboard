/**
 * Genera el código que va dentro de un QR.
 *
 * Antes era `chitie-event-${Date.now()}`: una marca de tiempo en milisegundos.
 * El problema es que ese código *es* la credencial de acceso — quien lo tiene
 * hace check-in en el evento — y una marca de tiempo se puede adivinar: a
 * quien acierte el minuto de creación le quedan 60 000 intentos. Peor aún,
 * los códigos salen en orden temporal, así que encontrar uno sitúa a todos
 * sus vecinos.
 *
 * 16 caracteres de un alfabeto de 32 son 80 bits de azar. No se adivina.
 *
 * La longitud importa por una razón que no es la seguridad: el código acaba
 * dentro de un QR, y cuanto más largo, más denso el patrón y peor lo lee una
 * cámara modesta —ya tuvimos ese problema con un Honor X6a—. Por eso 16 y no
 * un UUID: pasamos de 26 a 29 caracteres y la densidad del QR no cambia.
 * Un UUID habría sumado 36 y sí se habría notado.
 *
 * El prefijo NO cambia. La app distingue qué escaneó mirándolo
 * (`main.dart`, startsWith 'chitie-event-' / 'chitie-card-'), así que
 * cualquier versión ya instalada lee los códigos nuevos sin actualizarse.
 */

// Sin i, l, o ni u: no se confunden entre sí al leerlos, ni al dictarlos por
// teléfono, y no forman palabras por accidente.
const ALFABETO = '0123456789abcdefghjkmnpqrstvwxyz'
const LONGITUD = 16

export function nuevoCodigoQr(tipo: 'event' | 'card'): string {
  const bytes = new Uint8Array(LONGITUD)
  crypto.getRandomValues(bytes)

  let sufijo = ''
  for (const b of bytes) {
    // 256 es múltiplo exacto de 32, así que el resto no introduce sesgo
    // hacia los primeros caracteres del alfabeto.
    sufijo += ALFABETO[b % ALFABETO.length]
  }

  return `chitie-${tipo}-${sufijo}`
}
