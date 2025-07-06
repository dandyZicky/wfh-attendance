import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { userManagementDB } from "../db/index.js";

export class DepartmentController {
    async getAllDepartments(req: Request, res: Response) {
        try {
            const [rows] = await userManagementDB.execute<RowDataPacket[]>(
                "SELECT department_id, department_name, created_at FROM departments ORDER BY department_name ASC"
            );

            res.status(200).json(rows);
        } catch (error) {
            console.error("Error fetching all departments:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    async getDepartmentById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const [rows] = await userManagementDB.execute<RowDataPacket[]>(
                "SELECT department_id, department_name, created_at FROM departments WHERE department_id = ?",
                [id]
            );

            if (rows.length > 0) {
                res.status(200).json(rows[0]);
            } else {
                res.status(404).json({ msg: "Department not found" });
            }
        } catch (error) {
            console.error("Error fetching department:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }
} 