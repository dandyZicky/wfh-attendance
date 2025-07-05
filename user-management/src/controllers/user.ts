import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { userManagementDB } from "../db/index.js";
import axios from "axios";
import { CreateUserRequest } from "../types/requests.js";
import { uuidv7 } from "uuidv7";

export class UserController {
    async createUser(req: CreateUserRequest, res: Response) {
        if (!req.body) {
            return res.status(400).json({ msg: "Invalid request" });
        }

        const { username, email, password, department_id, first_name, last_name } = req.body;

        if (!username || !email || !password || department_id === undefined || !first_name || !last_name) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const user_key = uuidv7();
        const hire_date = new Date(Date.now());

        try {
            const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:3000";
            const authResponse = await axios.post(`${authServiceUrl}/auth/register`, {
                user_key,
                username,
                email,
                password
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: req.headers.authorization || ""
                }
            });

            if (authResponse.status !== 201) {
                return res.status(authResponse.status).json({ msg: authResponse.data.msg || "Auth service registration failed" });
            }

            const [result] = await userManagementDB.execute<ResultSetHeader>(
                "INSERT INTO employees (user_key, username, email, department_id, first_name, last_name, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [user_key, username, email, department_id, first_name, last_name, hire_date]
            );

            if (result.affectedRows > 0) {
                res.status(201).json({ msg: "User created successfully", user_key });
            } else {
                await axios.delete(`${authServiceUrl}/auth/users/${user_key}`);
                res.status(500).json({ msg: "Failed to create user in user-management, auth user rolled back" });
            }
        } catch (error: any) {
            console.error("Error creating user:", error);
            if (error.response && error.response.data && error.response.data.msg) {
                return res.status(error.response.status).json({ msg: error.response.data.msg });
            }
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
    async getDepartmentByUserKey(req: Request, res: Response) {
        const { user_key } = req.params;
        try {
            const [rows] = await userManagementDB.execute<RowDataPacket[]>(
                "SELECT department_id FROM employees WHERE user_key = ?",
                [user_key]
            );

            if (rows.length > 0) {
                res.status(200).json({ department_id: rows[0].department_id });
            } else {
                res.status(404).json({ msg: "User not found" });
            }
        } catch (error) {
            console.error("Error fetching department by user key:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }
}