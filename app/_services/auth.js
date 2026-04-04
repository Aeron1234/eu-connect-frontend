import { db } from "@/lib/db";
import NextAuth, { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";

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
          SELECT 
          u.id AS user_uuid, 
          u.email, 
          u.password_hash,
          u.status,
          r.role
          FROM users AS u
          INNER JOIN roles AS r ON u.role_id = r.id
          WHERE u.email = ?
        `,
          [credentials.email],
        );

        // If that email doesn't exist return null
        if (rows.length === 0) return null;

        const user = rows[0];

        if (user.status === "inactive") {
          const error = new CredentialsSignin();
          error.code = "inactive_account";
          throw error;
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );

        if (!isMatch) {
          return null; // Triggers "Invalid email or password"
        }

        // if (credentials.password !== user.password_hash) {
        //   return null;
        // }

        return {
          id: user.user_uuid,
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
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.email = token.email;
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
