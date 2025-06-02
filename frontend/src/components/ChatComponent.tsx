import React, { useEffect, useRef, useState } from "react";
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
    userId: string;
    chatPartner: {
        id: string;
        name: string;
        avatar?: string;
        isOnline?: boolean;
    };
}

const ChatComponent = ({ chatId, userId, chatPartner }: ChatComponentProps) => {
    // Nachrichten des aktuellen Chats
    const [messages, setMessages] = useState<Message[]>([]);

    // Eingabefeld der neuen Nachricht
    const [newMessage, setNewMessage] = useState("");

    // Socket-Verbindung wird als Ref gehalten, da sie sich nicht mit jedem Render ändert
    const socketRef = useRef<Socket | null>(null);

    // Ladezustand für Nachrichten (für Ladeanzeige)
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Status der Nachricht beim Senden (für Optimistic UI)
    const [sendingMessage, setSendingMessage] = useState(false);

    // Referenz auf das Ende der Nachrichtenliste für automatisches Scrollen
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // --- 1. Socket-Verbindung und Fehlerhandling verbessern ---
    useEffect(() => {
        // Socket nur einmal aufbauen
        const socket = io("http://localhost:3000");

        // Socket in Ref speichern
        socketRef.current = socket;

        // Fehlerhandling: auf Verbindungsfehler reagieren
        socket.on("connect_error", (err) => {
            console.error("Socket Verbindungsfehler:", err);
        });

        // Nachrichten empfangen und in den State einfügen
        socket.on("new-message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Beim Verlassen der Komponente Socket schließen
        return () => {
            socket.disconnect();
        };
    }, []);

    // --- 2. Mehrere Chats unterstützen / Chat wechseln ---
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        // Alte Nachrichten löschen beim Chatwechsel
        setMessages([]);

        // Ladezustand setzen
        setLoadingMessages(true);

        // Join neuen Chat (Server soll "leave" vom alten Chat erkennen und machen)
        socket.emit("join-chat", chatId);

        // Nachrichten vom Server laden
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/messages/${chatId}`);
                setMessages(response.data);
            } catch (err) {
                console.error("Fehler beim Laden der Nachrichten:", err);
            } finally {
                setLoadingMessages(false);
            }
        };
        fetchMessages();

        // Clean-Up beim Chatwechsel: Verlassen des alten Chats
        return () => {
            socket.emit("leave-chat", chatId);
        };
    }, [chatId]);

    // --- 3. Automatisches Scrollen zu neuen Nachrichten ---
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // --- 4. Nachricht senden mit Optimistic UI und Fehlerhandling ---
    const sendMessage = async () => {
        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage) return;

        // Optimistic UI: Nachricht direkt anzeigen (ohne id, nur temporär)
        const optimisticMessage: Message = {
            id: "temp-" + Date.now(),
            content: trimmedMessage,
            sender_id: userId,
            chat_id: chatId,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage("");
        setSendingMessage(true);

        try {
            // Nachricht an Server senden
            await axios.post(`http://localhost:3000/messages`, {
                chatId,
                senderId: userId,
                content: trimmedMessage,
            });

            // Socket-Event senden (damit andere Clients aktualisiert werden)
            socketRef.current?.emit("send-message", {
                chatId,
                senderId: userId,
                content: trimmedMessage,
            });

            // Sending abgeschlossen
            setSendingMessage(false);
        } catch (err) {
            console.error("Nachricht konnte nicht gesendet werden:", err);
            setSendingMessage(false);
            // Optional: Optimistic Nachricht zurücknehmen oder Fehleranzeige ergänzen
            setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
            alert("Nachricht konnte nicht gesendet werden.");
        }
    };

    // --- 5. Formatierung von Zeit (z.B. 13:45) ---
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // --- 6. Nachrichten mit Markdown und Emojis rendern ---
    // (Minimaler Support: einfache Ersetzung, kann durch Bibliothek wie 'marked' oder 'react-markdown' ersetzt werden)
    const renderMessageContent = (content: string) => {
        // Beispiel: Emojis durch Unicode ersetzen (nur ein kleiner Ausschnitt)
        const emojiMap: Record<string, string> = {
            ":)": "😊",
            ":(": "😞",
            ":D": "😄",
            "<3": "❤️",
        };
        let rendered = content;
        Object.entries(emojiMap).forEach(([k, v]) => {
            rendered = rendered.split(k).join(v);
        });

        // Markdown ersetzen (fett und kursiv)
        rendered = rendered
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **fett**
            .replace(/\*(.*?)\*/g, "<em>$1</em>"); // *kursiv*

        // Rendern als React-Element mit dangerouslySetInnerHTML (Achtung: hier keine Sicherheit gegen XSS)
        return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header mit Avatar und Online-Status */}
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
                {/* Ladeanzeige, falls Nachrichten laden */}
                {loadingMessages ? (
                    <div className="h-full flex items-center justify-center text-marktx-gray-400 text-center p-4">
                        <p>Nachrichten werden geladen...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-marktx-gray-400 text-center p-4">
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
                                    {/* Nachricht mit Markdown und Emoji gerendert */}
                                    {renderMessageContent(message.content)}

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
                        {/* Referenz zum automatischen Scrollen */}
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
                        disabled={sendingMessage} // Button & Input beim Senden deaktivieren
                    />
                    <Button onClick={sendMessage} className="btn-primary" disabled={sendingMessage}>
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;
