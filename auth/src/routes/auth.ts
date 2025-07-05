import { Router } from "express";
import { Auth } from "../controllers/auth.js";
import { authenticateJWT, authorizeDepartment } from "../middleware/auth.js";

export const router = Router();

const auth = new Auth();

router.post("/auth/login", (req, res) => {
    auth.login(req, res);
});

router.post("/auth/logout", (req, res) => {
    auth.logout(req, res);
});

router.post("/auth/register", authenticateJWT, authorizeDepartment, (req, res) => {
    auth.register(req, res);
});

router.delete("/auth/users/:user_id", authenticateJWT, authorizeDepartment, (req, res) => {
    auth.deleteUser(req, res);
});
