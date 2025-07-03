import { PoolOptions } from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_NAME = process.env.DB_NAME || "auth_credentials_db"
const DB_USER = process.env.DB_USER || "auth_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "authpass";
const DB_CONN_LIMIT = parseInt(process.env.DB_CONN_LIMIT || "10");
const DB_PORT = parseInt(process.env.DB_PORT || "3306");

export const cfg: PoolOptions = {
    host: DB_HOST,
    user: DB_USER,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
    connectionLimit: DB_CONN_LIMIT,
}