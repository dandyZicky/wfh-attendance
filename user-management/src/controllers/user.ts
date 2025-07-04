import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { userManagementDB } from "../db/index.js";
import { v4 as uuidv4 } from 'uuid';

export class UserController {
    async createUser(req: Request, res: Response) {
        const { username, email, role_id, first_name, last_name } = req.body;
        const user_id = uuidv4(); // Generate a unique user ID

        if (!username || !email || role_id === undefined || !first_name || !last_name) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        try {
            const [result] = await userManagementDB.execute<ResultSetHeader>(
                "INSERT INTO employees (username, email, role_id, first_name, last_name, id) VALUES (?, ?, ?, ?, ?, ?)",
                [username, email, role_id, first_name, last_name, user_id]
            );

            if (result.affectedRows > 0) {
                res.status(201).json({ msg: "User created successfully", user_id: user_id });
            } else {
                res.status(500).json({ msg: "Failed to create user" });
            }
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    async getUserById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const [rows] = await userManagementDB.execute<RowDataPacket[]>(
                "SELECT id, username, email, role_id, first_name, last_name, created_at FROM employees WHERE id = ?",
                [id]
            );

            if (rows.length > 0) {
                res.status(200).json(rows[0]);
            } else {
                res.status(404).json({ msg: "User not found" });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        const { username, email, role_id, first_name, last_name } = req.body;

        if (!username || !email || role_id === undefined || !first_name || !last_name) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        try {
            const [result] = await userManagementDB.execute<ResultSetHeader>(
                "UPDATE employees SET username = ?, email = ?, role_id = ?, first_name = ?, last_name = ? WHERE id = ?",
                [username, email, role_id, first_name, last_name, id]
            );

            if (result.affectedRows > 0) {
                res.status(200).json({ msg: "User updated successfully" });
            } else {
                res.status(404).json({ msg: "User not found or no changes made" });
            }
        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const [result] = await userManagementDB.execute<ResultSetHeader>(
                "DELETE FROM employees WHERE id = ?",
                [id]
            );

            if (result.affectedRows > 0) {
                res.status(200).json({ msg: "User deleted successfully" });
            } else {
                res.status(404).json({ msg: "User not found" });
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }
}