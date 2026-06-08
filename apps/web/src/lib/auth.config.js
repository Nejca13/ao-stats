import Google from 'next-auth/providers/google'

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isLogin = nextUrl.pathname.startsWith('/auth/login')
      const isAuthApi = nextUrl.pathname.startsWith('/api/auth')
      if (isDashboard && !auth && !isLogin) return false
      return true
    },
  },
}
