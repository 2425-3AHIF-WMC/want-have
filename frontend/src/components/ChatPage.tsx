// ───────────────────────────────────────────────────────────────────────────────
// Datei: src/components/ChatPage.tsx
// ───────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ChatComponent from "./ChatComponent";

interface ChatPartner {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
}

const ChatPage: React.FC = () => {
    // 1) chatId aus der URL holen
    const { chatId } = useParams<{ chatId: string }>();
    // 2) Benutzer aus AuthContext holen
    const { user } = useAuth();

    const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChatPartner = async () => {
            if (!chatId || !user) {
                setError("Chat oder Benutzer nicht definiert.");
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get<ChatPartner>(
                    `${process.env.REACT_APP_API_URL}/chats/${chatId}/partner`,
                    {
                        params: { userId: user.id },
                        withCredentials: true,
                    }
                );
                setChatPartner(res.data);
            } catch (err) {
                console.error("Fehler beim Laden des Chatpartners:", err);
                setError("Chat nicht gefunden oder du bist nicht autorisiert.");
            } finally {
                setLoading(false);
            }
        };

        fetchChatPartner();
    }, [chatId, user]);

    if (loading) {
        return <div className="p-4 text-center text-foreground">Lade Chat …</div>;
    }
    if (error) {
        return <div className="p-4 text-center text-marktx-accent-red">{error}</div>;
    }
    if (!chatId || !chatPartner) {
        return <div className="p-4 text-center text-foreground">Chat konnte nicht geladen werden.</div>;
    }

    // Sobald chatPartner, chatId und user vorhanden sind, rendern wir ChatComponent
    return (
        <div className="h-screen max-w-xl mx-auto border rounded-lg shadow-md overflow-hidden">
            <ChatComponent
                chatId={chatId}
                userId={user!.id}
                chatPartner={chatPartner}
            />
        </div>
    );
};

export default ChatPage;
