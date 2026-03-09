import mysql from "mysql2/promise";

// 1. Check if a pool already exists in the global object
const globalForDb = global;

export const db =
  globalForDb.db ||
  mysql.createPool({
    uri: process.env.CLOUD_DATABASE_URL || process.env.LOCAL_DATABASE_URL,
    ssl: {
      rejectUnauthorized: true, // This is often required for cloud MySQL
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
