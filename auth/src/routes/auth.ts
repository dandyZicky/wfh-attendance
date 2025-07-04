import { Router } from "express";
import { Auth } from "../controllers/auth.js";

export const router = Router();

const auth = new Auth();

router.post("/auth/login", (req, res) => {
    auth.login(req, res);
});

router.post("/auth/register", (req, res) => {
    auth.register(req, res);
});

router.post("/auth/logout", (req, res) => {
    auth.logout(req, res);
});
