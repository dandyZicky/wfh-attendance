import { Router } from "express";
import { UserController } from "../controllers/user.js";
import { authenticateJWT, authorizeDepartment } from "../middleware/auth.js";

export const router = Router();

const userController = new UserController();

router.post("/users", authenticateJWT, authorizeDepartment, (req, res) => {
    userController.createUser(req, res);
});

router.get("/users/:id", authenticateJWT, authorizeDepartment, (req, res) => {
    userController.getUserById(req, res);
});

router.put("/users/:id", authenticateJWT, authorizeDepartment, (req, res) => {
    userController.updateUser(req, res);
});

router.delete("/users/:id", authenticateJWT, authorizeDepartment, (req, res) => {
    userController.deleteUser(req, res);
});

router.get("/users/department/:user_key", (req, res) => {
    userController.getDepartmentByUserKey(req, res);
});