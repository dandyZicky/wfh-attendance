import { Request } from "express"

export interface AuthRequest extends Request {
    body: {
        email: String,
        password: String,
    }
}

export interface RegisterRequest extends Request {
    body: {
        user_key: string;
        username: string;
        email: string;
        password: string;
    };
}
