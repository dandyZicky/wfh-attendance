import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { userManagementDB } from "../db/index.js";
import { RowDataPacket } from "mysql2";

interface MidAuthRequest extends Request {
    headers: {
        authorization?: string;
        "x-user-key"?: string;
    };
}

const SECRET_KEY = process.env.JWT_SECRET || "&(JDSA*J)D&SA*()D&JA";

export const authenticateJWT: RequestHandler = (req: MidAuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.["wfh-attendance-auth"];

    const token = authHeader ? authHeader.split(" ")[1] : cookieToken;

    if (!token) {
        res.status(401).json({ msg: "Unauthorized: No token provided" });
        return;
    }

    jwt.verify(token, SECRET_KEY, (err: jwt.VerifyErrors | null, user: jwt.JwtPayload | string | undefined) => {
        if (err) {
            res.status(403).json({ msg: "Forbidden: Invalid token" });
            return;
        }
        req.headers["x-user-key"] = (user as { sub: string }).sub;
        req.headers.authorization = "Bearer " + token;
        next();
    });
};

export const authorizeDepartment: RequestHandler = async (req: MidAuthRequest, res: Response, next: NextFunction) => {
    const userKey = req.headers["x-user-key"];
    if (!userKey) {
        res.status(401).json({ msg: "Unauthorized: User key not found in headers" });
        return;
    }

    try {
        const [rows] = await userManagementDB.execute<RowDataPacket[]>(
            "SELECT department_id FROM employees WHERE user_key = ?",
            [userKey]
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