import express from 'express';
import {userRouter} from "./routes/userRouter";
import {adRouter} from "./routes/adRouter";
import {chatRouter} from "./routes/chatRouter";
import {messageRouter} from "./routes/messageRouter";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";
import pool from "./db/pool";

const app = express();
const port = process.env.PORT || 3000;
let supabase = createClient("", "");
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

app.use('/users', userRouter);
app.use('/ads', adRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);

if (process.env.ANON_KEY) {
    supabase = createClient("https://otrclrdtfqsjhuuxkhzk.supabase.co", process.env.ANON_KEY);
} else {
    throw new Error("undefined anon key");
}

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
            await pool.query(
                "INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3)",
                [chatId, senderId, content]
            );
        } catch (err) {
            console.error("Failed to insert message:", err);
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
