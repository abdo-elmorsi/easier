import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const time = 24 * 60 * 60;
const options = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      async authorize({ user }) {
        try {
          const userData = JSON.parse(user);
          return {
            name: { ...userData },
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt", // Use JWT for session tokens
    maxAge: time, // Session expires in 1 day (in seconds)
  },

  jwt: {
    maxAge: time, // Token expires in 1 day (in seconds)
  },

  callbacks: {
    async session({ session, token }) {
      const { user: { name } } = session;
      session.user = name;
      session.expires = token.exp; // Include the expiration date in the session
      return session;
    },

    jwt({ token, trigger, session }) {
      if (trigger === 'update' && session) {
        const { user } = session;
        token.name = user;
      }
      return token;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
  },
};

const authHandler = (req, res) => NextAuth(req, res, options);

export default authHandler;
