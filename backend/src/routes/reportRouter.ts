import { Router } from "express";
import pool from '../db/pool';
import {StatusCodes} from "http-status-codes";

export const reportRouter = Router();

reportRouter.post('/', async (req, res) => {
    const { username, category, description } = req.body;

    if (!category || !description) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "category and description is required" });
    }

    try {
        await pool.query(
            "INSERT INTO reports (username, category, description, created_at) VALUES ($1, $2, $3, NOW())",
            [username || null, category, description]
        );
        res.status(StatusCodes.CREATED).json({ message: "report saved" });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
});
