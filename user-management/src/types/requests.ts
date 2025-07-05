import { Request } from "express";
export interface CreateUserRequest extends Request {
    body: {
        username: string;
        email: string;
        password: string;
        department_id: number;
        first_name: string;
        last_name: string;
    };
}
