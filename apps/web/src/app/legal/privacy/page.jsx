export const metadata = {
  title: 'Política de Privacidad · AO Stats',
  description: 'Política de Privacidad de AO Stats. Cómo recopilamos, usamos y protegemos tus datos personales conforme a la Ley 25.326 y el RGPD.',
}

export default function PrivacyPage() {
  return (
    <article>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 32px' }}>
        Política de Privacidad
      </h1>
      <p style={p}>Ultima actualizacion: 8 de junio de 2026</p>

      <Section title="1. Responsable del tratamiento">
        AO Stats (en adelante, &laquo;la aplicacion&raquo;) es operada por Nicolas
        Contreras. Los datos personales recabados seran tratados conforme a la
        Ley 25.326 de Proteccion de Datos Personales de la Republica Argentina
        y el Reglamento General de Proteccion de Datos (RGPD) de la Union
        Europea cuando corresponda.
      </Section>

      <Section title="2. Datos que recopilamos">
        <ul style={ul}>
          <li style={li}>
            <strong>Datos de cuenta:</strong> nombre, direccion de correo
            electronico e identificador unico proporcionados por Google al
            iniciar sesion.
          </li>
          <li style={li}>
            <strong>Datos de uso:</strong> informacion sobre los torneos,
            partidos, jugadores y estadisticas que usted crea dentro de la
            aplicacion.
          </li>
          <li style={li}>
            <strong>Datos del dispositivo:</strong> modelo, sistema operativo
            y version de la aplicacion (solo Android).
          </li>
          <li style={li}>
            <strong>Imagenes:</strong> las fotos de escudos y partidos que
            usted sube voluntariamente a traves de la aplicacion.
          </li>
        </ul>
      </Section>

      <Section title="3. Finalidad del tratamiento">
        Sus datos se utilizan exclusivamente para:
        <ul style={ul}>
          <li style={li}>Autenticar su identidad mediante Google.</li>
          <li style={li}>
            Permitir la creacion y gestion de torneos, jugadores y partidos.
          </li>
          <li style={li}>Sincronizar sus datos entre dispositivos.</li>
          <li style={li}>
            Mejorar la aplicacion en base a patrones de uso agregados.
          </li>
          <li style={li}>Enviar comunicaciones tecnicas (actualizaciones, cambios en Terminos).</li>
        </ul>
      </Section>

      <Section title="4. Base legal">
        El tratamiento se basa en:
        <ul style={ul}>
          <li style={li}>
            <strong>Consentimiento:</strong> al utilizar la aplicacion y aceptar
            estos Terminos, usted consiente el tratamiento de sus datos.
          </li>
          <li style={li}>
            <strong>Ejecucion del servicio:</strong> el tratamiento es necesario
            para proveer la funcionalidad de la aplicacion.
          </li>
        </ul>
      </Section>

      <Section title="5. Almacenamiento y seguridad">
        Sus datos se almacenan en servidores de MongoDB Atlas (Google Cloud,
        region us-east) y Vercel (AWS, region us-east). Implementamos medidas
        de seguridad tecnicas y organizativas, incluyendo:
        <ul style={ul}>
          <li style={li}>Cifrado en transito (TLS 1.3).</li>
          <li style={li}>Cifrado en reposo de la base de datos.</li>
          <li style={li}>Tokens JWT firmados para sesiones.</li>
          <li style={li}>Acceso restringido a la base de datos por IP y credenciales.</li>
        </ul>
      </Section>

      <Section title="6. Conservacion de datos">
        Conservamos sus datos mientras su cuenta este activa. Si solicita la
        baja, los datos se eliminaran en un plazo maximo de 30 dias. Las
        imagenes subidas a Cloudinary se conservan hasta que usted las elimine
        o solicite la baja de su cuenta.
      </Section>

      <Section title="7. Comparticion de datos">
        No compartimos sus datos personales con terceros, excepto:
        <ul style={ul}>
          <li style={li}>
            <strong>Google:</strong> para la autenticacion (Google Sign-In).
          </li>
          <li style={li}>
            <strong>Cloudinary:</strong> para el almacenamiento de imagenes.
          </li>
          <li style={li}>
            <strong>Mercado Pago:</strong> para el procesamiento de pagos
            (unicamente si adquiere un plan premium).
          </li>
          <li style={li}>
            Cuando sea requerido por ley o autoridad competente.
          </li>
        </ul>
      </Section>

      <Section title="8. Derechos del usuario">
        Usted tiene derecho a:
        <ul style={ul}>
          <li style={li}>Acceder a sus datos personales.</li>
          <li style={li}>Rectificar datos inexactos.</li>
          <li style={li}>Solicitar la supresion de sus datos.</li>
          <li style={li}>Oponerse al tratamiento.</li>
          <li style={li}>Portar sus datos a otro servicio.</li>
          <li style={li}>Retirar su consentimiento en cualquier momento.</li>
        </ul>
        Para ejercer estos derechos, contactenos a traves del formulario de
        contacto en la aplicacion o via correo electronico.
      </Section>

      <Section title="9. Transferencias internacionales">
        Sus datos pueden ser transferidos y almacenados en servidores ubicados
        en Estados Unidos. Al utilizar la aplicacion, usted consiente esta
        transferencia. Se aplican las garantias adecuadas mediante clausulas
        contractuales tipo u otros mecanismos previstos por la normativa
        aplicable.
      </Section>

      <Section title="10. Cambios a esta politica">
        Notificaremos cambios sustanciales a traves de la aplicacion o por
        correo electronico. El uso continuado de la aplicacion despues de los
        cambios implica la aceptacion de la politica actualizada.
      </Section>

      <Section title="11. Contacto">
        Para consultas sobre esta politica o el tratamiento de sus datos,
        puede contactarnos a traves de la seccion de Ayuda de la aplicacion
        o abriendo un issue en nuestro repositorio de GitHub.
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
