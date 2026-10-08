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

/**
 * Lo que va DENTRO del QR que se imprime, a partir del código que guarda la
 * base.
 *
 * Un código opaco (`chitie-event-…`) solo lo entiende el escáner de la app: la
 * cámara normal del teléfono le mostraba texto a quien aún no tenía Chitie, y
 * el cartel no podía llevarlo a descargarla. Un enlace sí: abre una página en
 * chitie.app que manda a su tienda, y la app (1.4.0 en adelante) traduce el
 * enlace de vuelta al código. La base no cambia.
 *
 * Mide lo mismo que el código: `https://chitie.app/e/` + 16 caracteres son 37
 * bytes y caben en la misma versión de QR (29×29 a nivel M).
 *
 * Los antiguos `citie-…` se dejan tal cual: la app convierte `/e/` en
 * `chitie-event-`, así que un enlace no podría devolverles su prefijo.
 */
export function contenidoQr(codigo: string): string {
  const m = codigo.match(/^chitie-(event|card)-([0-9a-z]+)$/)
  if (!m) return codigo
  return `https://chitie.app/${m[1] === 'event' ? 'e' : 'c'}/${m[2]}`
}

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
