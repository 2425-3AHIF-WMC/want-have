import Router from "express";
import pool from '../db/pool';
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "../middleware/auth";
import { Request, Response } from 'express';

export const adRouter = Router();

// Get all ads
adRouter.get('/', authenticateJWT, async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM ad ORDER BY created_at DESC');
        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch ads' });
    }
});

// Create a new ad
adRouter.post('/', authenticateJWT, async (req: Request, res: Response) => {
    const { title, description, price, owner_id, image_urls } = req.body;

    if (!title || !owner_id || !description) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Title, description and owner ID are required' });
        return;
    }

    const adPrice = typeof price === 'number' && price >= 0 ? price : 0;

    try {
        const userCheck = await pool.query('SELECT * FROM "user" WHERE id = $1', [owner_id]);
        if (userCheck.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
            return;
        }

        const result = await pool.query(
            'INSERT INTO ad (title, description, price, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, adPrice, owner_id]
        );

        const ad = result.rows[0];

        // Insert images if provided
        if (Array.isArray(image_urls)) {
            for (const url of image_urls) {
                await pool.query(
                    'INSERT INTO images (ad_id, url) VALUES ($1, $2)',
                    [ad.id, url]
                );
            }
        }

        res.status(StatusCodes.CREATED).json(ad);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create ad' });
    }
});

// Get one ad
adRouter.get('/:id', authenticateJWT, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    try {
        const result = await pool.query('SELECT * FROM ad WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Ad not found' });
            return;
        }

        // Track ad view
        await pool.query('INSERT INTO ad_view (user_id, ad_id) VALUES ($1, $2)', [userId, id]);

        // Get ad images
        const imagesResult = await pool.query('SELECT url FROM images WHERE ad_id = $1', [id]);
        const adWithImages = { ...result.rows[0], images: imagesResult.rows.map(row => row.url) };

        res.status(StatusCodes.OK).json(adWithImages);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch ad', details: err });
    }
});

// Mark ad as sold
adRouter.patch('/:id/sold', authenticateJWT, async (req: Request, res: Response) => {
    const ad_id = req.params.id;
    const user_id = req.user!.id;

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

// Edit ad (not image editing for now)
adRouter.patch('/:id', authenticateJWT, async (req: Request, res: Response) => {
    const ad_id = req.params.id;
    const user_id = req.user!.id;
    const { title, description, price } = req.body;

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
