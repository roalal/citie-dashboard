import type { MetadataRoute } from 'next'

// El panel instalable: desde el navegador del teléfono o la tableta,
// "Agregar a pantalla de inicio" lo deja con su ícono y se abre sin la barra del
// navegador, como una app. Se llama "Chitie Panel" para no confundirlo con la
// app de los asistentes, que lleva el mismo ícono.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chitie Panel',
    short_name: 'Chitie Panel',
    description: 'Administra tus eventos y tarjetas de Chitie.',
    lang: 'es-MX',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#2563EB',
    icons: [
      { src: '/icons/panel-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/panel-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
