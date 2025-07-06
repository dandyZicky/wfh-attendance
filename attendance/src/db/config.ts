import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
    host: process.env.ATTENDANCE_DB_HOST || "localhost",
    port: parseInt(process.env.ATTENDANCE_DB_PORT || "3308"),
    user: process.env.ATTENDANCE_DB_USER || "attendance_user",
    password: process.env.ATTENDANCE_DB_PASSWORD || "authpass",
    database: process.env.ATTENDANCE_DB_NAME || "attendance_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

export const attendanceDB = mysql.createPool(dbConfig); 