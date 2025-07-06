import {CookieOptions, Request, Response} from "express";
import { compare, hash } from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest, RegisterRequest } from "../types/requests.js";
import { SECRET_KEY } from "../config/index.js";
import { createUser, findUserByEmail, deleteUser } from "../services/auth.js";

const COOKIE_NAME = "wfh-attendance-auth";

export class Auth {
    async login(req: AuthRequest, res: Response) {
        if (!req.body) {
            return res.status(400).json({msg: "invalid request"});
        }

        const {email, password} = req.body || {};

        
        if (!email || !password) {
            return res.status(400).json({msg: "invalid request"});
        }

        const result = await findUserByEmail(email.toString());

        if (!result.success) {
            return res.status(500).json({ msg: result.error })
        }

        const {password_hash, user_key} = result.data;
        
        const isPasswordCorrect = await compare(password.toString(), password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({msg: "Incorrect password!"});
        }

        const payload: JwtPayload = {
            sub: user_key,
            email: email,
            username: result.data.username || email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };

        const signed = jwt.sign(payload, SECRET_KEY);

        // Set cookie
        const option: CookieOptions = {
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // Set to true in production with HTTPS
            expires: new Date(Date.now() + (1000 * 3600))
        }

        res.cookie(COOKIE_NAME, signed, option);

        // Return user data along with success message
        return res.status(200).json({
            msg: "Correct password!",
            user: {
                user_key: user_key,
                email: email,
                username: result.data.username || email // fallback to email if username not available
            }
        });
    }

    async logout(req: Request, res: Response) {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false
        });
        res.status(200).json({msg: "logged out"});
    }

    async verify(req: Request, res: Response) {
        // The authenticateJWT middleware will handle the JWT verification
        // If we reach this point, the user is authenticated
        const user = (req as any).user; // user data from middleware
        
        if (!user) {
            return res.status(401).json({ msg: "Not authenticated" });
        }

        // Return user data from JWT - no database call needed
        return res.status(200).json({
            msg: "Authenticated",
            user: {
                user_key: user.sub,
                email: user.email,
                username: user.username
            }
        });
    }

    async register(req: RegisterRequest, res: Response) {
        if (!req.body) {
            return res.status(400).json({msg: "invalid request"});
        }

        const { username, email, password, user_key } = req.body;

        if (!username || !email || !password || !user_key) {
            return res.status(400).json({msg: "All fields are required"});
        }

        try {
            const password_hash = await hash(password, 10);
            const result = await createUser(email, username, password_hash, user_key);

            if (!result.success) {
                return res.status(500).json({ msg: result.error });
            }

            return res.status(201).json({ msg: "User registered successfully", user_key });
        } catch (error) {
            console.error("Error registering user:", error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    }

    async deleteUser(req: Request, res: Response) {
        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ msg: "User ID is required" });
        }

        try {
            const result = await deleteUser(user_id);
            if (!result.success) {
                return res.status(500).json({ msg: result.error });
            }
            return res.status(200).json({ msg: "User deleted successfully" });
        } catch (error) {
            console.error("Error deleting user:", error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    }
}

