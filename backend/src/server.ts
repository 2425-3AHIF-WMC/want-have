import express from 'express';
import pool from './db/pool';
import {userRouter} from "./routes/userRouter";
import {adRouter} from "./routes/adRouter";
import {chatRouter} from "./routes/chatRouter";
import {messageRouter} from "./routes/messageRouter";
import {StatusCodes} from "http-status-codes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/users', userRouter);
app.use('/ads', adRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
