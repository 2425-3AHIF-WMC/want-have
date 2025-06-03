// Dateipfad: routes/reportRouter.ts
import { Router } from "express";
import pool from "../db/pool";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth";

export const reportRouter = Router();

reportRouter.post("/general", authenticateJWT, async (req: Request, res: Response) => {
    const reporter_id = req.user!.id;
    const { reason, description } = req.body;

    if (!reason) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Reason required" });
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO report (reporter_id, reason, description)
       VALUES ($1, $2, $3) RETURNING *`,
            [reporter_id, reason, description || null]
        );
        res.status(StatusCodes.CREATED).json({ report: result.rows[0] });
        return;
    } catch (err) {
        console.error("DB-Error in /reports/general:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error", details: err });
        return;
    }
});

reportRouter.post("/ad", authenticateJWT, async (req: Request, res: Response) => {
    const reporter_id = req.user!.id;
    const { ad_id, reported_user_id, reason, description } = req.body;

    if (!ad_id || !reported_user_id || !reason) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: "ad_id, reported_user_id and reason are required",
        });
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO report (reporter_id, ad_id, reported_user_id, reason, description)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [reporter_id, ad_id, reported_user_id, reason, description || null]
        );
        res.status(StatusCodes.CREATED).json({ report: result.rows[0] });
        return;
    } catch (err) {
        console.error("DB-Error in /reports/ad:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error", details: err });
        return;
    }
});
