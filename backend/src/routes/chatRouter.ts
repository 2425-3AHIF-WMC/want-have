import { Router, Request, Response } from "express";
import pool from '../db/pool';
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "../middleware/auth";

export const chatRouter = Router();

chatRouter.get('/', authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user!.id;

    try {
        const result = await pool.query(`
            SELECT
                c.id,
                CASE
                    WHEN c.user1_id = $1 THEN u2.username
                    ELSE u1.username
                END AS partner_name,
                CASE
                    WHEN c.user1_id = $1 THEN c.user2_id
                    ELSE c.user1_id
                END AS partner_id,
                (
                    SELECT content FROM message
                    WHERE chat_id = c.id
                    ORDER BY timestamp DESC
                    LIMIT 1
                ) AS last_message
            FROM chat c
                JOIN "user" u1 ON c.user1_id = u1.id
                JOIN "user" u2 ON c.user2_id = u2.id
            WHERE c.user1_id = $1 OR c.user2_id = $1
        `, [userId]);

        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
    }
});

// 🔐 Chat starten (nur eingeloggte User dürfen das)
chatRouter.post('/start', authenticateJWT, async (req: Request, res: Response) => {
    const senderId = req.user!.id;
    const { partnerId } = req.body;

    if (!partnerId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing partner ID' });
        return;
    }

    try {
        // Gibt es den Chat schon?
        const existingChat = await pool.query(
            `SELECT * FROM chat WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
            [senderId, partnerId]
        );

        if (existingChat.rows.length > 0) {
            res.status(StatusCodes.OK).json({ chat: existingChat.rows[0] });
            return;
        }

        // Chat erstellen
        const newChat = await pool.query(
            `INSERT INTO chat (user1_id, user2_id) VALUES ($1, $2) RETURNING *`,
            [senderId, partnerId]
        );

        res.status(StatusCodes.CREATED).json({ chat: newChat.rows[0] });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error', details: err });
    }
});
