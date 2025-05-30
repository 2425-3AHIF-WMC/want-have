import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const MessagesList = () => {
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axios.get("http://localhost:3000/chats/user/1"); // HARDCODED user ID
                setChats(response.data);
            } catch (error) {
                console.error("Fehler beim Laden der Chats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    if (loading) return <div>Lade Chats...</div>;

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