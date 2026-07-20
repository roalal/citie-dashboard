'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSession, setHasSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [invitedEmail, setInvitedEmail] = useState('')

  useEffect(() => {
    processInviteToken()
  }, [])

  async function processInviteToken() {
    const hash = window.location.hash
    console.log('HASH COMPLETO:', hash)
    
    const params = new URLSearchParams(hash.replace('#', ''))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    
    console.log('accessToken existe:', !!accessToken)
    console.log('refreshToken existe:', !!refreshToken)

    if (!accessToken || !refreshToken) {
      console.log('FALTA TOKEN - deteniendo aquí')
      setHasSession(false)
      setCheckingSession(false)
      return
    }

    await supabase.auth.signOut()

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    console.log('setSession data:', data)
    console.log('setSession error:', error)

    if (error || !data.session) {
      console.log('ERROR o sin sesión - mostrando enlace inválido')
      setHasSession(false)
      setCheckingSession(false)
      return
    }

    setInvitedEmail(data.session.user.email || '')
    setHasSession(true)
    setCheckingSession(false)
  }

  async function handleSubmit() {
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Error al establecer la contraseña: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Verificando invitación...</p>
      </main>
    )
  }

  if (!hasSession) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Enlace inválido</h1>
          <p className="text-gray-500 text-sm">
            Este enlace de invitación ya expiró o no es válido. Solicita una nueva invitación.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido a CiTie</h1>
        <p className="text-gray-500 text-sm mb-2">
          Creando contraseña para <strong>{invitedEmail}</strong>
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Si este correo no es correcto, cierra esta ventana y solicita una nueva invitación.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear contraseña y continuar'}
          </button>
        </div>
      </div>
    </main>
  )
}