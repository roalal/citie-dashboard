import type { Provider } from '@supabase/supabase-js'

export type ProveedorLogin = {
  id: Provider
  etiqueta: string
  /** Permisos extra que pide el proveedor; Microsoft no manda el correo sin "email". */
  scopes?: string
}

/**
 * Los que se ofrecen en el panel. Cada uno debe estar encendido en Supabase →
 * Authentication → Providers, o el botón lleva a un error. Para sumar Microsoft
 * basta agregarlo aquí cuando esté configurado.
 *
 * Solo entra quien ya tiene invitación: si el correo de la cuenta coincide con
 * el de la invitación, Supabase la une a esa cuenta; si no, /auth/callback la
 * rechaza.
 */
export const PROVEEDORES_LOGIN: ProveedorLogin[] = [
  { id: 'google', etiqueta: 'Continuar con Google' },
  { id: 'apple', etiqueta: 'Continuar con Apple' },
]
