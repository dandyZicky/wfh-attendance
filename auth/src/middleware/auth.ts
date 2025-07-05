import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { SECRET_KEY } from "../config/index.js";

interface AuthRequest extends Request {
    userKey?: string;
}

export const authenticateJWT: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, SECRET_KEY, (err: jwt.VerifyErrors | null, user: jwt.JwtPayload | string | undefined) => {
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
        jwt.verify(token, SECRET_KEY, (err: jwt.VerifyErrors | null, user: jwt.JwtPayload | string | undefined) => {
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
        const userManagementServiceUrl = process.env.USER_MANAGEMENT_SERVICE_URL || "http://localhost:3000";
        const response = await axios.get(`${userManagementServiceUrl}/users/department/${req.userKey}`);
        const { department_id } = response.data;

        if (department_id === 1) { // department_id 1 for HUMAN RESOURCE
            next();
            return;
        } else {
            res.status(403).json({ msg: "Forbidden: Insufficient permissions" });
            return;
        }
    } catch (error: any) {
        console.error("Error in authorizeDepartment middleware (auth service):", error);
        if (error.response && error.response.data && error.response.data.msg) {
            res.status(error.response.status).json({ msg: error.response.data.msg });
            return;
        }
        res.status(500).json({ msg: "Internal server error during authorization" });
        return;
    }
};