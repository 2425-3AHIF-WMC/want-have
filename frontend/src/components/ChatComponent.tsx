import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface Message {
    id: string;
    text: string;
    sender: "user" | "other";
    timestamp: Date;
}

interface ChatComponentProps {
    chatPartner: {
        id: string;
        name: string;
        avatar?: string;
        isOnline?: boolean;
    };
    initialMessages?: Message[];
}

const ChatComponent = ({
                           chatPartner,
                           initialMessages = []
                       }: ChatComponentProps) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");

    const sendMessage = () => {
        if (newMessage.trim() === "") return;

        const message: Message = {
            id: Date.now().toString(),
            text: newMessage,
            sender: "user",
            timestamp: new Date()
        };

        setMessages([...messages, message]);
        setNewMessage("");

        // Hier würde später der API-Call erfolgen, um die Nachricht zu senden
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat-Header */}
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

            {/* Chat-Nachrichten */}
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
                                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                        message.sender === "user"
                                            ? "bg-marktx-blue-600 text-white"
                                            : "bg-white border border-marktx-gray-200"
                                    }`}
                                >
                                    <div className="break-words">{message.text}</div>
                                    <div
                                        className={`text-xs mt-1 text-right ${
                                            message.sender === "user"
                                                ? "text-marktx-blue-100"
                                                : "text-marktx-gray-400"
                                        }`}
                                    >
                                        {formatTime(message.timestamp)}
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