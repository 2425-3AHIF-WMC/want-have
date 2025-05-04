import express from 'express';
import pool from '../db/pool';
import {StatusCodes} from "http-status-codes";

const router = express.Router();

// Get all messages for a chat
router.get('/:chatId', async (req, res) => {
    const { chatId } = req.params;

    // Check if the chat exists
    try {
        const chatCheck = await pool.query('SELECT * FROM chats WHERE id = $1', [chatId]);
        if (chatCheck.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Chat not found' });
            return;
        }

        // Fetch messages for the chat
        const result = await pool.query(
            `SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC`,
            [chatId]
        );
        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch messages' });
    }
});

// Send a message
router.post('/', async (req, res) => {
    const { chat_id, sender_id, content } = req.body;

    // Validate input fields
    if (!chat_id || !sender_id || !content) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Chat ID, sender ID, and message content are required' });
        return;
    }

    // Check if the chat exists
    try {
        const chatCheck = await pool.query('SELECT * FROM chats WHERE id = $1', [chat_id]);
        if (chatCheck.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Chat not found' });
            return;
        }

        // Insert the new message
        const result = await pool.query(
            'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
            [chat_id, sender_id, content]
        );
        res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to send message' });
    }
});

export default router;
