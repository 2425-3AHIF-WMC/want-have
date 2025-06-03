// ───────────────────────────────────────────────────────────────────────────────
// Datei: routes/notificationRouter.ts
// ───────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import pool from "../db/pool";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "../middleware/auth";
import { Request, Response } from "express";

export const notificationRouter = Router();

// ───────────────────────────────────────────────────────────────────────────────
// GET /notifications?onlyUnseen=true
// Liefert alle Notifications oder nur ungelesene (onlyUnseen=true)
// ───────────────────────────────────────────────────────────────────────────────
notificationRouter.get("/", authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const onlyUnseen = req.query.onlyUnseen === "true";

    try {
        let query = `
      SELECT id, type, message, created_at, seen
      FROM notification
      WHERE user_id = $1
    `;
        const params: (string | number | boolean)[] = [userId];

        if (onlyUnseen) {
            query += ` AND seen = false`;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        res.status(StatusCodes.OK).json(result.rows);
        return ;
    } catch (err) {
        console.error("Fehler beim Laden von Notifications:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" })
        return;
    }
});

// ───────────────────────────────────────────────────────────────────────────────
// PUT /notifications/:id/read
// Markiert eine Notification als gelesen
// ───────────────────────────────────────────────────────────────────────────────
notificationRouter.put("/:id/read", authenticateJWT, async (req: Request, res: Response) => {
    const notifId = req.params.id;
    const userId = req.user!.id;

    try {
        const updateRes = await pool.query(
            `
      UPDATE notification
      SET seen = true
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
            [notifId, userId]
        );
        if (updateRes.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "Notification not found" });
            return;
        }
        res.status(StatusCodes.OK).json({ notification: updateRes.rows[0] });
        return;
    } catch (err) {
        console.error("Fehler beim Markieren als gelesen:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
        return;
    }
});

