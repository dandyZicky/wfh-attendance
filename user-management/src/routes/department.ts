import { Router } from "express";
import { DepartmentController } from "../controllers/department.js";
import { authenticateJWT, authorizeDepartment } from "../middleware/auth.js";

export const router = Router();

const departmentController = new DepartmentController();

router.get("/departments", authenticateJWT, authorizeDepartment, (req, res) => {
    departmentController.getAllDepartments(req, res);
});

router.get("/departments/:id", authenticateJWT, authorizeDepartment, (req, res) => {
    departmentController.getDepartmentById(req, res);
}); 