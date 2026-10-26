// Inactive database placeholder and historical pool example. This export is not a
// usable connection; current frontend requests go through the authenticated backend API.
export const db = 1;
// import mysql from "mysql2/promise";

// const globalForDb = global;

// let db;

// if (!globalForDb.db) {
//   console.log("🚀 Creating NEW MySQL connection pool...");
//   globalForDb.db = mysql.createPool(process.env.LOCAL_DATABASE_URL);
// } else {
//   console.log("✅ Reusing EXISTING MySQL connection pool.");
// }

// db = globalForDb.db;

// if (process.env.NODE_ENV !== "production") {
//   globalForDb.db = db;
// }

// export { db };
