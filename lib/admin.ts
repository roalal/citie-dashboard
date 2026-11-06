// El administrador del panel se reconoce por el id de su cuenta, no por el correo.
// El correo puede cambiar (saluton@citieapp.com pasará a appcitie@gmail.com) y, con
// el registro abierto y sin confirmación de correo, cualquiera podría crear una
// cuenta con un correo de administrador que haya quedado libre. El id no cambia.
export const ADMIN_USER_ID = '714f733e-18ad-4fee-b622-12fced205537'

export function esAdmin(user: { id?: string } | null | undefined): boolean {
  return !!user && user.id === ADMIN_USER_ID
}
