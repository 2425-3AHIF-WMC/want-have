
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface Chat {
    id: string;
    partner_id: string;
    partner_name: string;
    last_message?: string;
}

const MessagesList: React.FC = () => {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChats = async () => {
            if (!user) {
                setError("Du musst eingeloggt sein, um Chats zu sehen.");
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get<Chat[]>(
                    `${process.env.REACT_APP_API_URL}/chats/user/${user.id}`,
                    { withCredentials: true }
                );
                setChats(res.data);
            } catch (err: any) {
                console.error("Fehler beim Laden der Chats:", err);
                setError("Fehler beim Laden der Chats.");
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [user]);

    if (loading) {
        return <div className="p-4 text-center">Lade Chats...</div>;
    }
    if (error) {
        return <div className="p-4 text-center text-red-600">Fehler: {error}</div>;
    }
    if (!chats.length) {
        return <div className="p-4 text-center">Keine Chats vorhanden.</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Meine Chats</h1>
            <div className="space-y-2">
                {chats.map((chat) => (
                    <Link
                        key={chat.id}
                        to={`/chat/${chat.id}`}
                        state={{ chatPartner: { id: chat.partner_id, name: chat.partner_name } }}
                        className="block p-3 border rounded-lg hover:bg-gray-50"
                    >
                        <div className="font-medium">{chat.partner_name}</div>
                        {chat.last_message && (
                            <div className="text-sm text-gray-500 truncate">
                                {chat.last_message}
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MessagesList;
