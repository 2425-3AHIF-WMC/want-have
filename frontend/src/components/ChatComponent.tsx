import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    chat_id: string;
    created_at: string;
}

interface ChatComponentProps {
    chatId: string;
    userId: string; // aktueller Benutzer-ID (sender)
    chatPartner: {
        id: string;
        name: string;
        avatar?: string;
        isOnline?: boolean;
    };
}

const socket: Socket = io("http://localhost:3000"); // Passe URL an dein Backend an

const ChatComponent = ({ chatId, userId, chatPartner }: ChatComponentProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        // In deinem ChatComponent.tsx
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/messages/${chatId}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Nachrichten konnten nicht geladen werden:", err);
            }
        };

        const sendMessage = async () => {
            if (!newMessage.trim()) return;

            try {
                await axios.post(`http://localhost:3000/messages`, {
                    chatId,
                    senderId: userId,
                    content: newMessage.trim()
                });
                setNewMessage("");
            } catch (err) {
                console.error("Nachricht konnte nicht gesendet werden:", err);
            }
        };

        fetchMessages();

        // Socket.IO Verbindung
        socket.emit("join-chat", chatId);
        socket.on("new-message", (message: Message) => {
            if (isMounted) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            isMounted = false;
            controller.abort();
            socket.off("new-message");
            socket.emit("leave-chat", chatId); // Falls dein Backend das unterstützt
        };
    }, [chatId]);

    const sendMessage = () => {
        if (newMessage.trim() === "") return;

        // Nachricht an Backend senden via Socket
        socket.emit("send-message", {
            chatId,
            senderId: userId,
            content: newMessage.trim(),
        });

        setNewMessage("");
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b p-3 flex items-center bg-white">
                <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={chatPartner.avatar} alt={chatPartner.name} />
                    <AvatarFallback className="bg-marktx-blue-200 text-marktx-blue-700">
                        {chatPartner.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{chatPartner.name}</div>
                    <div className="flex items-center text-xs text-marktx-gray-500">
                        <div className={`h-2 w-2 rounded-full mr-1 ${chatPartner.isOnline ? "bg-green-500" : "bg-marktx-gray-300"}`}></div>
                        {chatPartner.isOnline ? "Online" : "Offline"}
                    </div>
                </div>
            </div>

            {/* Nachrichten */}
            <div className="flex-1 overflow-y-auto p-4 bg-marktx-gray-50">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-marktx-gray-400 text-center p-4">
                        <p>Beginne die Konversation mit {chatPartner.name}.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                        message.sender_id === userId
                                            ? "bg-marktx-blue-600 text-white"
                                            : "bg-white border border-marktx-gray-200"
                                    }`}
                                >
                                    <div className="break-words">{message.content}</div>
                                    <div
                                        className={`text-xs mt-1 text-right ${
                                            message.sender_id === userId
                                                ? "text-marktx-blue-100"
                                                : "text-marktx-gray-400"
                                        }`}
                                    >
                                        {formatTime(message.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Eingabebereich */}
            <div className="border-t p-3 bg-white">
                <div className="flex space-x-2">
                    <Input
                        placeholder="Schreibe eine Nachricht..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-grow"
                    />
                    <Button onClick={sendMessage} className="btn-primary">
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;
