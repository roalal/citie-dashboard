import { supabase } from '@/lib/supabase'

export type DeleteTarget = { type: 'event' | 'card'; id: string }
export type Dependents = { cards: number; saved: number; name: string }

async function call<T>(
  action: 'check' | 'delete',
  target: DeleteTarget,
  extra: Record<string, unknown> = {}
): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Tu sesión expiró. Vuelve a entrar.')

  const res = await fetch('/api/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...target, ...extra }),
  })

  // Si la sesión caducó, el middleware redirige a /login y aquí llega HTML.
  // Sin esto el JSON.parse reventaría con un mensaje que no dice nada.
  const raw = await res.text()
  let body: T & { error?: string }
  try {
    body = JSON.parse(raw)
  } catch {
    throw new Error(
      res.status === 401 || res.redirected
        ? 'Tu sesión expiró. Vuelve a entrar.'
        : `Respuesta inesperada del servidor (${res.status})`
    )
  }

  if (!res.ok) throw new Error(body.error ?? 'No se pudo completar la operación')
  return body
}

/** Qué colgaría del borrado, para poder avisar antes de confirmar. */
export function checkDependents(target: DeleteTarget): Promise<Dependents> {
  return call<Dependents>('check', target)
}

/**
 * `confirmarGuardadas`: para una tarjeta que alguien guardó, el número de
 * personas que el organizador vio al confirmar. El servidor solo borra si
 * sigue siendo ese.
 */
export function deleteContent(
  target: DeleteTarget,
  confirmarGuardadas?: number
): Promise<{ deletedCards?: number }> {
  return call<{ deletedCards?: number }>('delete', target, { confirmarGuardadas })
}

/**
 * Pregunta, borra y devuelve un mensaje de error si lo hubo.
 * Devuelve null cuando el usuario cancela o cuando el borrado salió bien.
 */
export async function confirmAndDelete(
  target: DeleteTarget,
  noun: string
): Promise<string | null> {
  try {
    const info = await checkDependents(target)

    let message = `¿Eliminar ${noun} "${info.name}"?`
    if (target.type === 'event' && info.cards > 0) {
      message += `\n\nSe eliminarán también sus ${info.cards} ${info.cards === 1 ? 'tarjeta' : 'tarjetas'}.`
    }
    if (target.type === 'card') {
      message += '\n\nDesaparece para todos, también para quienes ya la recibieron.'
      if (info.saved > 0) {
        message += ` ${info.saved} ${info.saved === 1 ? 'persona la tiene' : 'personas la tienen'} en Guardados: también desaparecerá de ahí.`
      }
      message +=
        '\n\nSi solo quieres corregir un error, usa "Editar": la corrección llega a todos los que la tienen. Para que deje de mostrarse a quien escanee desde ahora, usa "Retirar".'
    }
    message += '\n\nEsta acción no se puede deshacer.'

    if (!confirm(message)) return null

    await deleteContent(target, target.type === 'card' ? info.saved : undefined)
    return null
  } catch (e) {
    return e instanceof Error ? e.message : 'Error inesperado'
  }
}
