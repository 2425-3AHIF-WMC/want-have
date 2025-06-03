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

chatRouter.get("/me", authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    try {
        const result = await pool.query(
            `
      SELECT id
      FROM chat
      WHERE user1_id = $1 OR user2_id = $1
      LIMIT 1
      `,
            [userId]
        );
        if (result.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "Kein Chat gefunden" });return;
        }
        res.status(StatusCodes.OK).json({ chatId: result.rows[0].id });
        return;
    } catch (err) {
        console.error("Fehler beim Laden der Chat‐ID:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
        return;
    }
});

chatRouter.get("/:chatId/partner", authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const chatId = req.params.chatId;

    try {
        const result = await pool.query(
            `
      SELECT
        CASE 
          WHEN c.user1_id = $1 THEN u2.id
          ELSE u1.id
        END AS partner_id,
        CASE 
          WHEN c.user1_id = $1 THEN u2.username
          ELSE u1.username
        END AS partner_name,
        u2.avatar_url AS partner_avatar  -- optional, falls du Avatar‐URL speicherst
      FROM chat c
      JOIN "user" u1 ON c.user1_id = u1.id
      JOIN "user" u2 ON c.user2_id = u2.id
      WHERE c.id = $2 AND (c.user1_id = $1 OR c.user2_id = $1)
      `,
            [userId, chatId]
        );
        if (result.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "Chat oder Partner nicht gefunden" });
            return;
        }
        // Beispiel‐Response
        res.status(StatusCodes.OK).json({
            id: result.rows[0].partner_id,
            name: result.rows[0].partner_name,
            avatar: result.rows[0].partner_avatar,
            isOnline: false, // Wenn du Online‐Status trackst, setze hier dynamisch
        });return;
    } catch (err) {
        console.error("Fehler beim Laden des Chat‐Partners:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
        return;
    }
});

/**
 * GET /messages/:chatId
 * Liefert alle Nachrichten für einen Chat (chronologisch)
 */
chatRouter.get("/messages/:chatId", authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const chatId = req.params.chatId;

    try {
        // Optional: prüfe erst, ob der userId Teil dieses Chats ist
        const check = await pool.query(
            `
      SELECT 1 FROM chat 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
      `,
            [chatId, userId]
        );
        if (check.rows.length === 0) {
            res.status(StatusCodes.FORBIDDEN).json({ error: "Kein Zugriff auf diesen Chat" });
            return;
        }

        const messagesRes = await pool.query(
            `
      SELECT id, content, sender_id, chat_id, created_at
      FROM message
      WHERE chat_id = $1
      ORDER BY created_at ASC
      `,
            [chatId]
        );
        res.status(StatusCodes.OK).json(messagesRes.rows);
        return;
    } catch (err) {
        console.error("Fehler beim Laden der Nachrichten:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
        return;
    }
});

/**
 * POST /messages
 * Fügt eine neue Nachricht in den Chat ein (und über Socket.io broadcastest du sie separat)
 * Body: { chatId: string, senderId: string, content: string }
 */
chatRouter.post("/messages", authenticateJWT, async (req: Request, res: Response) => {
    const { chatId, senderId, content } = req.body;

    if (!chatId || !senderId || !content) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "chatId, senderId und content sind erforderlich" });
        return;
    }

    try {
        const insertRes = await pool.query(
            `
      INSERT INTO message (chat_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
            [chatId, senderId, content]
        );
        // Die echte Nachricht wird über Socket.IO an alle Clients gesendet (in deinem io.on-Handler).
        res.status(StatusCodes.CREATED).json({ message: insertRes.rows[0] });
        return;
    } catch (err) {
        console.error("Fehler beim Einfügen einer Nachricht:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
        return;
    }
});