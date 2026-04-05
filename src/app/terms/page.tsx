export default function TermsPage() {
  const h2s = { fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: '#c9a84c', margin: '40px 0 12px' } as const;
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
            Terminos de <span style={{ color: '#c9a84c', fontWeight: 400 }}>Servicio</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginBottom: '40px' }}>Ultima actualizacion: 1 de abril de 2026</p>

          <h2 style={h2s}>1. Aceptacion de los Terminos</h2>
          <p style={ps}>Al acceder o utilizar VOXIRA, usted acepta estar vinculado por estos Terminos de Servicio. Si no esta de acuerdo con alguna parte de estos terminos, no debe utilizar nuestro servicio. Nos reservamos el derecho de modificar estos terminos en cualquier momento. El uso continuado del servicio despues de cualquier modificacion constituye la aceptacion de los nuevos terminos.</p>

          <h2 style={h2s}>2. Descripcion del Servicio</h2>
          <p style={ps}>VOXIRA es una plataforma de reprogramacion mental que utiliza inteligencia artificial para clonar la voz del usuario, generar afirmaciones personalizadas y combinarlas con frecuencias Solfeggio y beats binaurales. El servicio incluye generacion de tracks de audio, ciclos de 21 dias, biblioteca de sesiones y estadisticas de progreso.</p>

          <h2 style={h2s}>3. Privacidad</h2>
          <p style={ps}>Su privacidad es importante para nosotros. Consulte nuestra <a href="/privacy" style={{ color: '#c9a84c', textDecoration: 'none' }}>Politica de Privacidad</a> para comprender como recopilamos, utilizamos y protegemos su informacion personal, incluyendo datos de voz.</p>

          <h2 style={h2s}>4. Registro y Cuenta</h2>
          <p style={ps}>Para utilizar VOXIRA necesita crear una cuenta mediante autenticacion con Google OAuth. Usted es responsable de mantener la seguridad de su cuenta y de todas las actividades realizadas bajo ella. Debe notificarnos inmediatamente sobre cualquier uso no autorizado.</p>

          <h2 style={h2s}>5. Modelo de Voz</h2>
          <p style={ps}>Al grabar su voz en VOXIRA, usted otorga a VOXIRA una licencia limitada para procesar su muestra de voz con el unico proposito de generar contenido de audio personalizado. Su muestra de voz se almacena en servidores seguros de Supabase. Los clones de voz temporales creados en ElevenLabs se eliminan automaticamente despues de cada generacion de audio. VOXIRA no vende, comparte ni utiliza su voz para ningun otro proposito.</p>

          <h2 style={h2s}>6. Contenido y Propiedad Intelectual</h2>
          <p style={ps}>El contenido de audio generado por VOXIRA utilizando su voz le pertenece a usted. VOXIRA retiene los derechos sobre la plataforma, tecnologia, diseno, marca y todo el software subyacente. Las afirmaciones son generadas por IA y no constituyen consejo medico, psicologico ni terapeutico.</p>

          <h2 style={h2s}>7. Planes y Tarifas</h2>
          <p style={ps}>VOXIRA ofrece un plan gratuito con funcionalidades limitadas y planes de pago (Pro y Premium) con caracteristicas adicionales. Los precios pueden cambiar con aviso previo. Las suscripciones se renuevan automaticamente a menos que se cancelen antes del periodo de renovacion. No se ofrecen reembolsos por periodos parciales.</p>

          <h2 style={h2s}>8. Conducta del Usuario</h2>
          <p style={ps}>Usted se compromete a no utilizar VOXIRA para: generar contenido ilegal, danino o fraudulento; clonar la voz de terceros sin su consentimiento; intentar acceder a sistemas o datos no autorizados; interferir con el funcionamiento del servicio; o violar cualquier ley aplicable.</p>

          <h2 style={h2s}>9. Exencion de Garantias</h2>
          <p style={ps}>VOXIRA se proporciona &ldquo;tal cual&rdquo; y &ldquo;segun disponibilidad&rdquo;. No garantizamos que el servicio sera ininterrumpido, seguro o libre de errores. Los resultados de la reprogramacion mental varian segun cada individuo. VOXIRA no es un sustituto de tratamiento medico o psicologico profesional.</p>

          <h2 style={h2s}>10. Limitacion de Responsabilidad</h2>
          <p style={ps}>En ningún caso VOXIRA, sus directores, empleados o afiliados seran responsables por danos indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de uso del servicio, incluyendo pero no limitado a perdida de datos, perdida de beneficios o interrupcion del negocio.</p>

          <h2 style={h2s}>11. Indemnizacion</h2>
          <p style={ps}>Usted acepta indemnizar y mantener indemne a VOXIRA de cualquier reclamacion, dano, perdida o gasto (incluyendo honorarios legales) derivados de su uso del servicio, su violacion de estos terminos, o su violacion de cualquier derecho de terceros.</p>

          <h2 style={h2s}>12. Resolucion de Disputas</h2>
          <p style={ps}>Cualquier disputa relacionada con estos terminos se resolvera primero mediante negociacion directa. Si no se alcanza un acuerdo en 30 dias, las partes podran recurrir a mediacion o arbitraje conforme a las leyes aplicables.</p>

          <h2 style={h2s}>13. Terminacion</h2>
          <p style={ps}>VOXIRA puede suspender o terminar su acceso al servicio en cualquier momento, con o sin causa, con o sin aviso previo. Usted puede cancelar su cuenta en cualquier momento desde la pagina de configuracion. Tras la terminacion, sus datos seran eliminados conforme a nuestra Politica de Privacidad.</p>

          <h2 style={h2s}>14. Ley Aplicable</h2>
          <p style={ps}>Estos terminos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier procedimiento legal se llevara a cabo en los tribunales competentes de la Ciudad de Mexico, Mexico.</p>

          <h2 style={h2s}>15. Disposiciones Generales</h2>
          <p style={ps}>Si alguna disposicion de estos terminos se considera invalida o inaplicable, las demas disposiciones permaneceran en pleno vigor. La falta de ejercicio de cualquier derecho no constituye una renuncia al mismo. Estos terminos constituyen el acuerdo completo entre usted y VOXIRA.</p>

          <h2 style={h2s}>16. Contacto</h2>
          <p style={ps}>Para preguntas sobre estos terminos, contactenos en: <a href="mailto:contacto@voxira.app" style={{ color: '#c9a84c', textDecoration: 'none' }}>contacto@voxira.app</a></p>

          <footer style={{ textAlign: 'center', marginTop: '64px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.12)', letterSpacing: '2px' }}>© 2026 VOXIRA. Todos los derechos reservados.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
