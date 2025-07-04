import { RowDataPacket } from "mysql2"
import { authDB } from "../db/index.js"
import { Result } from "../types/common.js"
import { AuthUserEntity } from "../models/auth.js"

export const findUserByEmail = async (email: string): Promise<Result<AuthUserEntity, string>> => {
    if (!email) {
        return {success: false, error: "Email empty"} ;
    }

    const [rows] = await authDB.execute<RowDataPacket[]>(
        "SELECT user_id, password_hash FROM users WHERE email = ?",
        [email]
    );
    
    if (rows.length > 0) {
        const user = rows[0] as AuthUserEntity;
        return { success: true, data: user };
    } else {
        return {success: false, error: "DB error"};
    }

}