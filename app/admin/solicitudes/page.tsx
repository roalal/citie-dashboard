'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ADMIN_EMAIL } from '@/lib/admin'

type Solicitud = {
  id: string
  created_at: string
  nombre: string
  empresa: string | null
  medio: 'correo' | 'telefono' | 'whatsapp'
  correo: string | null
  telefono: string | null
  mensaje: string
  atendida: boolean
}

const ETIQUETA_MEDIO = { correo: 'Correo', telefono: 'Teléfono', whatsapp: 'WhatsApp' }

/** wa.me exige el número en formato internacional, solo dígitos. Un número
 *  mexicano de 10 dígitos llega sin lada de país: se le antepone el 52. */
function enlaceWhatsApp(telefono: string): string {
  const digitos = telefono.replace(/\D/g, '')
  return `https://wa.me/${digitos.length === 10 ? '52' + digitos : digitos}`
}

function fecha(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function SolicitudesPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [verTodas, setVerTodas] = useState(false)
  const [error, setError] = useState('')

  async function token(): Promise<string | undefined> {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }

  async function cargar() {
    const t = await token()
    const res = await fetch('/api/solicitudes', {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'No se pudieron cargar las solicitudes')
      return
    }
    setSolicitudes(data.solicitudes)
  }

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user?.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      await cargar()
      setChecking(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function marcar(s: Solicitud, atendida: boolean) {
    // Se refleja al momento; si el servidor falla, se deshace.
    setSolicitudes((prev) => prev.map((x) => (x.id === s.id ? { ...x, atendida } : x)))
    const t = await token()
    const res = await fetch('/api/solicitudes', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify({ id: s.id, atendida }),
    })
    if (!res.ok) {
      setSolicitudes((prev) => prev.map((x) => (x.id === s.id ? { ...x, atendida: !atendida } : x)))
      setError('No se pudo actualizar la solicitud')
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Verificando acceso...</p>
      </main>
    )
  }

  const pendientes = solicitudes.filter((s) => !s.atendida)
  const visibles = verTodas ? solicitudes : pendientes

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-6 block">
          ← Inicio
        </Link>
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes de contacto</h1>
            <p className="text-sm text-gray-500 mt-1">
              Desde el formulario de chitie.app · {pendientes.length} pendiente{pendientes.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 text-sm">
            <button
              onClick={() => setVerTodas(false)}
              className={`px-3 py-1.5 rounded-md ${!verTodas ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setVerTodas(true)}
              className={`px-3 py-1.5 rounded-md ${verTodas ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
            >
              Todas
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {visibles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
            {verTodas ? 'Todavía no ha llegado ninguna solicitud.' : 'No hay solicitudes pendientes.'}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visibles.map((s) => (
              <li
                key={s.id}
                className={`bg-white rounded-xl border p-5 flex flex-col gap-3 ${s.atendida ? 'border-gray-200 opacity-70' : 'border-gray-300'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {s.nombre}
                      {s.empresa && <span className="font-normal text-gray-500"> · {s.empresa}</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{fecha(s.created_at)}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    Prefiere {ETIQUETA_MEDIO[s.medio]}
                  </span>
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{s.mensaje}</p>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {s.correo && (
                    <a href={`mailto:${s.correo}`} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800">
                      ✉ {s.correo}
                    </a>
                  )}
                  {s.telefono && (
                    <a href={`tel:${s.telefono.replace(/[^0-9+]/g, '')}`} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800">
                      ☎ {s.telefono}
                    </a>
                  )}
                  {s.telefono && (
                    <a href={enlaceWhatsApp(s.telefono)} target="_blank" rel="noopener" className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800">
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => marcar(s, !s.atendida)}
                    className={`ml-auto px-3 py-1.5 rounded-lg text-sm font-medium ${s.atendida ? 'text-gray-600 border border-gray-200 hover:bg-gray-50' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                  >
                    {s.atendida ? 'Marcar pendiente' : 'Marcar atendida'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
