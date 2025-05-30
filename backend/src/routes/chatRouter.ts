import Router from "express";
import pool from '../db/pool';
import {StatusCodes} from "http-status-codes";
import { Request, Response } from 'express';

export const chatRouter = Router();

chatRouter.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(`
            SELECT
                c.id,
                CASE
                    WHEN c.user1_id = $1 THEN u2.username
                    ELSE u1.username
                    END as partner_name,
                CASE
                    WHEN c.user1_id = $1 THEN c.user2_id
                    ELSE c.user1_id
                    END as partner_id,
                (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
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

// Create new chat
chatRouter.post('/start', async (req: Request, res: Response) => {
    const { user1_id, user2_id } = req.body;
    if (!user1_id || !user2_id) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing user IDs' });
        return;
    }

    try {
        // Check if chat already exists
        const existingChat = await pool.query(
            `SELECT * FROM chat WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
            [user1_id, user2_id]
        );

        if (existingChat.rows.length > 0) {
            res.status(StatusCodes.OK).json({ chat: existingChat.rows[0] });
            return;
        }

        // Create new chat
        const newChat = await pool.query(
            `INSERT INTO chat (user1_id, user2_id) VALUES ($1, $2) RETURNING *`,
            [user1_id, user2_id]
        );

        res.status(StatusCodes.CREATED).json({ chat: newChat.rows[0] });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error', details: err });
    }
});
chatRouter.get('/:chatId/partner', async (req: Request, res: Response) => {
    try {
        const chatId = req.params.chatId;
        const userId = req.query.userId as string;

        // Hole den Chat aus der DB
        const chatResult = await pool.query(
            `SELECT user1_id, user2_id FROM chat WHERE id = $1`,
            [chatId]
        );

        if (chatResult.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Chat nicht gefunden' });
            return;
        }

        const chat = chatResult.rows[0];

        // Ermittle den Partner: Wenn userId user1 ist, dann partner = user2, sonst user1
        let partnerId = null;
        if (chat.user1_id === userId) {
            partnerId = chat.user2_id;
        } else if (chat.user2_id === userId) {
            partnerId = chat.user1_id;
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'User nicht im Chat' });
            return;
        }

        // Hole die Partnerdaten (z.B. Username)
        const partnerResult = await pool.query(
            `SELECT id, username FROM "user" WHERE id = $1`,
            [partnerId]
        );

        if (partnerResult.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Partner nicht gefunden' });
            return;
        }

        res.status(StatusCodes.OK).json(partnerResult.rows[0]);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Serverfehler' });
    }
});


