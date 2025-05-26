import Router from "express";
import pool from '../db/pool';
import {StatusCodes} from "http-status-codes";
import {authenticateJWT} from "../middleware/auth";

export const adRouter = Router();

// Get all ads
adRouter.get('/', authenticateJWT, async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ad ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch ads' });
    }
});

// Create a new ad
adRouter.post('/', authenticateJWT, async (req, res) => {
    const { title, description, price, owner_id, image_url} = req.body;

    // Validate input fields
    if (!title || !owner_id || !description) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Title, description and owner ID are required' });
        return;
    }

    const adPrice = typeof price === 'number' && price >= 0 ? price : 0;

    // Check if the user exists
    try {
        const userCheck = await pool.query('SELECT * FROM "user" WHERE id = $1', [owner_id]);
        if (userCheck.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
            return
        }

        // Insert the new ad
        const result = await pool.query(
            'INSERT INTO ad (title, description, price, owner_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, adPrice, owner_id, image_url || null] // image_url can be null
        );
        res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create ad' });
    }
});

// delete ad
adRouter.patch('/:id/sold', authenticateJWT, async (req, res) => {
    const ad_id = req.params.id;
    const user_id = req.user.id;

    try {
        const adCheck = await pool.query('SELECT * FROM ad WHERE id = $1 AND owner_id = $2', [ad_id, user_id]);
        if (adCheck.rowCount === 0) {
            res.status(StatusCodes.FORBIDDEN).json({ error: "You are not allowed to edit this ad" });
            return;
        }

        await pool.query('UPDATE ad SET sold = true WHERE id = $1', [ad_id]);
        res.status(StatusCodes.OK).json({ message: 'Ad marked as sold' });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update ad' });
    }
});

// edit ad
adRouter.patch('/:id', authenticateJWT, async (req, res) => {
    const ad_id = req.params.id;
    const user_id = req.user.id;
    const { title, description, price, image_url } = req.body;

    try {
        const adCheck = await pool.query('SELECT * FROM ad WHERE id = $1 AND owner_id = $2', [ad_id, user_id]);
        if (adCheck.rowCount === 0) {
            res.status(StatusCodes.FORBIDDEN).json({ error: "You are not allowed to edit this ad" });
            return;
        }

        const fields = [];
        const values = [];
        let idx = 1;

        if (title !== undefined) {
            fields.push(`title = $${idx++}`);
            values.push(title);
        }
        if (description !== undefined) {
            fields.push(`description = $${idx++}`);
            values.push(description);
        }
        if (price !== undefined) {
            fields.push(`price = $${idx++}`);
            values.push(price);
        }
        if (image_url !== undefined) {
            fields.push(`image_url = $${idx++}`);
            values.push(image_url);
        }

        if (fields.length === 0) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "No fields provided to update" });
            return;
        }

        values.push(ad_id);
        const query = `UPDATE ad SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const updateRes = await pool.query(query, values);

        res.status(StatusCodes.OK).json(updateRes.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update ad' });
    }
});
