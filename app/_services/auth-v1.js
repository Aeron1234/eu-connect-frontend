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
          u.id AS user_uuid, u.email, u.password_hash, u.status, u.account_locked_until, u.failed_login_attempts,
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

        if (user.role === "student") {
          const [courseRows] = await db.execute(
            `
              SELECT 
                c.course_name AS course_name, 
                d.code AS department_code
              FROM student_academic_info AS sai
              JOIN courses AS c ON c.id = sai.course_id
              JOIN departments AS d ON d.id = sai.department_id
              WHERE sai.user_id = ?
            `,
            [user.user_uuid],
          );

          if (courseRows.length > 0) {
            user.course_name = courseRows[0].course_name;
            user.department_code = courseRows[0].department_code;
          }
        }

        if (user.role === "department_head") {
          const [courseRows] = await db.execute(
            `
              SELECT
                d.code AS department_code
              FROM dept_heads_background_info AS dhbi
              JOIN departments AS d ON d.id = dhbi.department_id
              WHERE dhbi.user_id = ?
            `,
            [user.user_uuid],
          );

          if (courseRows.length > 0) {
            user.department_code = courseRows[0].department_code;
          }
        }

        if (
          user.account_locked_until &&
          new Date(user.account_locked_until) > new Date()
        ) {
          const lockedUntil = new Date(user.account_locked_until);

          const formatted = new Intl.DateTimeFormat("en-PH", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(lockedUntil);

          const error = new Error(
            `Account locked until ${formatted} Please try again later.`,
          );
          error.code = "account_locked";
          throw error;
        }

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
          const newAttempts = user.failed_login_attempts + 1;

          if (newAttempts >= 5) {
            // Lock the account for 15 minutes
            await db.execute(
              `UPDATE users SET failed_login_attempts = ?, account_locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?`,
              [newAttempts, credentials.email],
            );
          } else {
            // Just increment the count
            await db.execute(
              `UPDATE users SET failed_login_attempts = ? WHERE email = ?`,
              [newAttempts, credentials.email],
            );
          }
          return null;
        }

        await db.execute(
          `UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE email = ?`,
          [credentials.email],
        );

        return {
          id: user.user_uuid,
          email: user.email,
          role: user.role,
          course_name: user.course_name ? user.course_name : null,
          department_code: user.department_code ? user.department_code : null,
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
        token.course_name = user.course_name;
        token.department_code = user.department_code;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.course_name = token.course_name;
      session.user.department_code = token.department_code;
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
