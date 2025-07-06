import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import axios from "axios";
import { log } from "console";

const SECRET_KEY = process.env.JWT_SECRET || "&(JDSA*J)D&SA*()D&JA";

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.["wfh-attendance-auth"];

    // console.log(authHeader, cookieToken);

    if (!authHeader && !cookieToken) {
        return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader?.split(" ")[1] || cookieToken;

    if (!token) {
        return res.status(401).json({ msg: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ msg: "Invalid token" });
    }
};

export const authorizeDepartment = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
        return res.status(401).json({ msg: "User not authenticated" });
    }

    try {
        const userManagementUrl = process.env.USER_MANAGEMENT_SERVICE_URL || "http://localhost:3001";
        const response = await axios.get(`${userManagementUrl}/users/department/${user.sub}`);
        
        if (response.status === 200) {
            const departmentId = response.data.department_id;
            // For now, allow HR department (assuming department_id 1 is HR)
            if (departmentId === 1) {
                next();
            } else {
                return res.status(403).json({ msg: "Insufficient permissions" });
            }
        } else {
            return res.status(403).json({ msg: "Unable to verify department permissions" });
        }
    } catch (error) {
        console.error("Error verifying department:", error);
        return res.status(403).json({ msg: "Unable to verify department permissions" });
    }
}; 