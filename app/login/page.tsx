'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PROVEEDORES_LOGIN, type ProveedorLogin } from '@/lib/proveedoresLogin'
import { LogoProveedor } from '@/components/LogoProveedor'

const ERRORES: Record<string, string> = {
  sin_invitacion:
    'Esa cuenta no tiene acceso al panel. Si ya te invitamos, entra con el mismo correo de la invitación.',
  proveedor: 'No se completó el inicio de sesión. Intenta de nuevo o entra con tu correo.',
  sesion: 'No se pudo iniciar sesión. Intenta de nuevo o entra con tu correo.',
  sin_codigo: 'No se pudo iniciar sesión. Intenta de nuevo o entra con tu correo.',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingInvite, setCheckingInvite] = useState(true)

  useEffect(() => {
    checkForInvite()
  }, [])

  async function entrarCon(proveedor: ProveedorLogin) {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: proveedor.id,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: proveedor.scopes,
      },
    })
    // Si todo va bien, el navegador ya se fue al proveedor.
    if (error) {
      setError(ERRORES.proveedor)
      setLoading(false)
    }
  }

  function checkForInvite() {
    const hash = window.location.hash
    console.log('Hash detectado:', hash)
    if (hash.includes('type=invite') || hash.includes('type=recovery')) {
      console.log('Redirigiendo a set-password')
      window.location.href = '/set-password' + hash
      return
    }
    console.log('No se detectó invite, mostrando login normal')
    // De regreso de /auth/callback cuando algo salió mal.
    const codigo = new URLSearchParams(window.location.search).get('error')
    if (codigo) setError(ERRORES[codigo] ?? ERRORES.sesion)
    setCheckingInvite(false)
  }

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  if (checkingInvite) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chitie</h1>
        <p className="text-gray-500 text-sm mb-8">Panel de administración</p>

        {PROVEEDORES_LOGIN.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              {PROVEEDORES_LOGIN.map((proveedor) => (
                <button
                  key={proveedor.id}
                  onClick={() => entrarCon(proveedor)}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <LogoProveedor id={proveedor.id} />
                  {proveedor.etiqueta}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 my-6 text-xs text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              o con tu correo
              <span className="h-px flex-1 bg-gray-200" />
            </div>
          </>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </main>
  )
}