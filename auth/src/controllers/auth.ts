import {Request, Response} from "express";

export class Auth {
    login(req: Request, res: Response) {
        res.status(200).json({msg: "logged in"});
    }

    logout(req: Request, res: Response) {
        res.status(200).json({msg: "logged out"})
    }
}

