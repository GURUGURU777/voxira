export default function PrivacyPage() {
  const h2 = { fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: '#c9a84c', margin: '44px 0 12px' } as const;
  const h3 = { fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '24px 0 8px' } as const;
  const p = { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: '0 0 14px' } as const;
  const b = { color: 'rgba(255,255,255,0.7)' } as const;
  const li = { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '6px' } as const;
  const link = { color: '#c9a84c', textDecoration: 'none' } as const;
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ background: '#0b1121', minHeight: '100vh', padding: '32px 24px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300, color: '#fff', letterSpacing: '8px' }}>AFIRMIA</div>
            <a href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>← Volver</a>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#fff', margin: '0 0 8px' }}>
            Politica de <span style={{ color: '#c9a84c', fontWeight: 400 }}>Privacidad</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginBottom: '40px' }}>Ultima actualizacion: 1 de abril de 2026</p>

          {/* ═══════════════════════════════════════════ */}
          {/* PARTE 1 — AVISO DE PRIVACIDAD              */}
          {/* ═══════════════════════════════════════════ */}

          <div style={{ fontSize: '10px', color: 'rgba(201,168,76,0.5)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Parte 1</div>
          <h2 style={{ ...h2, margin: '0 0 24px', fontSize: '26px' }}>Aviso de Privacidad</h2>

          {/* 1 */}
          <h2 style={h2}>1. Informacion que Recopilamos</h2>
          <p style={p}><strong style={b}>Datos de contacto y cuenta:</strong> Nombre completo, correo electronico y fotografia de perfil proporcionados por Google OAuth al registrarse.</p>
          <p style={p}><strong style={b}>Datos biometricos de voz:</strong> Muestras de audio grabadas por usted para el proceso de clonacion de voz. Estas constituyen datos biometricos sensibles y se tratan con medidas de seguridad reforzadas.</p>
          <p style={p}><strong style={b}>Datos de uso:</strong> Intenciones ingresadas, frecuencias seleccionadas, duracion de sesiones, progreso en ciclos de 21 dias, puntuaciones emocionales diarias, estadisticas de escucha y preferencias de onboarding (objetivo, experiencia, minutos diarios).</p>
          <p style={p}><strong style={b}>Datos de dispositivo:</strong> Direccion IP, tipo de navegador, sistema operativo, tipo de dispositivo y datos de cookies esenciales para el funcionamiento del servicio.</p>

          {/* 2 */}
          <h2 style={h2}>2. Como Usamos su Informacion</h2>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Proporcionar el Servicio:</strong> Crear su cuenta, clonar su voz, generar afirmaciones personalizadas, procesar audio con frecuencias, gestionar ciclos de 21 dias y mostrar estadisticas.</li>
            <li style={li}><strong style={b}>Comunicarnos:</strong> Enviar notificaciones sobre su cuenta, cambios en el servicio y recordatorios de sesiones.</li>
            <li style={li}><strong style={b}>Marketing:</strong> Con su consentimiento, enviar informacion sobre nuevas funciones y promociones. Puede optar por no recibirlo en cualquier momento.</li>
            <li style={li}><strong style={b}>Seguridad:</strong> Detectar, prevenir y responder a fraude, abuso o amenazas de seguridad.</li>
            <li style={li}><strong style={b}>Cumplimiento legal:</strong> Cumplir con obligaciones legales y regulatorias aplicables.</li>
            <li style={li}><strong style={b}>Mejorar el Servicio:</strong> Analizar datos anonimizados para mejorar algoritmos, experiencia de usuario y rendimiento.</li>
          </ul>

          {/* 3 */}
          <h2 style={h2}>3. Datos Biometricos</h2>
          <div style={{ background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '12px', padding: '20px', margin: '0 0 14px' }}>
            <p style={p}>Las grabaciones de voz que usted proporciona constituyen <strong style={b}>datos biometricos sensibles</strong>. Tratamos estos datos con las siguientes medidas especificas:</p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
              <li style={li}><strong style={b}>Almacenamiento cifrado:</strong> Su muestra de voz se almacena en Supabase Storage con cifrado en reposo y en transito.</li>
              <li style={li}><strong style={b}>Eliminacion temporal en ElevenLabs:</strong> Los clones de voz creados para generacion de audio se eliminan automaticamente inmediatamente despues de cada uso. No se mantienen clones activos.</li>
              <li style={li}><strong style={b}>Acceso restringido:</strong> Solo usted puede acceder a su muestra de voz a traves de su cuenta autenticada.</li>
              <li style={li}><strong style={b}>Retencion maxima:</strong> Las muestras de voz se retienen mientras su cuenta este activa, con un maximo de 3 anos. Despues de este periodo o al eliminar su cuenta, se borran permanentemente.</li>
              <li style={li}><strong style={b}>Consentimiento explicito:</strong> Al grabar su voz, usted otorga consentimiento expreso para el procesamiento de estos datos biometricos.</li>
            </ul>
          </div>

          {/* 4 */}
          <h2 style={h2}>4. Cookies</h2>
          <p style={p}>AFIRMIA utiliza exclusivamente <strong style={b}>cookies esenciales</strong> para:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}>Autenticacion de sesion (Supabase Auth / tokens JWT).</li>
            <li style={li}>Preferencias de idioma (localStorage, no cookies de terceros).</li>
          </ul>
          <p style={p}><strong style={b}>NO utilizamos</strong> cookies publicitarias, de rastreo, de redes sociales ni de analitica de terceros. No participamos en redes de publicidad programatica.</p>

          {/* 5 */}
          <h2 style={h2}>5. Como Compartimos su Informacion</h2>
          <p style={p}><strong style={{ color: '#22c55e' }}>NO vendemos, alquilamos ni comercializamos sus datos personales.</strong></p>
          <p style={p}>Compartimos datos exclusivamente con los siguientes proveedores de servicio, estrictamente necesarios para el funcionamiento de AFIRMIA:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Supabase</strong> (EE.UU.) — Base de datos, autenticacion y almacenamiento de archivos.</li>
            <li style={li}><strong style={b}>Google</strong> (EE.UU.) — Autenticacion OAuth para inicio de sesion.</li>
            <li style={li}><strong style={b}>ElevenLabs</strong> (EE.UU.) — Clonacion de voz y sintesis de texto a voz (procesamiento temporal, datos eliminados tras uso).</li>
            <li style={li}><strong style={b}>OpenAI</strong> (EE.UU.) — Generacion de afirmaciones personalizadas e intenciones para ciclos.</li>
            <li style={li}><strong style={b}>Vercel</strong> (EE.UU.) — Hospedaje de la aplicacion web y funciones serverless.</li>
            <li style={li}><strong style={b}>Railway</strong> (EE.UU.) — Procesamiento de audio con FFmpeg (frecuencias y beats binaurales).</li>
            <li style={li}><strong style={b}>Stripe</strong> (EE.UU.) — Procesamiento seguro de pagos (cuando aplique).</li>
          </ul>

          {/* 6 */}
          <h2 style={h2}>6. Almacenamiento y Seguridad</h2>
          <p style={p}>Sus datos se almacenan en servidores ubicados en Estados Unidos a traves de nuestros proveedores de infraestructura. Implementamos las siguientes medidas de seguridad:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}>Cifrado en transito mediante HTTPS/TLS en todas las comunicaciones.</li>
            <li style={li}>Row Level Security (RLS) en Supabase para que cada usuario solo acceda a sus propios datos.</li>
            <li style={li}>Autenticacion segura con tokens JWT y OAuth 2.0.</li>
            <li style={li}>Eliminacion automatica de clones de voz temporales.</li>
            <li style={li}>Variables de entorno cifradas para claves de API.</li>
          </ul>

          {/* 7 */}
          <h2 style={h2}>7. Retencion de Datos</h2>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Datos de cuenta:</strong> Mientras su cuenta este activa. Al eliminar su cuenta, se borran dentro de 30 dias.</li>
            <li style={li}><strong style={b}>Datos biometricos (voz):</strong> Mientras su cuenta este activa, con un maximo de 3 anos de retencion.</li>
            <li style={li}><strong style={b}>Tracks generados:</strong> Mientras su cuenta este activa. Se eliminan al cerrar la cuenta.</li>
            <li style={li}><strong style={b}>Datos anonimizados:</strong> Pueden retenerse indefinidamente para fines estadisticos y de mejora del servicio.</li>
          </ul>

          {/* 8 */}
          <h2 style={h2}>8. Sus Derechos</h2>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Opt-out de marketing:</strong> Puede desactivar comunicaciones de marketing en cualquier momento.</li>
            <li style={li}><strong style={b}>Cambiar informacion:</strong> Puede actualizar su perfil desde la pagina de Configuracion.</li>
            <li style={li}><strong style={b}>Solicitar eliminacion:</strong> Puede eliminar su cuenta y todos sus datos desde Configuracion o contactandonos directamente.</li>
            <li style={li}><strong style={b}>Exportar datos:</strong> Puede solicitar una copia de sus datos personales.</li>
          </ul>

          {/* 9 */}
          <h2 style={h2}>9. Pagos</h2>
          <p style={p}>Los pagos de suscripcion son procesados por <strong style={b}>Stripe</strong>. AFIRMIA no almacena, procesa ni tiene acceso a datos de tarjetas de credito o debito. Toda la informacion financiera es gestionada directamente por Stripe conforme a sus propias politicas de privacidad y el estandar PCI DSS.</p>

          {/* 10 */}
          <h2 style={h2}>10. Menores de Edad</h2>
          <p style={p}>AFIRMIA esta dirigido exclusivamente a personas mayores de 18 anos. No recopilamos conscientemente informacion de menores de edad. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente y cerraremos la cuenta asociada.</p>

          {/* 11 */}
          <h2 style={h2}>11. Cambios a este Aviso</h2>
          <p style={p}>Podemos actualizar esta Politica de Privacidad periodicamente. Le notificaremos sobre cambios significativos por correo electronico o mediante un aviso dentro de la aplicacion al menos 15 dias antes de su entrada en vigor. El uso continuado del Servicio despues de la fecha efectiva de los cambios constituye su aceptacion.</p>

          {/* 12 */}
          <h2 style={h2}>12. Contacto</h2>
          <p style={p}>Para preguntas sobre privacidad o para ejercer sus derechos:<br/>Email: <a href="mailto:contacto@afirmia.app" style={link}>contacto@afirmia.app</a><br/>AFIRMIA · Tepic, Nayarit, Mexico</p>

          {/* ═══════════════════════════════════════════════════ */}
          {/* PARTE 2 — AVISO DE PRIVACIDAD INTEGRAL (LFPDPPP)  */}
          {/* ═══════════════════════════════════════════════════ */}

          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)', margin: '56px 0' }} />

          <div style={{ fontSize: '10px', color: 'rgba(201,168,76,0.5)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Parte 2</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: '#c9a84c', margin: '0 0 8px' }}>Aviso de Privacidad Integral</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '32px' }}>Conforme a la Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares (LFPDPPP) de Mexico</p>

          {/* I.1 */}
          <h2 style={h2}>I. Identidad del Responsable</h2>
          <p style={p}>AFIRMIA, con domicilio en Tepic, Nayarit, Mexico, es responsable del tratamiento de sus datos personales. Para cualquier asunto relacionado con el tratamiento de sus datos, puede contactarnos en: <a href="mailto:contacto@afirmia.app" style={link}>contacto@afirmia.app</a></p>

          {/* I.2 */}
          <h2 style={h2}>II. Datos Personales Recabados</h2>
          <h3 style={h3}>Datos de identificacion:</h3>
          <p style={p}>Nombre completo, correo electronico, fotografia de perfil (proporcionados por Google OAuth).</p>
          <h3 style={h3}>Datos biometricos sensibles:</h3>
          <p style={p}>Muestras de grabacion de voz utilizadas para clonacion mediante inteligencia artificial. Estos datos se consideran sensibles conforme al articulo 3, fraccion VI de la LFPDPPP.</p>
          <h3 style={h3}>Datos de uso del servicio:</h3>
          <p style={p}>Intenciones de reprogramacion, frecuencias seleccionadas, duracion de sesiones, progreso en ciclos, puntuaciones emocionales diarias, estadisticas de escucha.</p>
          <h3 style={h3}>Datos de onboarding:</h3>
          <p style={p}>Objetivo principal, experiencia con meditacion, minutos diarios preferidos.</p>
          <h3 style={h3}>Datos de dispositivo:</h3>
          <p style={p}>Direccion IP, tipo de navegador, sistema operativo, datos de cookies esenciales.</p>

          {/* I.3 */}
          <h2 style={h2}>III. Finalidades del Tratamiento</h2>
          <h3 style={h3}>Finalidades primarias (necesarias):</h3>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}>Crear y gestionar su cuenta de usuario.</li>
            <li style={li}>Clonar su voz para generar audio personalizado.</li>
            <li style={li}>Generar afirmaciones con inteligencia artificial basadas en sus intenciones.</li>
            <li style={li}>Procesar audio con frecuencias Solfeggio y beats binaurales.</li>
            <li style={li}>Gestionar ciclos de 21 dias con seguimiento de progreso y emociones.</li>
            <li style={li}>Procesar pagos de suscripcion (cuando aplique).</li>
            <li style={li}>Proporcionar soporte tecnico y atencion al usuario.</li>
          </ul>
          <h3 style={h3}>Finalidades secundarias (no necesarias):</h3>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}>Enviar comunicaciones de marketing sobre nuevas funciones y promociones.</li>
            <li style={li}>Realizar analisis estadisticos anonimizados para mejorar el servicio.</li>
            <li style={li}>Personalizar su experiencia basandose en sus preferencias y progreso.</li>
            <li style={li}>Entrenar y mejorar modelos de inteligencia artificial con datos anonimizados.</li>
          </ul>
          <p style={p}>Si desea oponerse al tratamiento de sus datos para finalidades secundarias, envie un correo a <a href="mailto:contacto@afirmia.app" style={link}>contacto@afirmia.app</a> con el asunto &ldquo;Opt-out finalidades secundarias&rdquo;.</p>

          {/* I.4 */}
          <h2 style={h2}>IV. Transferencias Internacionales</h2>
          <p style={p}>Conforme a los articulos 36 y 37 de la LFPDPPP, le informamos que sus datos personales pueden ser transferidos y tratados fuera de Mexico, especificamente a Estados Unidos, por los siguientes proveedores:</p>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', margin: '0 0 14px' }}>
            {[
              ['Supabase', 'Base de datos, autenticacion, almacenamiento'],
              ['Google', 'Autenticacion OAuth'],
              ['ElevenLabs', 'Clonacion de voz (temporal)'],
              ['OpenAI', 'Generacion de afirmaciones con IA'],
              ['Vercel', 'Hospedaje web y funciones serverless'],
              ['Railway', 'Procesamiento de audio'],
              ['Stripe', 'Procesamiento de pagos'],
            ].map(([name, desc]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{name}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{desc}</span>
              </div>
            ))}
          </div>
          <p style={p}>Al utilizar AFIRMIA, usted otorga su consentimiento expreso para estas transferencias internacionales, las cuales se realizan con medidas de seguridad adecuadas conforme a la normativa aplicable.</p>

          {/* I.5 */}
          <h2 style={h2}>V. Derechos ARCO</h2>
          <p style={p}>Conforme a la LFPDPPP, usted tiene derecho a:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Acceder</strong> a sus datos personales que obran en nuestro poder.</li>
            <li style={li}><strong style={b}>Rectificar</strong> sus datos cuando sean inexactos o incompletos.</li>
            <li style={li}><strong style={b}>Cancelar</strong> sus datos cuando considere que no se requieren para las finalidades descritas.</li>
            <li style={li}><strong style={b}>Oponerse</strong> al tratamiento de sus datos para finalidades especificas.</li>
          </ul>
          <h3 style={h3}>Procedimiento para ejercer derechos ARCO:</h3>
          <p style={p}>Envie una solicitud a <a href="mailto:contacto@afirmia.app" style={link}>contacto@afirmia.app</a> con la siguiente informacion:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}>Nombre completo del titular.</li>
            <li style={li}>Correo electronico asociado a su cuenta de AFIRMIA.</li>
            <li style={li}>Descripcion clara de los datos personales respecto de los cuales busca ejercer sus derechos.</li>
            <li style={li}>Derecho ARCO que desea ejercer y la razon.</li>
            <li style={li}>Copia de identificacion oficial vigente.</li>
          </ul>
          <p style={p}><strong style={b}>Plazo de respuesta:</strong> 20 dias habiles contados desde la recepcion de la solicitud completa, conforme al articulo 32 de la LFPDPPP.</p>

          {/* I.6 */}
          <h2 style={h2}>VI. Revocacion del Consentimiento</h2>
          <p style={p}>Usted puede revocar su consentimiento para el tratamiento de sus datos personales en cualquier momento mediante: eliminacion de su cuenta desde la pagina de Configuracion (revocacion total), o solicitud escrita a <a href="mailto:contacto@afirmia.app" style={link}>contacto@afirmia.app</a> especificando el alcance de la revocacion.</p>
          <p style={p}>Tenga en cuenta que la revocacion del consentimiento para finalidades primarias puede resultar en la imposibilidad de continuar proporcionando el Servicio.</p>

          {/* I.7 */}
          <h2 style={h2}>VII. Limitacion de Uso y Divulgacion</h2>
          <p style={p}>Si desea limitar el uso o divulgacion de sus datos personales, puede inscribirse en el Registro Publico para Evitar Publicidad (REPEP) de la Procuraduria Federal del Consumidor (PROFECO). Para mas informacion, visite <strong style={b}>www.profeco.gob.mx</strong> o consulte directamente con PROFECO.</p>

          {/* I.8 */}
          <h2 style={h2}>VIII. Cookies</h2>
          <p style={p}>Utilizamos unicamente cookies esenciales para la autenticacion (Supabase Auth / JWT) y preferencias de usuario almacenadas en localStorage (idioma). No utilizamos cookies con fines publicitarios, de rastreo ni de analitica de terceros.</p>

          {/* I.9 */}
          <h2 style={h2}>IX. Modificaciones al Aviso</h2>
          <p style={p}>AFIRMIA se reserva el derecho de modificar el presente Aviso de Privacidad en cualquier momento. Las modificaciones seran notificadas por correo electronico y/o mediante un aviso en la aplicacion al menos 15 dias antes de su entrada en vigor. La version vigente estara siempre disponible en <a href="/privacy" style={link}>afirmia.app/privacy</a>.</p>

          {/* I.10 */}
          <h2 style={h2}>X. Consentimiento</h2>
          <div style={{ background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '12px', padding: '20px', margin: '0 0 14px' }}>
            <p style={{ ...p, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Al registrarse y utilizar AFIRMIA, usted manifiesta que ha leido y comprendido este Aviso de Privacidad y otorga su <strong style={b}>consentimiento expreso</strong> para el tratamiento de sus datos personales, incluyendo <strong style={b}>datos personales sensibles</strong> (datos biometricos de voz y datos de bienestar emocional), conforme a lo descrito en el presente documento.</p>
          </div>

          <footer style={{ textAlign: 'center', marginTop: '64px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.12)', letterSpacing: '2px' }}>© 2026 AFIRMIA. Todos los derechos reservados. Tepic, Nayarit, Mexico.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
