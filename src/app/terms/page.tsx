export default function TermsPage() {
  const h2 = { fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: '#c9a84c', margin: '44px 0 12px' } as const;
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
            Terminos de <span style={{ color: '#c9a84c', fontWeight: 400 }}>Servicio</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginBottom: '40px' }}>Ultima actualizacion: 1 de abril de 2026</p>

          {/* 1 */}
          <h2 style={h2}>1. Aceptacion de los Terminos</h2>
          <p style={p}>Al acceder, registrarse o utilizar AFIRMIA (&ldquo;el Servicio&rdquo;), usted acepta quedar vinculado por estos Terminos de Servicio (&ldquo;Terminos&rdquo;). Si no esta de acuerdo con alguna parte de estos Terminos, no debe utilizar el Servicio.</p>
          <p style={p}>Nos reservamos el derecho de modificar estos Terminos en cualquier momento. Le notificaremos sobre cambios materiales por correo electronico o mediante un aviso dentro de la aplicacion. El uso continuado del Servicio despues de cualquier modificacion constituye su aceptacion de los nuevos Terminos.</p>

          {/* 2 */}
          <h2 style={h2}>2. Su Privacidad</h2>
          <p style={p}>Su privacidad es fundamental para nosotros. Consulte nuestra <a href="/privacy" style={link}>Politica de Privacidad y Aviso de Privacidad Integral</a> para comprender como recopilamos, utilizamos, almacenamos y protegemos su informacion personal, incluyendo sus datos biometricos de voz. La Politica de Privacidad forma parte integral de estos Terminos.</p>

          {/* 3 */}
          <h2 style={h2}>3. Descripcion del Servicio</h2>
          <p style={p}>AFIRMIA es una plataforma de reprogramacion mental que utiliza inteligencia artificial para:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Clonar su voz</strong> mediante tecnologia de IA (ElevenLabs) para generar audio personalizado con su propia voz.</li>
            <li style={li}><strong style={b}>Generar afirmaciones personalizadas</strong> con inteligencia artificial (OpenAI GPT-4o-mini) basadas en sus intenciones y objetivos.</li>
            <li style={li}><strong style={b}>Combinar su voz con frecuencias Solfeggio</strong> (396Hz, 417Hz, 432Hz, 528Hz, 639Hz, 741Hz, 852Hz, 963Hz) y beats binaurales (diferencia de 3Hz entre oidos) para sincronizacion cerebral.</li>
            <li style={li}><strong style={b}>Ofrecer ciclos de 21 dias</strong> con programas de reprogramacion en 3 fases (Aceptacion, Transformacion, Integracion) con seguimiento emocional diario.</li>
            <li style={li}><strong style={b}>Proporcionar estadisticas</strong> de progreso, rachas de escucha y evolucion emocional.</li>
          </ul>

          {/* 4 */}
          <h2 style={h2}>4. Modelo de Voz</h2>
          <p style={p}>Al grabar su voz en AFIRMIA:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Solo su propia voz:</strong> Usted declara y garantiza que la voz que graba es su propia voz. Queda estrictamente prohibido grabar o clonar la voz de terceros sin su consentimiento explicito por escrito.</li>
            <li style={li}><strong style={b}>Almacenamiento seguro:</strong> Su muestra de voz original se almacena de forma cifrada en Supabase Storage (infraestructura AWS) bajo su cuenta personal.</li>
            <li style={li}><strong style={b}>Eliminacion temporal:</strong> Los clones de voz creados en ElevenLabs son temporales y se eliminan automaticamente inmediatamente despues de cada generacion de audio. AFIRMIA no mantiene clones de voz activos en servicios de terceros.</li>
            <li style={li}><strong style={b}>Licencia limitada:</strong> Usted otorga a AFIRMIA una licencia limitada, no exclusiva y revocable para procesar su muestra de voz con el unico proposito de generar contenido de audio personalizado dentro del Servicio.</li>
          </ul>

          {/* 5 */}
          <h2 style={h2}>5. Registro y Cuenta</h2>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Edad minima:</strong> Debe tener al menos 18 anos para utilizar AFIRMIA.</li>
            <li style={li}><strong style={b}>Autenticacion:</strong> El registro se realiza exclusivamente mediante Google OAuth. AFIRMIA no almacena contrasenas.</li>
            <li style={li}><strong style={b}>Una cuenta por usuario:</strong> Cada persona puede tener una sola cuenta activa.</li>
            <li style={li}><strong style={b}>Responsabilidad:</strong> Usted es responsable de mantener la seguridad de su cuenta de Google y de todas las actividades realizadas bajo su cuenta de AFIRMIA.</li>
            <li style={li}><strong style={b}>Notificacion:</strong> Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.</li>
          </ul>

          {/* 6 */}
          <h2 style={h2}>6. Contenido y Propiedad Intelectual</h2>
          <p style={p}><strong style={b}>Su contenido:</strong> El audio generado por AFIRMIA utilizando su voz le pertenece a usted. En planes de pago (Pro y Premium), usted obtiene una licencia completa para uso personal y comercial. En el plan gratuito, el uso es exclusivamente personal y no comercial.</p>
          <p style={p}><strong style={b}>Propiedad de AFIRMIA:</strong> AFIRMIA retiene todos los derechos sobre la plataforma, tecnologia, algoritmos, diseno, marca, logotipos y todo el software subyacente. Las afirmaciones generadas por IA son creadas como herramienta de bienestar y no constituyen obra protegida independiente.</p>
          <p style={p}><strong style={b}>Licencia a AFIRMIA:</strong> Al utilizar el Servicio, usted otorga a AFIRMIA una licencia mundial, no exclusiva y libre de regalias para utilizar, reproducir y procesar su contenido (voz, intenciones) exclusivamente para proporcionar y mejorar el Servicio.</p>

          {/* 7 */}
          <h2 style={h2}>7. Planes y Tarifas</h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px', margin: '0 0 14px' }}>
            <p style={p}><strong style={b}>Free — $0 USD/mes:</strong> 5 tracks por mes, duracion maxima 5 minutos, sonidos sintetizados, 1 frecuencia por sesion.</p>
            <p style={p}><strong style={b}>Pro — $9.99 USD/mes:</strong> 20 tracks por mes, duracion hasta 15 minutos, sonidos ambientales premium, todas las frecuencias, ciclos de 21 dias.</p>
            <p style={p}><strong style={b}>Premium — $19.99 USD/mes:</strong> Tracks ilimitados, duracion hasta 60 minutos, todas las funciones Pro, soporte prioritario, acceso anticipado a nuevas funciones.</p>
            <p style={p}><strong style={b}>Descuento anual:</strong> 20% de descuento al elegir facturacion anual (Pro: $7.99/mes, Premium: $15.99/mes).</p>
          </div>
          <p style={p}><strong style={b}>Pagos:</strong> Procesados de forma segura a traves de Stripe. AFIRMIA no almacena datos de tarjeta de credito. Las suscripciones se renuevan automaticamente a menos que se cancelen antes del periodo de renovacion. No se ofrecen reembolsos por periodos parciales ya consumidos.</p>

          {/* 8 */}
          <h2 style={h2}>8. Conducta del Usuario</h2>
          <p style={p}>Usted se compromete a NO utilizar AFIRMIA para:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}>Clonar la voz de terceros sin su consentimiento explicito por escrito.</li>
            <li style={li}>Generar contenido ilegal, danino, amenazante, abusivo, difamatorio, obsceno o fraudulento.</li>
            <li style={li}>Suplantar la identidad de otra persona o entidad.</li>
            <li style={li}>Intentar acceder a sistemas, datos o cuentas no autorizados.</li>
            <li style={li}>Interferir con el funcionamiento del Servicio o sus servidores.</li>
            <li style={li}>Realizar ingenieria inversa, descompilar o desensamblar el software.</li>
            <li style={li}>Utilizar el Servicio para actividades ilegales bajo cualquier jurisdiccion aplicable.</li>
            <li style={li}>Revender, sublicenciar o redistribuir el acceso al Servicio sin autorizacion.</li>
          </ul>

          {/* 9 */}
          <h2 style={h2}>9. Aviso de Salud</h2>
          <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '12px', padding: '20px', margin: '0 0 14px' }}>
            <p style={{ ...p, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>AFIRMIA NO CONSTITUYE CONSEJO MEDICO, PSICOLOGICO NI TERAPEUTICO.</p>
            <p style={p}>El Servicio es una herramienta de bienestar personal y no sustituye el diagnostico, tratamiento o consejo de profesionales medicos o de salud mental. Si tiene condiciones de salud mental, consulte a un profesional antes de usar el Servicio.</p>
            <p style={p}><strong style={b}>Frecuencias binaurales:</strong> Los beats binaurales pueden no ser adecuados para personas con epilepsia, trastornos convulsivos o que utilicen marcapasos. Consulte a su medico si tiene alguna de estas condiciones. No utilice AFIRMIA mientras conduce o opera maquinaria pesada.</p>
            <p style={{ ...p, margin: 0 }}>Los resultados de la reprogramacion mental varian significativamente entre individuos. AFIRMIA no garantiza resultados especificos.</p>
          </div>

          {/* 10 */}
          <h2 style={h2}>10. Exencion de Garantias</h2>
          <p style={p}>EL SERVICIO SE PROPORCIONA &ldquo;TAL CUAL&rdquo; Y &ldquo;SEGUN DISPONIBILIDAD&rdquo;, SIN GARANTIAS DE NINGUN TIPO, YA SEAN EXPRESAS O IMPLICITAS. AFIRMIA NO GARANTIZA QUE EL SERVICIO SERA ININTERRUMPIDO, SEGURO, LIBRE DE ERRORES O QUE CUMPLIRA SUS EXPECTATIVAS ESPECIFICAS.</p>

          {/* 11 */}
          <h2 style={h2}>11. Limitacion de Responsabilidad</h2>
          <p style={p}>EN LA MAXIMA MEDIDA PERMITIDA POR LA LEY APLICABLE, EN NINGUN CASO AFIRMIA, SUS DIRECTORES, EMPLEADOS, SOCIOS O AFILIADOS SERAN RESPONSABLES POR DANOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS, INCLUYENDO PERO NO LIMITADO A PERDIDA DE DATOS, PERDIDA DE BENEFICIOS, DANO EMOCIONAL O INTERRUPCION DEL NEGOCIO.</p>
          <p style={p}>La responsabilidad total acumulada de AFIRMIA por cualquier reclamacion no excedera el mayor de: (a) el monto total pagado por usted a AFIRMIA durante los 6 meses anteriores al evento que dio origen a la reclamacion, o (b) $100 USD.</p>

          {/* 12 */}
          <h2 style={h2}>12. Indemnizacion</h2>
          <p style={p}>Usted acepta indemnizar, defender y mantener indemne a AFIRMIA y sus directores, empleados, agentes y afiliados de cualquier reclamacion, dano, perdida, responsabilidad o gasto (incluyendo honorarios legales razonables) que surjan de o esten relacionados con: su uso del Servicio, su violacion de estos Terminos, su violacion de cualquier derecho de terceros, o el contenido que usted genere o comparta a traves del Servicio.</p>

          {/* 13 */}
          <h2 style={h2}>13. Resolucion de Disputas</h2>
          <p style={p}>Cualquier disputa, controversia o reclamacion relacionada con estos Terminos o el Servicio se resolvera de la siguiente manera:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Negociacion directa:</strong> Las partes intentaran resolver la disputa de buena fe mediante negociacion directa durante 30 dias calendario.</li>
            <li style={li}><strong style={b}>Arbitraje vinculante:</strong> Si la negociacion no resulta exitosa, la disputa se sometera a arbitraje vinculante administrado conforme a las leyes de Mexico, con sede en Tepic, Nayarit.</li>
            <li style={li}><strong style={b}>Renuncia a accion colectiva:</strong> Usted acepta que cualquier reclamacion se presentara de forma individual y no como parte de una accion colectiva.</li>
          </ul>

          {/* 14 */}
          <h2 style={h2}>14. Terminacion</h2>
          <p style={p}>AFIRMIA puede suspender o terminar su acceso al Servicio en cualquier momento, con o sin causa, incluyendo por violacion de estos Terminos. Usted puede cancelar su cuenta en cualquier momento desde la pagina de Configuracion. Tras la terminacion: sus datos personales seran eliminados conforme a nuestra Politica de Privacidad; los tracks generados en su cuenta seran eliminados de nuestros servidores; y las suscripciones activas seran canceladas sin reembolso del periodo en curso.</p>

          {/* 15 */}
          <h2 style={h2}>15. Ley Aplicable y Jurisdiccion</h2>
          <p style={p}>Estos Terminos se rigen e interpretan de acuerdo con las leyes de los Estados Unidos Mexicanos. Para cualquier procedimiento legal derivado de estos Terminos, las partes se someten a la jurisdiccion exclusiva de los tribunales competentes de Tepic, Nayarit, Mexico, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razon de su domicilio presente o futuro.</p>

          {/* 16 */}
          <h2 style={h2}>16. Disposiciones Generales</h2>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li style={li}><strong style={b}>Acuerdo completo:</strong> Estos Terminos, junto con la Politica de Privacidad, constituyen el acuerdo completo entre usted y AFIRMIA.</li>
            <li style={li}><strong style={b}>Divisibilidad:</strong> Si alguna disposicion se considera invalida o inaplicable, las demas disposiciones permaneceran en pleno vigor.</li>
            <li style={li}><strong style={b}>Renuncia:</strong> La falta de ejercicio de cualquier derecho no constituye una renuncia al mismo.</li>
            <li style={li}><strong style={b}>Cesion:</strong> Usted no puede ceder ni transferir estos Terminos sin el consentimiento previo por escrito de AFIRMIA.</li>
            <li style={li}><strong style={b}>Fuerza mayor:</strong> AFIRMIA no sera responsable por retrasos o incumplimientos causados por eventos fuera de su control razonable.</li>
          </ul>

          {/* 17 */}
          <h2 style={h2}>17. Contacto</h2>
          <p style={p}>Para preguntas, comentarios o reclamaciones sobre estos Terminos de Servicio:</p>
          <p style={p}>Email: <a href="mailto:contacto@afirmia.app" style={link}>contacto@afirmia.app</a><br/>AFIRMIA · Tepic, Nayarit, Mexico</p>

          <footer style={{ textAlign: 'center', marginTop: '64px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.12)', letterSpacing: '2px' }}>© 2026 AFIRMIA. Todos los derechos reservados. Tepic, Nayarit, Mexico.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
