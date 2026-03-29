import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();

        // Explicitly select password field (excluded by default)
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        if (!user) {
          throw new Error('No account found with that email');
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        return {
          id:       user._id.toString(),
          email:    user.email,
          name:     user.name,
          username: user.username,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id       = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  },

  pages: {
    signIn:  '/login',
    signOut: '/',
    error:   '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
