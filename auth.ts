import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/features/auth/schemas';
import { getUserByEmail } from '@/features/auth/queries';
import { verifyPassword } from '@/features/auth/password';
import {
  clearLoginAttempts,
  consumeLoginAttempt,
} from '@/features/auth/login-throttle';
import { getAuthSecret } from '@/features/auth/runtime-config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const result = loginSchema.safeParse(credentials);
        if (!result.success) {
          return null;
        }

        if (!(await consumeLoginAttempt(result.data.email))) {
          return null;
        }

        const user = await getUserByEmail(result.data.email);
        if (!user || !user.isActive || user.role !== 'ADMIN') {
          return null;
        }

        if (!(await verifyPassword(result.data.password, user.passwordHash))) {
          return null;
        }

        await clearLoginAttempts(result.data.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
