import express from 'express';
import {userRouter} from "./routes/userRouter";
import {adRouter} from "./routes/adRouter";
import {chatRouter} from "./routes/chatRouter";
import {messageRouter} from "./routes/messageRouter";
import {reportRouter} from "./routes/reportRouter";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";
import pool from "./db/pool";

const app = express();
const port = process.env.PORT || 3000;

let supabase = createClient("", ""); // später initialisiert

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

// REST-API-Routen
app.use('/users', userRouter);
app.use('/ads', adRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);
app.use('/reports', reportRouter);

if (process.env.ANON_KEY) {
    supabase = createClient("https://otrclrdtfqsjhuuxkhzk.supabase.co", process.env.ANON_KEY);
} else {
    throw new Error("undefined anon key");
}

// Socket.IO Events
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join-chat", (chatId: string) => {
        console.log(`User joined chat ${chatId}`);
        socket.join(chatId);

        const channel = supabase.channel(`chat-${chatId}`);

        channel
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`
                },
                (payload) => {
                    console.log("New message for chat", chatId, payload.new);
                    io.to(chatId).emit("new-message", payload.new);
                }
            )
            .subscribe();

        socket.data.supabaseChannel = channel;
    });

    socket.on("disconnect", async () => {
        console.log("A user disconnected");

        if (socket.data.supabaseChannel) {
            try {
                const result = await supabase.removeChannel(socket.data.supabaseChannel);
                console.log("Channel removed:", result);
            } catch (err) {
                console.error("Failed to remove channel:", err);
            }
        }
    });

    socket.on("send-message", async (data) => {
        const { chatId, senderId, content } = data;

        if (!chatId || !senderId || !content) {
            console.error("Invalid message data");
            return;
        }

        try {
            const result = await pool.query(
                "INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
                [chatId, senderId, content]
            );

            const newMessage = result.rows[0];
            io.to(chatId).emit("new-message", newMessage);

        } catch (err) {
            console.error("Failed to insert message:", err);
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
