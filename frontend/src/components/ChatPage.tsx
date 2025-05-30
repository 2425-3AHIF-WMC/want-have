import { useParams } from "react-router-dom";
import ChatComponent from "./ChatComponent";
import { useEffect, useState } from "react";
import axios from "axios";

interface ChatPartner {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
}


const ChatPage = ({ userId }: { userId: string }) => {

    const { chatId } = useParams();
    console.log("useParams chatId:", chatId);

    const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);

    useEffect(() => {
        const fetchChatPartner = async () => {
            try {
                console.log("Lade ChatPartner für chatId:", chatId, "userId:", userId);
                const res = await axios.get(`http://localhost:3000/chats/${chatId}/partner`, {
                    params: { userId },
                });

                console.log("ChatPartner geladen:", res.data);
                setChatPartner(res.data);
            } catch (err) {
                console.error("Fehler beim Laden des Chatpartners:", err);
            }
        };

        if (chatId) {
            fetchChatPartner();
        }
    }, [chatId, userId]);


    if (!chatId || !chatPartner) {
        return <div className="p-4 text-center text-gray-500">Lade Chat ...</div>;
    }

    return (
        <div className="h-screen max-w-xl mx-auto border rounded-lg shadow-md overflow-hidden">
            <ChatComponent
                chatId={chatId}
                userId={userId}
                chatPartner={chatPartner}
            />
        </div>
    );
};

export default ChatPage;
