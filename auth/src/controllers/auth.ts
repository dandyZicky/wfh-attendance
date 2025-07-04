import {CookieOptions, Request, Response} from "express";
import { compare } from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types/requests.js";
import { SECRET_KEY } from "../config/index.js";
import { findUserByEmail } from "../services/auth.js";

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

        const {password_hash, user_id} = result.data;
        
        const isPasswordCorrect = await compare(password.toString(), password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({msg: "Incorrect password!"});
        }

        const payload: JwtPayload = {
            sub: user_id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };

        const signed = jwt.sign(payload, SECRET_KEY);

        // Set cookie
        const option: CookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + (1000 * 3600))
        }

        res.cookie(COOKIE_NAME, signed, option);

        return res.status(200).json({msg: "Correct password!"});
    }

    async logout(req: Request, res: Response) {
        res.clearCookie(COOKIE_NAME);
        res.status(200).json({msg: "logged out"});
    }
}

