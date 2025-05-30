import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import pool from '../db/pool';
import { StatusCodes } from 'http-status-codes';

export const recommendationRouter = Router();

recommendationRouter.get('/personalized', authenticateJWT, async (req, res) => {
    const userId = req.user!.id;

    try {
        // 1. Letzte angesehenen Anzeigen holen
        const viewedAds = await pool.query(`
      SELECT ad_id FROM ad_views
      WHERE user_id = $1
      ORDER BY viewed_at DESC
      LIMIT 20
    `, [userId]);

        const adIds = viewedAds.rows.map(row => row.ad_id);
        if (adIds.length === 0) {
            res.status(StatusCodes.OK).json({ ads: [] }); // Noch nichts gesehen
            return;
        }

        const categoryResult = await pool.query(`
      SELECT category, COUNT(*) AS freq
      FROM ad
      WHERE id = ANY($1)
      GROUP BY category
      ORDER BY freq DESC
      LIMIT 2
    `, [adIds]);

        const topCategories = categoryResult.rows.map(row => row.category);
        const [cat1, cat2] = topCategories;

        const recommendations = await pool.query(`
      SELECT *,
        (CASE 
          WHEN category = $2 THEN 50
          WHEN category = $3 THEN 25
          ELSE 0
        END) +
        (EXTRACT(EPOCH FROM NOW() - created_at) / 3600) * -0.5 AS score
      FROM ad
      WHERE id NOT IN (
        SELECT ad_id FROM ad_views WHERE user_id = $1
      )
      ORDER BY score DESC
      LIMIT 20
    `, [userId, cat1, cat2]);

        res.status(StatusCodes.OK).json({ ads: recommendations.rows });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Fehler bei Empfehlungen', details: err });
    }
});
