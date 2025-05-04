import express from 'express';
import pool from './database/pool';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;
const databaseUrl = process.env.DATABASE_URL;

app.use(express.json());

if (!databaseUrl) {
    console.error('Database URL is missing from environment variables.');
    process.exit(1);
}

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "users"');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database query failed');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
