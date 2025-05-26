import { Router } from "express";

import pool from '../db/pool';

export const reportRouter = Router();

reportRouter.post('/', async (req, res) => {
    const { username, category, description } = req.body;

    if (!category || !description) {
        res.status(400).json({ error: "Kategorie und Beschreibung sind erforderlich." });
    }

    try {
        await pool.query(
            "INSERT INTO reports (username, category, description, created_at) VALUES ($1, $2, $3, NOW())",
            [username || null, category, description]
        );
        res.status(201).json({ message: "Meldung gespeichert" });
    } catch (err) {
        console.error("Fehler beim Speichern der Meldung:", err);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});
