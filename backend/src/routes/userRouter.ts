import Router from "express";
import pool from '../db/pool';
import {StatusCodes} from "http-status-codes";

export const userRouter = Router();

// Get all users
userRouter.get('/', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: 'Failed to fetch users'});
    }
});

userRouter.post('/', async (req, res) => {
    const { username, email, password_hash } = req.body;

    // Validate input fields
    if (!username || !email || !password_hash) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Username, email, and password are required' });
        return;
    }

    // Check if the email already exists in the db
    try {
        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email already exists' });
            return;
        }

        // Insert the new user
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [username, email, password_hash]
        );
        res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create user' });
    }
});