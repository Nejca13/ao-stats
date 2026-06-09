import Link from 'next/link'

export const metadata = {
  title: 'Términos y Condiciones · AO Stats',
  description: 'Términos y Condiciones de uso de AO Stats. Reglas, limitaciones de responsabilidad y condiciones de los planes premium.',
}

export default function TermsPage() {
  return (
    <article>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 32px' }}>
        Términos y Condiciones
      </h1>
      <p style={p}>Ultima actualizacion: 8 de junio de 2026</p>

      <Section title="1. Aceptacion de los terminos">
        Al acceder o utilizar AO Stats (en adelante, &laquo;la aplicacion&raquo;),
        usted acepta los presentes Terminos y Condiciones. Si no esta de acuerdo,
        no utilice la aplicacion. La aplicacion es operada por Nejca
        y esta sujeta a la legislacion de la Republica Argentina.
      </Section>

      <Section title="2. Descripcion del servicio">
        AO Stats es una plataforma que permite organizar torneos de fútbol virtual,
        registrar partidos, calcular estadisticas (ELO, ranking, MVPs) y
        gestionar grupos de jugadores. El servicio se ofrece en dos modalidades:
        <ul style={ul}>
          <li style={li}>
            <strong>Plan gratuito:</strong> funcionalidades basicas con
            limitaciones en la cantidad de asados y partidos.
          </li>
          <li style={li}>
            <strong>Planes premium:</strong> funcionalidades avanzadas sin
            limitaciones, mediante suscripcion mensual.
          </li>
        </ul>
      </Section>

      <Section title="3. Requisitos de uso">
        Para utilizar la aplicacion usted debe:
        <ul style={ul}>
          <li style={li}>Ser mayor de 13 anos.</li>
          <li style={li}>
            Tener una cuenta de Google valida para autenticacion.
          </li>
          <li style={li}>
            Contar con conexion a internet para la sincronizacion inicial y
            periodica.
          </li>
        </ul>
      </Section>

      <Section title="4. Registro y cuenta">
        El registro se realiza exclusivamente a traves de Google Sign-In. Usted
        es responsable de mantener la confidencialidad de su cuenta de Google.
        La aplicacion no almacena contraseñas; la autenticacion es delegada
        a Google.
      </Section>

      <Section title="5. Uso responsable">
        Usted se compromete a:
        <ul style={ul}>
          <li style={li}>
            No utilizar la aplicacion para fines ilegales o no autorizados.
          </li>
          <li style={li}>
            No introducir datos falsos, ofensivos o que violen derechos de
            terceros.
          </li>
          <li style={li}>
            No intentar acceder a datos de otros usuarios o vulnerar la
            seguridad del sistema.
          </li>
          <li style={li}>
            No realizar un uso abusivo de los recursos del servidor.
          </li>
        </ul>
        El incumplimiento puede resultar en la suspension o eliminacion de
        su cuenta sin previo aviso.
      </Section>

      <Section title="6. Propiedad intelectual">
        El codigo, diseno, logotipos y contenido de la aplicacion son propiedad
        de Nejca, salvo indicacion contraria. Los datos que usted
        ingresa (nombres de jugadores, resultados, imagenes) le pertenecen a
        usted, y nos otorga una licencia para almacenarlos y mostrarlos dentro
        de la aplicacion.
      </Section>

      <Section title="7. Privacidad y datos personales">
        El tratamiento de sus datos personales se rige por nuestra
        {' '}<Link href="/legal/privacy" style={{ color: '#f49843' }}>
          Politica de Privacidad
        </Link>. Al utilizar la aplicacion, usted declara haber leido y
        comprendido dicha politica.
      </Section>

      <Section title="8. Limitacion de responsabilidad">
        La aplicacion se proporciona &laquo;tal cual&raquo; y &laquo;segun
        disponibilidad&raquo;. No garantizamos que el servicio sea ininterrumpido
        o libre de errores. En la maxima medida permitida por la ley, el
        operador no sera responsable por danos directos, indirectos,
        incidentales o consecuentes derivados del uso o la imposibilidad de
        uso de la aplicacion.
      </Section>

      <Section title="9. Cancelacion y baja">
        Usted puede dejar de utilizar la aplicacion en cualquier momento. Para
        solicitar la eliminacion de su cuenta y datos, contactenos a traves de
        la seccion de Ayuda. El operador se reserva el derecho de suspender o
        terminar el acceso a usuarios que violen estos terminos.
      </Section>

      <Section title="10. Suscripciones y pagos">
        Los planes premium se gestionan a traves de Mercado Pago. Los pagos son
        procesados por Mercado Pago y estan sujetos a sus propios terminos y
        condiciones. Las suscripciones se renuevan automaticamente cada mes.
        Puede cancelar en cualquier momento desde la seccion Cuenta del panel
        de control.
      </Section>

      <Section title="11. Modificaciones">
        Estos terminos pueden ser modificados en cualquier momento. Notificaremos
        los cambios a traves de la aplicacion o por correo electronico. El uso
        continuado del servicio despues de las modificaciones constituye la
        aceptacion de los nuevos terminos.
      </Section>

      <Section title="12. Ley aplicable y jurisdiccion">
        Estos terminos se rigen por las leyes de la Republica Argentina. Cualquier
        controversia se sometera a los tribunales ordinarios de la Ciudad Autonoma
        de Buenos Aires, renunciando a cualquier otro fuero o jurisdiccion.
      </Section>

      <Section title="13. Contacto">
        Para consultas sobre estos terminos, puede contactarnos a traves de la
        seccion de Ayuda de la aplicacion o abriendo un issue en nuestro
        repositorio de GitHub.
      </Section>
    </article>
  )
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{
        fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px',
        background: 'linear-gradient(135deg, #f8bd79, #f17b20)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>{title}</h2>
      <div style={{ color: 'rgba(251,217,173,0.8)', lineHeight: 1.7, fontSize: '0.95rem' }}>
        {children}
      </div>
    </section>
  )
}

const p = {
  color: 'rgba(251,217,173,0.6)', fontSize: '0.9rem', marginBottom: 32,
}
const ul = { paddingLeft: 20, margin: '8px 0 0' }
const li = { marginBottom: 6 }
