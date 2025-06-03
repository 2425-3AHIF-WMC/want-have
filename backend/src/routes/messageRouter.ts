import {Router} from 'express';
import pool from '.././db/pool';
import {StatusCodes} from "http-status-codes";
import {authenticateJWT} from "../middleware/auth";
import { Request, Response } from 'express';

export const messageRouter = Router();
messageRouter.get("/hasNewMessages", authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    try {
        // Beispiel‐Query: Gibt true zurück, wenn mindestens eine Nachricht für userId ist, die noch nicht gelesen:
        // Du musst hier anpassen, je nachdem, wie deine DB das „Gelesen/ungelesen“ regelt.
        const result = await pool.query(
            `
      SELECT COUNT(*) AS cnt
      FROM message
      WHERE recipient_id = $1
        AND is_read = false
      `,
            [userId]
        );
        const count = parseInt(result.rows[0].cnt, 10);
        res.status(StatusCodes.OK).json({ hasNew: count > 0 });
        return;
    } catch (err) {
        console.error("Fehler beim Prüfen von ungelesenen Nachrichten:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
        return;
    }
});
messageRouter.post('/:chatId', authenticateJWT, async (req: Request, res: Response) => {
    const { content } = req.body;
    const { chatId } = req.params;
    const { id: sender_id } = req.user!;

    if (!content) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Message content is required' });
        return;
    }

    try {
        // Check if the user is part of the chat (chat must contain sender_id or user_id)
        const chat = await pool.query(
            `SELECT * FROM chat WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
            [chatId, sender_id]
        );

        if (chat.rows.length === 0) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'You are not part of this chat' });
            return;
        }

        // Insert the new message into the database
        const newMessage = await pool.query(
            `INSERT INTO message (chat_id, sender_id, content) 
      VALUES ($1, $2, $3) RETURNING *`,
            [chatId, sender_id, content]
        );

        // Send the new message back as a response
        res.status(StatusCodes.CREATED).json({ message: newMessage.rows[0] });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error', details: err });
        return;
    }
});

// GET messages by chatId (for viewing messages)
messageRouter.get('/:chatId', authenticateJWT, async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const userId: string = req.user!.id;

    try {
        const messages = await pool.query(
            `SELECT * FROM message WHERE chat_id = $1 ORDER BY timestamp ASC`,
            [chatId]
        );

        await pool.query(
            `UPDATE message 
             SET read = TRUE 
             WHERE chat_id = $1 AND sender_id != $2 AND read = FALSE`,
            [chatId, userId]
        );

        res.status(StatusCodes.OK).json({ messages: messages.rows });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error', details: err });
    }
});

// Neue Route für unread count
messageRouter.get('/unread-count', authenticateJWT, async (req, res) => {
    const userId = req.user!.id;

    try {
        // Hole alle Nachrichten aus Chats, in denen der User beteiligt ist, aber nicht der Sender ist
        const result = await pool.query(
            `
            SELECT COUNT(*) 
            FROM message m
            JOIN chat c ON m.chat_id = c.id
            WHERE m.read = FALSE 
              AND m.sender_id != $1 
              AND (c.user1_id = $1 OR c.user2_id = $1)
            `,
            [userId]
        );

        const count = parseInt(result.rows[0].count, 10);

        res.status(StatusCodes.OK).json({
            unreadCount: count > 99 ? '99+' : count
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error', details: err });
    }
});
