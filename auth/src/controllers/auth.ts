import {CookieOptions, Request, Response} from "express";
import { compare } from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../models/auth.js";
import { findUserByEmail } from "../utils/external/user-management.js";
import { SECRET_KEY } from "../config/index.js";

export class Auth {
    async login(req: AuthRequest, res: Response) {
        if (!req.body) {
            return res.status(400).json({msg: "invalid request"});
        }

        const {email, password} = req.body || {};

        
        if (!email || !password) {
            return res.status(400).json({msg: "invalid request"});
        }

        // find userByEmail
        const {user_id, password_hash} = await findUserByEmail(email);
        
        const isPasswordCorrect = await compare(password.toString(), password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({msg: "Incorrect password!"});
        }

        // prepare JWT


        const payload: JwtPayload = {
            sub: user_id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };

        const signed = jwt.sign(payload, SECRET_KEY);

        // Set cookie
        const option: CookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 600000)
        }

        res.cookie("wfh-attendance-auth", signed, option);

        return res.status(200).json({msg: "Correct password!"});
    }

    logout(req: Request, res: Response) {
        res.status(200).json({msg: "logged out"})
    }

    register(req: Request, res: Response) {
        res.status(200).json({msg: "Registered!"})
    }
}

