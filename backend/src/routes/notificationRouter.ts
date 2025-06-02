import { Router, Request, Response } from "express";
import pool from '../db/pool';
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "../middleware/auth";

export const notificationRouter = Router();

// Alle Notifications für eingeloggten User holen
notificationRouter.get('/', authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user!.id;

    try {
        const result = await pool.query(
            `SELECT * FROM notification WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
    }
});

// Notification als gelesen markieren
notificationRouter.patch('/:id/read', authenticateJWT, async (req: Request, res: Response) => {
    const notificationId = req.params.id;
    const userId = req.user!.id;

    try {
        const result = await pool.query(
            `UPDATE notification SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
            [notificationId, userId]
        );
        if (result.rowCount === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "Notification not found" });
            return;
        }
        res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
    }
});

// Neue Notification anlegen (optional, meist intern vom System)
notificationRouter.post('/', authenticateJWT, async (req: Request, res: Response) => {
    const { user_id, type, related_id, message } = req.body;

    if (!user_id || !type || !message) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required fields" });
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO notification (user_id, type, related_id, message) VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, type, related_id || null, message]
        );
        res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
    }
});
