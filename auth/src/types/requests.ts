import { Request } from "express"

export interface AuthRequest extends Request {
    body: {
        email: String,
        password: String,
    }
}