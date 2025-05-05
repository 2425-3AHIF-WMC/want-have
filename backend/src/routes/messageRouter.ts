import {Router, Request, Response, NextFunction} from 'express';
import pool from '.././db/pool';
import jwt, {JwtPayload} from 'jsonwebtoken';
import {StatusCodes} from "http-status-codes";
import dotenv from 'dotenv';

dotenv.config();

export const messageRouter = Router();
const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
}

// Middleware to authenticate the user
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication required' });
        return;
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid or expired token!' });
            return;
        }

        req.user = user;
        next();
    });
}

// POST to send a message as the authenticated user
messageRouter.post('/:chatId', authenticateUser, async (req, res) => {
    const { content } = req.body;
    const { chatId } = req.params;
    const { id: sender_id } = req.user;  // User's id from the token

    if (!content) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Message content is required' });
        return;
    }

    try {
        // Check if the user is part of the chat (chat must contain sender_id or user_id)
        const chat = await pool.query(
            `SELECT * FROM chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
            [chatId, sender_id]
        );

        if (chat.rows.length === 0) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'You are not part of this chat' });
            return;
        }

        // Insert the new message into the database
        const newMessage = await pool.query(
            `INSERT INTO messages (chat_id, sender_id, content) 
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
messageRouter.get('/:chatId', authenticateUser, async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await pool.query(
            `SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC`,
            [chatId]
        );
        res.status(StatusCodes.OK).json({ messages: messages.rows });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error', details: err });
    }
});
