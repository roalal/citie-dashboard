export default function DeleteAccountPage() {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Eliminar cuenta — CiTie</h1>
      <p style={{ color: '#6B7280', marginBottom: '32px' }}>Última actualización: junio 2026</p>

      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>¿Cómo eliminar tu cuenta?</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
        Para solicitar la eliminación de tu cuenta y todos los datos asociados, envía un correo electrónico a:
      </p>
      <p style={{ marginBottom: '24px' }}>
        <a href="mailto:privacidad@citieapp.com" style={{ color: '#2563EB' }}>privacidad@citieapp.com</a>
      </p>

      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>¿Qué datos se eliminan?</h2>
      <ul style={{ lineHeight: '1.8', paddingLeft: '20px', marginBottom: '24px' }}>
        <li>Tu perfil y credenciales de acceso</li>
        <li>Tu historial de tarjetas guardadas</li>
        <li>El identificador único de tu dispositivo</li>
      </ul>

      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Tiempo de procesamiento</h2>
      <p style={{ lineHeight: '1.6' }}>
        Tu solicitud será procesada en un plazo máximo de 30 días. Recibirás una confirmación por correo electrónico cuando se complete la eliminación.
      </p>
    </main>
  )
}