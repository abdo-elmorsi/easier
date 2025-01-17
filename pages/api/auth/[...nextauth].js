import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const options = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      async authorize(credentials) {
        try {
          // Validate user credentials (e.g., check against a database)
          const userData = JSON.parse(credentials.user);
          if (userData) {
            return userData; // Ensure this returns an object with user details
          }
          return null; // Return null if user validation fails
        } catch (error) {
          return null; // Handle error appropriately
        }
      },
    }),
  ],


  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    encryption: true,
    algorithms: ["HS512"],
  },



  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.user_name = token.user_name;
        session.user.phone = token.phone;
        session.user.img = token.img;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        token = { ...token, ...session.user }
      }
      if (user) {
        token = { ...token, ...user }; // Ensure user data is added to the token
      }
      return token;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",

  pages: {
    signIn: '/login',
  },
};

const authHandler = (req, res) => NextAuth(req, res, options);

export default authHandler;
