export default function DmcaPage() {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '720px', margin: '60px auto', padding: '0 24px 80px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Política DMCA</h1>
      <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '40px' }}>CiTie — Última actualización: junio 2026</p>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '17px', marginBottom: '8px' }}>Aviso de infracción de derechos de autor</h2>
        <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.7' }}>CiTie respeta los derechos de propiedad intelectual y espera que sus usuarios hagan lo mismo. Conforme a la Digital Millennium Copyright Act (DMCA) y legislación aplicable, responderemos a notificaciones de presunta infracción de derechos de autor.</p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '17px', marginBottom: '8px' }}>Cómo presentar una reclamación</h2>
        <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.7' }}>Si crees que tu trabajo protegido por derechos de autor ha sido publicado en CiTie sin autorización, envía una notificación a <a href="mailto:privacidad@citieapp.com" style={{ color: '#2563EB' }}>privacidad@citieapp.com</a> con la siguiente información:</p>
        <ul style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.9', paddingLeft: '20px', marginTop: '12px' }}>
          <li>Tu nombre completo y datos de contacto</li>
          <li>Descripción del contenido protegido que fue infringido</li>
          <li>URL o descripción del lugar donde se encuentra el contenido en CiTie</li>
          <li>Declaración de que tienes la certeza de que el uso no está autorizado</li>
          <li>Declaración de que la información es exacta y bajo pena de perjurio</li>
          <li>Tu firma física o electrónica</li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '17px', marginBottom: '8px' }}>Proceso de respuesta</h2>
        <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.7' }}>Al recibir una notificación válida, CiTie eliminará o deshabilitará el acceso al contenido presuntamente infractor en un plazo de 72 horas hábiles y notificará al usuario que publicó dicho contenido.</p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '17px', marginBottom: '8px' }}>Contra-notificación</h2>
        <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.7' }}>Si crees que tu contenido fue eliminado por error, puedes enviar una contra-notificación al mismo correo con tu información de contacto, descripción del contenido eliminado y declaración bajo pena de perjurio de que fue eliminado por error.</p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '17px', marginBottom: '8px' }}>Política de reincidencia</h2>
        <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.7' }}>CiTie cancelará las cuentas de usuarios que sean reincidentes en la infracción de derechos de autor.</p>
      </section>
    </main>
  )
}