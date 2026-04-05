export default function PrivacyPage() {
  const h2s = { fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: '#c9a84c', margin: '40px 0 12px' } as const;
  const h3s = { fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '24px 0 8px' } as const;
  const ps = { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: '0 0 16px' } as const;
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ background: 'radial-gradient(ellipse at 30% 20%, #0f2035, #081020 50%, #050c18)', minHeight: '100vh', padding: '32px 24px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300, color: '#fff', letterSpacing: '8px' }}>VOXIRA</div>
            <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>← Volver</a>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#fff', margin: '0 0 8px' }}>
            Politica de <span style={{ color: '#c9a84c', fontWeight: 400 }}>Privacidad</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginBottom: '40px' }}>Ultima actualizacion: 1 de abril de 2026</p>

          <h2 style={h2s}>1. Informacion que Recopilamos</h2>
          <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Informacion de cuenta:</strong> Nombre, correo electronico y foto de perfil proporcionados por Google OAuth al registrarse.</p>
          <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Datos de voz:</strong> Muestras de audio grabadas por usted para el proceso de clonacion de voz. Estas se almacenan de forma segura en Supabase Storage.</p>
          <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Datos de uso:</strong> Intenciones, frecuencias seleccionadas, duracion de sesiones, progreso en ciclos, puntuaciones emocionales y estadisticas de escucha.</p>
          <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Datos tecnicos:</strong> Direccion IP, tipo de navegador, dispositivo y datos de cookies necesarias para el funcionamiento del servicio.</p>

          <h2 style={h2s}>2. Como Usamos su Informacion</h2>
          <p style={ps}>Utilizamos su informacion para: proporcionar y personalizar el servicio de VOXIRA; generar audio con su voz clonada; rastrear su progreso y estadisticas; mejorar nuestros algoritmos y experiencia de usuario; comunicarnos con usted sobre su cuenta; y cumplir con obligaciones legales.</p>

          <h2 style={h2s}>3. Almacenamiento de Datos de Voz</h2>
          <p style={ps}>Su muestra de voz original se almacena de forma segura en Supabase Storage (infraestructura AWS). Los clones de voz temporales creados en ElevenLabs para la generacion de audio se eliminan automaticamente inmediatamente despues de cada sesion de generacion. VOXIRA nunca retiene clones de voz activos en servicios de terceros.</p>

          <h2 style={h2s}>4. Servicios de Terceros</h2>
          <p style={ps}>VOXIRA utiliza los siguientes servicios de terceros que pueden procesar datos:</p>
          <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Supabase:</strong> Base de datos, autenticacion y almacenamiento de archivos (PostgreSQL + Storage).</p>
          <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>ElevenLabs:</strong> Clonacion de voz y sintesis de texto a voz (procesamiento temporal, datos eliminados tras uso).</p>
          <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>OpenAI:</strong> Generacion de afirmaciones personalizadas con GPT-4o-mini.</p>
          <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Vercel:</strong> Hospedaje de la aplicacion web y funciones serverless.</p>
          <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Google:</strong> Autenticacion OAuth para inicio de sesion.</p>

          <h2 style={h2s}>5. Compartir Informacion</h2>
          <p style={ps}>No vendemos, alquilamos ni compartimos su informacion personal con terceros para fines de marketing. Solo compartimos datos con los proveedores de servicios mencionados arriba, estrictamente necesarios para el funcionamiento del servicio, o cuando sea requerido por ley.</p>

          <h2 style={h2s}>6. Seguridad</h2>
          <p style={ps}>Implementamos medidas de seguridad tecnicas y organizativas para proteger su informacion, incluyendo: cifrado en transito (HTTPS/TLS), Row Level Security (RLS) en base de datos, autenticacion segura con tokens JWT, y eliminacion automatica de clones de voz temporales.</p>

          <h2 style={h2s}>7. Retencion de Datos</h2>
          <p style={ps}>Retenemos su informacion mientras su cuenta este activa. Al eliminar su cuenta, eliminaremos sus datos personales, muestras de voz, tracks generados y datos de progreso dentro de 30 dias. Algunos datos anonimizados pueden retenerse para fines estadisticos.</p>

          <h2 style={h2s}>8. Sus Derechos</h2>
          <p style={ps}>Usted tiene derecho a: acceder a sus datos personales; rectificar datos inexactos; eliminar su cuenta y datos; exportar sus datos; retirar su consentimiento en cualquier momento; y presentar una queja ante la autoridad de proteccion de datos correspondiente.</p>

          <h2 style={h2s}>9. Cookies</h2>
          <p style={ps}>VOXIRA utiliza cookies esenciales para la autenticacion y funcionamiento del servicio. Tambien utilizamos localStorage para preferencias de idioma. No utilizamos cookies de rastreo de terceros ni cookies publicitarias.</p>

          <h2 style={h2s}>10. Menores de Edad</h2>
          <p style={ps}>VOXIRA no esta dirigido a menores de 13 anos. No recopilamos conscientemente informacion de menores de 13 anos. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.</p>

          <h2 style={h2s}>11. Cambios a esta Politica</h2>
          <p style={ps}>Podemos actualizar esta politica periodicamente. Le notificaremos sobre cambios significativos por correo electronico o mediante un aviso en la aplicacion. El uso continuado del servicio despues de los cambios constituye su aceptacion.</p>

          {/* LFPDPPP Section */}
          <div style={{ marginTop: '56px', padding: '28px', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '16px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: '#c9a84c', margin: '0 0 20px' }}>Aviso de Privacidad Integral (LFPDPPP)</h2>
            <p style={ps}>En cumplimiento con la Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares (LFPDPPP) de Mexico, le informamos lo siguiente:</p>

            <h3 style={h3s}>Identidad del Responsable</h3>
            <p style={ps}>VOXIRA, con domicilio en Ciudad de Mexico, Mexico, es responsable del tratamiento de sus datos personales. Correo de contacto: <a href="mailto:contacto@voxira.app" style={{ color: '#c9a84c', textDecoration: 'none' }}>contacto@voxira.app</a></p>

            <h3 style={h3s}>Datos Personales Recabados</h3>
            <p style={ps}>Recabamos los siguientes datos personales: nombre completo, correo electronico, fotografia de perfil (via Google), muestras de voz, datos de uso del servicio (intenciones, frecuencias, progreso) y datos de navegacion.</p>

            <h3 style={h3s}>Datos Personales Sensibles</h3>
            <p style={ps}>Las muestras de voz y los datos de bienestar emocional (puntuaciones emocionales en ciclos) se consideran datos sensibles. Estos datos son tratados con medidas de seguridad reforzadas y solo se utilizan para la prestacion directa del servicio.</p>

            <h3 style={h3s}>Finalidades del Tratamiento</h3>
            <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Finalidades primarias:</strong> Crear y gestionar su cuenta; clonar su voz para generar audio personalizado; generar afirmaciones con IA; procesar audio con frecuencias Solfeggio; rastrear su progreso en ciclos de 21 dias.</p>
            <p style={ps}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Finalidades secundarias:</strong> Mejorar el servicio mediante analisis anonimizados; enviar comunicaciones sobre actualizaciones del servicio; generar estadisticas agregadas.</p>

            <h3 style={h3s}>Transferencias de Datos</h3>
            <p style={ps}>Sus datos pueden ser transferidos a: Supabase (almacenamiento, EE.UU.), ElevenLabs (procesamiento de voz temporal, EE.UU.), OpenAI (generacion de texto, EE.UU.), Vercel (hospedaje, EE.UU.), Google (autenticacion, EE.UU.). Todas las transferencias se realizan con medidas de seguridad adecuadas.</p>

            <h3 style={h3s}>Derechos ARCO</h3>
            <p style={ps}>Usted tiene derecho al Acceso, Rectificacion, Cancelacion y Oposicion (ARCO) de sus datos personales. Para ejercer estos derechos, envie una solicitud a <a href="mailto:contacto@voxira.app" style={{ color: '#c9a84c', textDecoration: 'none' }}>contacto@voxira.app</a> con: su nombre completo, correo electronico asociado a su cuenta, descripcion de los datos y derecho que desea ejercer, y cualquier documento que acredite su identidad.</p>
            <p style={ps}>Responderemos a su solicitud en un plazo maximo de 20 dias habiles conforme a la LFPDPPP.</p>

            <h3 style={h3s}>Revocacion del Consentimiento</h3>
            <p style={ps}>Usted puede revocar su consentimiento para el tratamiento de sus datos en cualquier momento eliminando su cuenta desde la pagina de Configuracion, o enviando una solicitud a nuestro correo de contacto.</p>

            <h3 style={h3s}>Uso de Cookies</h3>
            <p style={ps}>Utilizamos cookies esenciales para la autenticacion (Supabase Auth) y preferencias de usuario (idioma). No utilizamos cookies con fines publicitarios.</p>

            <h3 style={h3s}>Consentimiento</h3>
            <p style={ps}>Al registrarse y utilizar VOXIRA, usted otorga su consentimiento expreso para el tratamiento de sus datos personales, incluyendo datos sensibles (voz y bienestar emocional), conforme a lo descrito en este aviso de privacidad.</p>
          </div>

          <h2 style={h2s}>12. Contacto</h2>
          <p style={ps}>Para preguntas sobre esta politica o para ejercer sus derechos, contactenos en: <a href="mailto:contacto@voxira.app" style={{ color: '#c9a84c', textDecoration: 'none' }}>contacto@voxira.app</a></p>

          <footer style={{ textAlign: 'center', marginTop: '64px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.12)', letterSpacing: '2px' }}>© 2026 VOXIRA. Todos los derechos reservados.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
