import Router from "express";
import pool from '../db/pool';
import {StatusCodes} from "http-status-codes";

export const adRouter = Router();

// Get all ads
adRouter.get('/', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ad ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch ads' });
    }
});

// Create a new ad
adRouter.post('/', async (req, res) => {
    const { title, description, price, owner_id } = req.body;

    // Validate input fields
    if (!title || !owner_id) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Title and owner ID are required' });
        return;
    }

    // Check if the user exists
    try {
        const userCheck = await pool.query('SELECT * FROM "user" WHERE id = $1', [owner_id]);
        if (userCheck.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
            return
        }

        // Insert the new ad
        const result = await pool.query(
            'INSERT INTO ad (title, description, price, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, price, owner_id]
        );
        res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create ad' });
    }
});
