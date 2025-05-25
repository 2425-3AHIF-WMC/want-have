import { Router } from 'express';
import pool from '../db/pool';
import { authenticateJWT } from '../middleware/auth';
import {StatusCodes} from "http-status-codes";

export const purchaseRequestRouter = Router();

// Buyer sends request to buy an ad
purchaseRequestRouter.post('/', authenticateJWT, async (req, res) => {
    const { ad_id } = req.body;
    const buyer_id = req.user.id;

    if (!ad_id) {
        res.status(StatusCodes.BAD_REQUEST).json({error: 'ad_id is required'});
        return;
    }
    try {
        // Get ad and seller info
        const adRes = await pool.query('SELECT owner_id FROM ad WHERE id = $1', [ad_id]);
        if (adRes.rowCount === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Ad not found' });
            return;
        }

        const seller_id = adRes.rows[0].owner_id;

        if (seller_id === buyer_id) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "You can't buy your own ad" });
            return;
        }

        // Check if a pending request already exists
        const existingReq = await pool.query(
            'SELECT * FROM purchase_request WHERE ad_id = $1 AND buyer_id = $2 AND status = $3',
            [ad_id, buyer_id, 'pending']
        );
        if ((existingReq?.rowCount || 0) > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'You already have a pending request for this ad' });
            return;
        }

        // Insert new request
        const insertRes = await pool.query(
            `INSERT INTO purchase_request (ad_id, buyer_id, seller_id, status) 
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
            [ad_id, buyer_id, seller_id]
        );

        res.status(StatusCodes.CREATED).json(insertRes.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
    }
});

// Seller fetches all purchase requests for their ads
purchaseRequestRouter.get('/', authenticateJWT, async (req, res) => {
    const seller_id = req.user.id;
    try {
        const requests = await pool.query(
            'SELECT pr.*, u.username as buyer_username, a.title as ad_title FROM purchase_requests pr ' +
            'JOIN users u ON pr.buyer_id = u.id ' +
            'JOIN ads a ON pr.ad_id = a.id ' +
            'WHERE pr.seller_id = $1 ORDER BY pr.created_at DESC',
            [seller_id]
        );

        res.json(requests.rows);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
    }
});

// Seller updates request status (accept/reject)
purchaseRequestRouter.patch('/:id', authenticateJWT, async (req, res) => {
    const seller_id = req.user.id;
    const request_id = req.params.id;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid status' });
        return;
    }

    try {
        // Prüfen, ob die Anfrage zum Verkäufer gehört
        const reqRes = await pool.query(
            'SELECT * FROM purchase_requests WHERE id = $1 AND seller_id = $2',
            [request_id, seller_id]
        );
        if (reqRes.rowCount === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Request not found' });
            return;
        }

        // Status updaten
        await pool.query('UPDATE purchase_request SET status = $1 WHERE id = $2', [status, request_id]);

        if (status === 'accepted') {
            const { ad_id, buyer_id } = reqRes.rows[0];
            
            // Prüfen, ob ein Chat zwischen Käufer und Verkäufer existiert
            const chatRes = await pool.query(
                `SELECT id FROM chat WHERE 
        (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
                [buyer_id, seller_id]
            );

            let chat_id;
            if ((chatRes?.rowCount || 0)  > 0) {
                chat_id = chatRes.rows[0].id;
            } else {
                // Falls noch kein Chat existiert, neuen anlegen
                const newChatRes = await pool.query(
                    `INSERT INTO chat (user1_id, user2_id) VALUES ($1, $2) RETURNING id`,
                    [buyer_id, seller_id]
                );
                chat_id = newChatRes.rows[0].id;
            }

            res.json({ message: 'Request accepted', chat_id });
            return;
        }

        // Für den Fall 'rejected'
        res.json({ message: 'Request rejected' });

    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
    }
});
