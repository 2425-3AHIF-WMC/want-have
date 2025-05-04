import express from 'express';
import pool from '../db/pool';
import {StatusCodes} from "http-status-codes";

const router = express.Router();

// Get all chats for a user
router.get('/:userId', async (req, res) => {
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
router.post('/', async (req, res) => {
    const { user1_id, user2_id } = req.body;

    // Validate input fields
    if (!user1_id || !user2_id) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'User1 and User2 are required' });
        return;
    }

    // Check if both users exist
    try {
        const user1Check = await pool.query('SELECT * FROM users WHERE id = $1', [user1_id]);
        const user2Check = await pool.query('SELECT * FROM users WHERE id = $1', [user2_id]);

        if (user1Check.rows.length === 0 || user2Check.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'One or both users not found' });
            return;
        }

        // Insert the new chat
        const result = await pool.query(
            'INSERT INTO chats (user1_id, user2_id) VALUES ($1, $2) RETURNING *',
            [user1_id, user2_id]
        );
        res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create chat' });
    }
});

export default router;
