
import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    chat_id: string;
    created_at: string;
}

interface ChatComponentProps {
    chatId: string;
    userId: string;
    chatPartner: {
        id: string;
        name: string;
        avatar?: string;
        isOnline?: boolean;
    };
}

const ChatComponent: React.FC<ChatComponentProps> = ({ chatId, userId, chatPartner }) => {
    // Nachrichten des aktuellen Chats
    const [messages, setMessages] = useState<Message[]>([]);
    // Eingabe für neue Nachricht
    const [newMessage, setNewMessage] = useState("");
    // Socket-Verbindung als Ref
    const socketRef = useRef<Socket | null>(null);
    // Ladezustand
    const [loadingMessages, setLoadingMessages] = useState(false);
    // Status beim Senden (Optimistic UI)
    const [sendingMessage, setSendingMessage] = useState(false);
    // Ref für automatisches Scrollen
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    // Fehler beim Laden
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Socket-URL aus Umgebungsvariable
        const socketURL = process.env.REACT_APP_SOCKET_URL!;
        const socket = io(socketURL, {
            withCredentials: true
        });
        socketRef.current = socket;

        socket.on("connect_error", (err) => {
            console.error("Socket-Verbindungsfehler:", err);
            setError("Verbindung zum Chat-Server fehlgeschlagen.");
        });

        socket.on("new-message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        // Alte Subscription/Kanal verlassen
        socket.emit("leave-chat", chatId);

        // Nachrichten zurücksetzen & neu laden
        setMessages([]);
        setLoadingMessages(true);
        setError(null);

        // Socket dem Chat beitreten lassen
        socket.emit("join-chat", chatId);

        // Nachrichten vom Server laden
        axios
            .get<Message[]>(`${process.env.REACT_APP_API_URL}/messages/${chatId}`, {
                withCredentials: true
            })
            .then((res) => {
                setMessages(res.data);
            })
            .catch((err) => {
                console.error("Fehler beim Laden der Nachrichten:", err);
                setError("Fehler beim Laden der Nachrichten.");
            })
            .finally(() => {
                setLoadingMessages(false);
            });

        // Clean-Up beim Chatwechsel
        return () => {
            socket.emit("leave-chat", chatId);
        };
    }, [chatId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = async () => {
        const trimmed = newMessage.trim();
        if (!trimmed) return;

        const optimisticMessage: Message = {
            id: "temp-" + Date.now(),
            content: trimmed,
            sender_id: userId,
            chat_id: chatId,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage("");
        setSendingMessage(true);

        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/messages`,
                {
                    chatId,
                    senderId: userId,
                    content: trimmed,
                },
                { withCredentials: true }
            );
            // Server sendet per Socket.IO den eigentlichen „new-message“-Event, sodass hier
            // die optimistische Nachricht durch die echte Nachricht mit „richtiger ID“ aktualisiert wird.
            setSendingMessage(false);
        } catch (err) {
            console.error("Nachricht konnte nicht gesendet werden:", err);
            setSendingMessage(false);
            // Optimistische Nachricht entfernen
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
            alert("Nachricht konnte nicht gesendet werden.");
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    if (loadingMessages) {
        return (
            <div className="h-full flex items-center justify-center text-marktx-gray-400 p-4">
                <p>Nachrichten werden geladen...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-red-600 p-4">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b p-3 flex items-center bg-white">
                <Avatar className="h-10 w-10 mr-3">
                    {chatPartner.avatar ? (
                        <AvatarImage src={chatPartner.avatar} alt={chatPartner.name} />
                    ) : (
                        <AvatarFallback className="bg-marktx-blue-200 text-marktx-blue-700">
                            {chatPartner.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div>
                    <div className="font-medium">{chatPartner.name}</div>
                    <div className="flex items-center text-xs text-marktx-gray-500">
                        <div className="relative h-2 w-2 rounded-full mr-1">
                            <div
                                className={`absolute inset-0 rounded-full ${
                                    chatPartner.isOnline ? "bg-green-500" : "bg-marktx-gray-300"
                                }`}
                            />
                            {chatPartner.isOnline && (
                                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                            )}
                        </div>
                        {chatPartner.isOnline ? "Online" : "Offline"}
                    </div>
                </div>
            </div>

            {/* Nachrichtenbereich */}
            <div className="flex-1 overflow-y-auto p-4 bg-marktx-gray-50">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-marktx-gray-400 p-4 text-center">
                        <p>Beginne die Konversation mit {chatPartner.name}.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.sender_id === userId ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[70%] sm:max-w-[90%] px-4 py-2 rounded-lg transition-colors duration-200 ${
                                        message.sender_id === userId
                                            ? "bg-marktx-blue-600 text-white hover:bg-marktx-blue-700"
                                            : "bg-white border border-marktx-gray-200 hover:bg-marktx-gray-100"
                                    }`}
                                >
                                    {/* Markdown & Emoji Support via react-markdown (sicher mit rehype-sanitize) */}
                                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                        {message.content
                                            .replace(/:\)/g, "😊")
                                            .replace(/:\(/g, "😞")
                                            .replace(/:D/g, "😄")
                                            .replace(/<3/g, "❤️")}
                                    </ReactMarkdown>

                                    {/* Zeitstempel */}
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
                        <div ref={messagesEndRef} />
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
                        disabled={sendingMessage}
                    />
                    <Button
                        onClick={sendMessage}
                        className="btn-primary"
                        disabled={sendingMessage}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;
