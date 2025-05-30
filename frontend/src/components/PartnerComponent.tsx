import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

type ChatPartner = {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
};

const PartnerComponent = () => {
    const { chatId } = useParams();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("userId");
    const [partner, setPartner] = useState<ChatPartner | null>(null);

    useEffect(() => {
        const fetchPartner = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/chats/${chatId}/partner?userId=${userId}`);
                setPartner(response.data);
            } catch (error) {
                console.error("Fehler beim Laden des Chat-Partners:", error);
            }
        };

        if (chatId && userId) {
            fetchPartner();
        }
    }, [chatId, userId]);

    if (!partner) return <div>Lade Partnerdaten...</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Chat-Partner</h2>
            <p>Name: {partner.name}</p>
            <p>ID: {partner.id}</p>
            {partner.avatar && <img src={partner.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />}
            <p>Status: {partner.isOnline ? "Online" : "Offline"}</p>
        </div>
    );
};

export default PartnerComponent;
