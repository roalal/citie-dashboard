export default function DeleteAccountPage() {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Eliminar cuenta — Chitie</h1>
      <p style={{ color: '#6B7280', marginBottom: '32px' }}>Última actualización: junio 2026</p>

      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>¿Cómo eliminar tu cuenta?</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
        Desde la app: abre <strong>Mi cuenta</strong> (ícono de perfil) y toca <strong>Eliminar cuenta</strong>. La eliminación es inmediata.
      </p>
      <p style={{ marginBottom: '24px', lineHeight: '1.6' }}>
        Si no puedes acceder a la app, también puedes solicitarlo por correo electrónico a{' '}
        <a href="mailto:privacidad@chitie.app" style={{ color: '#2563EB' }}>privacidad@chitie.app</a>.
      </p>

      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>¿Qué datos se eliminan?</h2>
      <ul style={{ lineHeight: '1.8', paddingLeft: '20px', marginBottom: '24px' }}>
        <li>Tu perfil y credenciales de acceso</li>
        <li>Tu historial de tarjetas guardadas</li>
        <li>El identificador único de tu dispositivo</li>
      </ul>

      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Tiempo de procesamiento</h2>
      <p style={{ lineHeight: '1.6' }}>
        La eliminación desde la app es inmediata. Las solicitudes por correo se procesan en un plazo máximo de 30 días, con confirmación por correo electrónico.
      </p>
    </main>
  )
}