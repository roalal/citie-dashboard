'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'saluton@citieapp.com'

export default function InviteAdvertiserPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    const { data } = await supabase.auth.getUser()
    if (data.user?.email === ADMIN_EMAIL) {
      setAuthorized(true)
    } else {
      router.push('/')
    }
    setChecking(false)
  }

  async function handleInvite() {
    if (!email.trim() || !name.trim()) {
      setError('Correo y nombre son obligatorios')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const response = await fetch('/api/invite-advertiser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), name: name.trim() }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Error al invitar')
      setLoading(false)
      return
    }

    setSuccess(`Invitación enviada a ${data.email}`)
    setEmail('')
    setName('')
    setLoading(false)
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Verificando acceso...</p>
      </main>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-6 block">
          ← Inicio
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Invitar anunciante</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del anunciante
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Congreso Nacional de Medicina"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anunciante@correo.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {success && (
            <p className="text-green-600 text-sm">{success}</p>
          )}

          <button
            onClick={handleInvite}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar invitación'}
          </button>
        </div>
      </div>
    </main>
  )
}