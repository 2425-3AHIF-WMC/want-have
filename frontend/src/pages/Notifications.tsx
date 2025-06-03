import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface NotificationItem {
    id: string;
    type: string;
    message: string;
    created_at: string;
    seen: boolean;
}

const Notifications: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) {
                setError("Du musst eingeloggt sein, um Benachrichtigungen zu sehen.");
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get<NotificationItem[]>(
                    `${process.env.REACT_APP_API_URL}/notifications`,
                    {
                        withCredentials: true, // JWT-Cookie mitsenden
                    }
                );
                setNotifications(res.data);
            } catch (err: any) {
                console.error("Fehler beim Laden der Notifications:", err);
                setError("Fehler beim Laden der Benachrichtigungen.");
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [user]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="marktx-container py-8 text-center text-gray-500">
                    <p>Lade Benachrichtigungen …</p>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="marktx-container py-8 text-center text-red-600">
                    <p>{error}</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="marktx-container py-8">
                <h1 className="text-2xl font-bold mb-6">📬 Benachrichtigungen</h1>

                {notifications.length === 0 ? (
                    <div className="text-gray-500">Keine Benachrichtigungen vorhanden.</div>
                ) : (
                    <ul className="space-y-4">
                        {notifications.map((notif) => (
                            <li
                                key={notif.id}
                                className={`p-4 border rounded-lg ${
                                    notif.seen ? "bg-white" : "bg-marktx-blue-50"
                                }`}
                            >
                                <div className="flex justify-between">
                                    <p className="font-medium">{notif.message}</p>
                                    <span className="text-xs text-gray-400">
                    {new Date(notif.created_at).toLocaleString("de-DE", {
                        dateStyle: "short",
                        timeStyle: "short",
                    })}
                  </span>
                                </div>
                                <span className="text-sm text-gray-500">Typ: {notif.type}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
            <Footer />
        </>
    );
};

export default Notifications;
