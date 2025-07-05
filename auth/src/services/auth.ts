import { RowDataPacket } from "mysql2"
import { authDB } from "../db/index.js"
import { Result } from "../types/common.js"
import { AuthUserEntity } from "../models/auth.js"

export const findUserByEmail = async (email: string): Promise<Result<AuthUserEntity, string>> => {
    if (!email) {
        return {success: false, error: "Email empty"} ;
    }

    const [rows] = await authDB.execute<RowDataPacket[]>(
        "SELECT user_key, email, username, password_hash FROM users WHERE email = ?",
        [email]
    );
    
    if (rows.length > 0) {
        const user = rows[0] as AuthUserEntity;
        return { success: true, data: user };
    } else {
        return {success: false, error: "DB error"};
    }

}

export const createUser = async (email: string, username: string, password_hash: string, user_key: string): Promise<Result<any, string>> => {
    if (!email || !username || !password_hash || !user_key) {
        return { success: false, error: "All fields are required" };
    }

    try {
        const [result] = await authDB.execute(
            "INSERT INTO users (user_key, email, username, password_hash) VALUES (?, ?, ?, ?)",
            [user_key, email, username, password_hash]
        );
        return { success: true, data: result };
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, error: "Username or email already exists" };
        }
        console.error("Error creating user in auth service:", error);
        return { success: false, error: "DB error" };
    }
};

export const deleteUser = async (user_key: string): Promise<Result<any, string>> => {
    if (!user_key) {
        return { success: false, error: "User Key is required" };
    }

    try {
        const [result] = await authDB.execute(
            "DELETE FROM users WHERE user_key = ?",
            [user_key]
        );
        return { success: true, data: result };
    } catch (error) {
        console.error("Error deleting user in auth service:", error);
        return { success: false, error: "DB error" };
    }
};