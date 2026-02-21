import { db } from "@/lib/db";
import NextAuth from "next-auth";

import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          name: "email",
        },
        password: {
          type: "password",
          name: "password",
        },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const [rows] = await db.execute(
          `
            SELECT *, roles.role
            FROM users
            LEFT JOIN roles ON users.role_id = roles.id
            WHERE email = ?
          `,
          [credentials.email],
        );

        // If that email doesn't exist return null
        if (rows.length === 0) return null;

        const user = rows[0];

        // logic to salt and hash password
        // no hash for now since im using dummy account
        if (user.password_hash !== credentials.password) {
          // increment the failed_login_attempt table here

          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
});
