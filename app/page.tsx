'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'saluton@citieapp.com'

export default function Home() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkIfAdmin()
  }, [])

  async function checkIfAdmin() {
    const { data } = await supabase.auth.getUser()
    setIsAdmin(data.user?.email === ADMIN_EMAIL)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CiTie Dashboard</h1>
            <p className="text-gray-500">Panel de administración</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin/anunciantes"
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Invitar anunciante
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/events" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Eventos en vivo</h2>
            <p className="text-gray-500 text-sm">Gestiona eventos y dispara mensajes en tiempo real</p>
          </Link>

          <Link href="/cards" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Tarjetas</h2>
            <p className="text-gray-500 text-sm">Administra todas las tarjetas y sus vigencias</p>
          </Link>
        </div>
      </div>
    </main>
  )
}