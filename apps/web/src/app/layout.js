import SessionProvider from './SessionProvider'
import './globals.css'

export const metadata = {
  title: 'AO Stats - Tu liga, tus estadisticas',
  description: 'Gestiona tus torneos, sigue las estadisticas y descubre quien es el mejor.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
