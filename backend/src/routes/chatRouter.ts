import Router from "express";
import pool from '../db/pool';
import {StatusCodes} from "http-status-codes";

export const chatRouter = Router();

// Get all chats for a user
chatRouter.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    // Check if the user exists
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
            return;
        }

        // Fetch chats for the user
        const result = await pool.query(
            `SELECT * FROM chats WHERE user1_id = $1 OR user2_id = $1`,
            [userId]
        );
        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch chats' });
    }
});

// Create new chat
chatRouter.post('/start', async (req, res) => {
    const { user1_id, user2_id } = req.body;
    if (!user1_id || !user2_id) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing user IDs' });
        return;
    }

    try {
        // Check if chat already exists
        const existingChat = await pool.query(
            `SELECT * FROM chats WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
            [user1_id, user2_id]
        );

        if (existingChat.rows.length > 0) {
            res.status(StatusCodes.OK).json({ chat: existingChat.rows[0] });
            return;
        }

        // Create new chat
        const newChat = await pool.query(
            `INSERT INTO chats (user1_id, user2_id) VALUES ($1, $2) RETURNING *`,
            [user1_id, user2_id]
        );

        res.status(StatusCodes.CREATED).json({ chat: newChat.rows[0] });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error', details: err });
    }
});

