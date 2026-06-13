import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CiTie Dashboard</h1>
        <p className="text-gray-500 mb-8">Panel de administración</p>

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