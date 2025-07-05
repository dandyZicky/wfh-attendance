import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { userManagementDB } from "../db/index.js";
import { RowDataPacket } from "mysql2";

interface AuthRequest extends Request {
    userKey?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "&(JDSA*J)D&SA*()D&JA";

export const authenticateJWT: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, user: jwt.JwtPayload | string | undefined) => {
            if (err) {
                res.status(403).json({ msg: "Forbidden: Invalid token" });
                return;
            }
            req.userKey = (user as { sub: string }).sub;
            next();
            return;
        });
    } else if (req.cookies && req.cookies["wfh-attendance-auth"]) {
        const token = req.cookies["wfh-attendance-auth"];
        jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, user: jwt.JwtPayload | string | undefined) => {
            if (err) {
                res.status(403).json({ msg: "Forbidden: Invalid token" });
                return;
            }
            req.userKey = (user as { sub: string }).sub;
            next();
            return;
        });
    } else {
        res.status(401).json({ msg: "Unauthorized: No token provided" });
        return;
    }
};

export const authorizeDepartment: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userKey) {
        res.status(401).json({ msg: "Unauthorized: User key not found" });
        return;
    }

    try {
        const [rows] = await userManagementDB.execute<RowDataPacket[]>(
            "SELECT department_id FROM employees WHERE user_key = ?",
            [req.userKey]
        );

        if (rows.length > 0 && rows[0].department_id === 1) { // department_id 1 for HUMAN RESOURCE
            next();
            return;
        } else {
            res.status(403).json({ msg: "Forbidden: Insufficient permissions" });
            return;
        }
    } catch (error) {
        console.error("Error in authorizeDepartment middleware:", error);
        res.status(500).json({ msg: "Internal server error during authorization" });
        return;
    }
};