import express from 'express';
import {userRouter} from "./routes/userRouter";
import {adRouter} from "./routes/adRouter";
import {chatRouter} from "./routes/chatRouter";
import {messageRouter} from "./routes/messageRouter";
import http from "http";
import { Server } from "socket.io";
import {createClient, SupabaseClient} from "@supabase/supabase-js";
import pool from "./db/pool";
import { reportRouter } from "./routes/reportRouter";
import cors from "cors";
import {keycloak, sessionMiddleware} from "./middleware/keycloak";
import {loginRouter} from "./routes/loginRouter";
import {purchaseRequestRouter} from "./routes/purchaseRequestRouter";
import dotenv from 'dotenv';
import {recommendationRouter} from "./routes/recommendationRouter";
import {initSocket} from "../socket/broadcast";
import fileUpload, { UploadedFile } from "express-fileupload";
import path from "path";
import fs from "fs";
import { PostgrestSingleResponse } from '@supabase/supabase-js';



dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL or SUPABASE_KEY is not defined');
}

const app = express();
const port = process.env.PORT || 3000;
let supabase: SupabaseClient;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use(fileUpload()) // Aktiviert Dateiupload
app.use(express.json());
app.use(cors());
app.use(sessionMiddleware);
app.use(keycloak.middleware({ logout: "/logout" }));
app.post("/upload", function (req, res) {
    if (!req.files || !req.files.datei) {
        res.status(400).send("Keine Datei hochgeladen");
        return;
    }

    const datei = req.files.datei as UploadedFile;

    const pfad = path.join(__dirname, "uploads", datei.name);

    fs.writeFileSync(pfad, datei.data);

    res.send("Datei gespeichert als: " + datei.name);
});

app.use('/users', userRouter);
app.use('/ads', adRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);
app.use('/reports', reportRouter);
app.use('/auth', loginRouter);
app.use('/requests', purchaseRequestRouter);
app.use('/recommendations', recommendationRouter);

if (process.env.SUPABASE_KEY && process.env.SUPABASE_URL) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
} else {
    throw new Error("undefined anon key");
}
const onlineUsers = new Map<string, string>(); // userId → socketId
initSocket(io);

io.on("connection", (socket) => {

    console.log("A user connected");

    socket.on("user-online", (userId: string) => {
        onlineUsers.set(userId, socket.id);
        console.log(`✅ ${userId} ist online`);
        io.emit("user-status", { userId, status: "online" });
    });

    socket.on("disconnect", async () => {
        for (const [userId, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                onlineUsers.delete(userId);
                console.log(`❌ ${userId} ist offline`);
                io.emit("user-status", { userId, status: "offline" });
                break;
            }
        }

        if (socket.data.supabaseChannel) {
            try {
                const result = await supabase.removeChannel(socket.data.supabaseChannel);
                console.log("Channel removed:", result);
            } catch (err) {
                console.error("Failed to remove channel:", err);
            }
        }
    });


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
app.post('/purchase-request/:adId', async (req, res) => {
    const adId = req.params.adId;
    const buyerId = req.body.buyerId;

    // 1. Anzeige abrufen, um Verkäufer herauszufinden
    const adResult = await supabase
        .from('ad')
        .select('user_id, title')
        .eq('id', adId)
        .single();

    if (adResult.error || !adResult.data) {
        res.status(404).send({ error: "Anzeige nicht gefunden" });
        return;
    }

    const sellerId = adResult.data.user_id;
    const adTitle = adResult.data.title;


    // 2. Eintrag in purchase_request
    const purchaseInsert = await supabase
        .from('purchase_request')
        .insert([{
            buyer_id: buyerId,
            ad_id: adId,
            seller_id: sellerId
        }])
        .select()
        .single();

    // 3. Benachrichtigung für Verkäufer
    await supabase
        .from('notification')
        .insert([{
            user_id: sellerId,
            type: 'purchase_request',
            related_id: purchaseInsert.data.id,
            message: `Du hast eine Anfrage für deine Anzeige "${adTitle}" erhalten.`,
        }]);

    res.send({ success: true });
});
app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;

    // Optional nur seine eigene Anzeige löschen kann

    const { error } = await supabase
        .from('ad')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('Fehler beim Löschen:', error);
        res.status(500).send({ error: 'Löschen fehlgeschlagen' });
        return;
    }

    res.send({ success: true, message: 'Anzeige gelöscht' });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
