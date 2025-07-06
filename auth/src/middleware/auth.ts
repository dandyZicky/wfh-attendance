import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { SECRET_KEY } from "../config/index.js";

interface MidAuthRequest extends Request {
    headers: {
        authorization?: string;
        "x-user-key"?: string;
    };
    user?: any;
}

export const authenticateJWT: RequestHandler = (req: MidAuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.["wfh-attendance-auth"];

    console.log('Auth middleware - cookies:', req.cookies);
    console.log('Auth middleware - cookie token:', cookieToken);
    console.log('Auth middleware - auth header:', authHeader);

    const token = authHeader ? authHeader.split(" ")[1] : cookieToken;

    if (!token) {
        console.log('Auth middleware - no token found');
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
        req.user = user; // Attach user data to request
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
        const userManagementServiceUrl = process.env.USER_MANAGEMENT_SERVICE_URL || "http://localhost:3000";
        const response = await axios.get(`${userManagementServiceUrl}/users/department/${userKey}`);
        const { department_id } = response.data;

        if (department_id === 1) { // department_id 1 for HUMAN RESOURCE
            next();
            return;
        } else {
            res.status(403).json({ msg: "Forbidden: Insufficient permissions" });
            return;
        }
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.msg) {
            res.status(error.response.status).json({ msg: error.response.data.msg });
            return;
        }
        res.status(500).json({ msg: "Internal server error during authorization" });
        return;
    }
};