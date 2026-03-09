import mysql from "mysql2/promise";

// 1. Check if a pool already exists in the global object
const globalForDb = global;

export const db =
  globalForDb.db || mysql.createPool(process.env.LOCAL_DATABASE_URL);

// 2. In development, save the pool to the global object
// so it survives across hot-reloads
if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
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
