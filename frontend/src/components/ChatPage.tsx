
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatComponent from "../components/ChatComponent";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface ChatPartner {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
}

const ChatPage: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
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
                        withCredentials: true
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
        return <div className="p-4 text-center text-gray-500">Lade Chat …</div>;
    }
    if (error) {
        return <div className="p-4 text-center text-red-600">{error}</div>;
    }
    if (!chatId || !chatPartner) {
        return <div className="p-4 text-center text-gray-500">Chat konnte nicht geladen werden.</div>;
    }

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
