import { QueryResult } from "mysql2"

export interface AuthUserEntity {
    user_key: string,
    email: string,
    username: string,
    password_hash: string
}