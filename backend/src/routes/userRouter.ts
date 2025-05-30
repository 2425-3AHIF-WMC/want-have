import Router from "express";
import pool from "../db/pool";
import { StatusCodes } from "http-status-codes";
import { keycloak } from "../middleware/keycloak";
import { syncKeycloakUser } from "../utils/syncKeycloakUser";
import { Request, Response } from 'express';

export const userRouter = Router();

userRouter.get("/", async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM "user"');
        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch users" });
    }
});

userRouter.get("/me", keycloak.protect(), async (req: any, res: Response) => {
    try {
        const token = req.kauth.grant.access_token.content;
        const user = await syncKeycloakUser(token);
        res.status(StatusCodes.OK).json(user);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch user info" });
    }
});
