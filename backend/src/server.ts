import express from 'express';
import { userRouter } from "./routes/userRouter";
import { adRouter } from "./routes/adRouter";
import { chatRouter } from "./routes/chatRouter";
import { messageRouter } from "./routes/messageRouter";
import { reportRouter } from "./routes/reportRouter";
import { loginRouter } from "./routes/loginRouter";
import { purchaseRequestRouter } from "./routes/purchaseRequestRouter";
import { recommendationRouter } from "./routes/recommendationRouter";

import http from "http";
import { Server } from "socket.io";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import pool from "./db/pool";
import cors from "cors";
import fileUpload, { UploadedFile } from "express-fileupload";
import path from "path";
import fs from "fs";
import dotenv from 'dotenv';
import { keycloak } from "./middleware/keycloak";
import { authenticateJWT } from "./middleware/auth";
import {initSocket} from "../socket/broadcast";
import {notificationRouter} from "./routes/notificationRouter";
import {imageRouter} from "./routes/imageRouter";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL oder SUPABASE_KEY ist nicht definiert');
}

const app = express();
const port = process.env.PORT || 3000;

let supabase: SupabaseClient;
supabase = createClient(supabaseUrl, supabaseKey);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL ?? "*",
        methods: ["GET", "POST", "DELETE", "PATCH"]
    }
});

app.use(fileUpload());           // Dateiupload aktivieren
app.use(express.json());
app.use(cors({                   // Nur erlaubte Ursprünge (z.B. Frontend-Domain)
    origin: process.env.CLIENT_URL ?? "*",
    credentials: true
}));

app.use(keycloak.middleware());

app.post("/upload", authenticateJWT, (req, res) => {
        if (!req.files || !req.files.datei) {
            res.status(400).send("Keine Datei hochgeladen");
            return;
        }

        const datei = req.files.datei as UploadedFile;
        // Pfad-Traversal verhindern:
        const safeName = path.basename(datei.name);
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const pfad = path.join(uploadDir, `${Date.now()}-${safeName}`);

        try {
            fs.writeFileSync(pfad, datei.data);
            res.status(201).json({ message: "Datei gespeichert", filename: path.basename(pfad) });
            return;
        } catch (err) {
            console.error("Fehler beim Datei-Upload:", err);
            res.status(500).json({ error: "Interner Serverfehler beim Speichern der Datei" });
            return;
        }
    }
);

initSocket(io);

io.on("connection", (socket) => {
    console.log("🔌 Socket verbunden:", socket.id);

    socket.on("user-online", (userId: string) => {
        // userId → socket.id im Map speichern
        const onlineUsers: Map<string, string> = (global as any).onlineUsers || new Map();
        onlineUsers.set(userId, socket.id);
        (global as any).onlineUsers = onlineUsers;
        console.log(`✅ ${userId} ist online`);
        io.emit("user-status", { userId, status: "online" });
    });

    socket.on("join-chat", (chatId: string) => {
        console.log(`User ${socket.id} tritt Chat ${chatId} bei`);

        // Vorherigen Supabase-Channel abschließen, falls vorhanden
        if (socket.data.supabaseChannel) {
            supabase.removeChannel(socket.data.supabaseChannel);
            delete socket.data.supabaseChannel;
        }

        socket.join(chatId);

        const channel = supabase
            .channel(`chat-${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`
                },
                (payload) => {
                    console.log("Neue Nachricht in Chat", chatId, payload.new);
                    io.to(chatId).emit("new-message", payload.new);
                }
            )
            .subscribe();

        socket.data.supabaseChannel = channel;
    });

    socket.on("leave-chat", (chatId: string) => {
        console.log(`User ${socket.id} verlässt Chat ${chatId}`);
        socket.leave(chatId);
        if (socket.data.supabaseChannel) {
            supabase.removeChannel(socket.data.supabaseChannel);
            delete socket.data.supabaseChannel;
        }
    });

    socket.on("disconnect", async () => {
        console.log("❌ Socket getrennt:", socket.id);
        const onlineUsers: Map<string, string> = (global as any).onlineUsers;
        if (onlineUsers) {
            for (const [userId, sId] of onlineUsers.entries()) {
                if (sId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`❌ ${userId} ist offline`);
                    io.emit("user-status", { userId, status: "offline" });
                    break;
                }
            }
        }
        if (socket.data.supabaseChannel) {
            await supabase.removeChannel(socket.data.supabaseChannel).catch(err => {
                console.error("Fehler beim Entfernen des Supabase-Kanals:", err);
            });
            delete socket.data.supabaseChannel;
        }
    });

    socket.on("send-message", async (data) => {
        const { chatId, senderId, content } = data;
        if (!chatId || !senderId || !content) {
            console.error("Ungültige Nachrichtendaten:", data);
            return;
        }

        try {
            await pool.query(
                "INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3)",
                [chatId, senderId, content]
            );
        } catch (err) {
            console.error("Fehler beim Einfügen der Nachricht:", err);
        }
    });
});


app.use('/users', userRouter);
app.use('/ads', adRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);
app.use('/reports', reportRouter);
app.use('/login', loginRouter);
app.use('/requests', purchaseRequestRouter);
app.use('/recommendations', recommendationRouter);
app.use("/notifications", notificationRouter);
app.use("/images", imageRouter);

app.delete('/api/products/:id', authenticateJWT, async (req, res) => {
        const productId = req.params.id;
        const userId = req.user!.id; // aus dem JWT

        try {
            // 1) Besitzer-ID abfragen
            const { rows } = await pool.query(
                'SELECT owner_id FROM ad WHERE id = $1',
                [productId]
            );
            if (rows.length === 0) {
                res.status(404).json({ error: 'Anzeige nicht gefunden' });
                return;
            }
            const ownerId = rows[0].owner_id;
            if (ownerId !== userId) {
                res.status(403).json({ error: 'Nicht berechtigt, diese Anzeige zu löschen' });
                return;
            }

            await pool.query('DELETE FROM ad WHERE id = $1', [productId]);
            res.status(200).json({ success: true, message: 'Anzeige gelöscht' });
        } catch (err) {
            console.error('Fehler beim Löschen der Anzeige:', err);
            res.status(500).json({ error: 'Interner Serverfehler' });
            return;
        }
    }
);

if (process.env.ANON_KEY) {
    supabase = createClient("https://otrclrdtfqsjhuuxkhzk.supabase.co", process.env.ANON_KEY);
}

// Server starten
server.listen(port, () => {
    console.log(`🚀 Server läuft auf Port ${port}`);
});
