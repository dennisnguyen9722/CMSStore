// lib/db.ts
import mysql from "mysql2/promise";

export const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root@123",
  database: "ecommerce",
});
