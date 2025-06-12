import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "../middleware/auth";
import pool from "../db/pool";

export const imageRouter = Router();

imageRouter.post("/", authenticateJWT, async (req: Request, res: Response) => {
    const { ad_id, url } = req.body;
    const user_id = req.user!.id;

    if (!ad_id || !url) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "ad_id and url are required" });
        return;
    }

    try {
        // Check if user owns the ad
        const adCheck = await pool.query("SELECT * FROM ad WHERE id = $1 AND owner_id = $2", [ad_id, user_id]);
        if (adCheck.rowCount === 0) {
            res.status(StatusCodes.FORBIDDEN).json({ error: "You are not the owner of this ad" });
            return;
        }

        const result = await pool.query(
            `INSERT INTO image (ad_id, url) VALUES ($1, $2) RETURNING *`,
            [ad_id, url]
        );

        res.status(StatusCodes.CREATED).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to add image" });
    }
});

// Get images by ad_id
imageRouter.get("/:adId", async (req: Request, res: Response) => {
    const { adId } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM image WHERE ad_id = $1 ORDER BY created_at`,
            [adId]
        );

        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch images" });
    }
});

// Delete image (only owner of ad can delete)
imageRouter.delete("/:imageId", authenticateJWT, async (req: Request, res: Response) => {
    const { imageId } = req.params;
    const user_id = req.user!.id;

    try {
        // Check if the image exists and belongs to an ad owned by the user
        const imageCheck = await pool.query(
            `SELECT i.* FROM image i
             JOIN ad a ON i.ad_id = a.id
             WHERE i.id = $1 AND a.owner_id = $2`,
            [imageId, user_id]
        );

        if (imageCheck.rowCount === 0) {
            res.status(StatusCodes.FORBIDDEN).json({ error: "Not authorized to delete this image" });
            return;
        }

        await pool.query(`DELETE FROM image WHERE id = $1`, [imageId]);

        res.status(StatusCodes.OK).json({ message: "Image deleted successfully" });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to delete image" });
    }
});
