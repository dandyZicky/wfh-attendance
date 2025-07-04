import { QueryResult } from "mysql2"

export interface AuthUserEntity {
    email: string,
    username: string,
    password_hash: string,
    user_id: string
}