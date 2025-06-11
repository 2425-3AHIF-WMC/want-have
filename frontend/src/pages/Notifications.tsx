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
    is_read: boolean;
    related_id: string | null;
}

const Notifications: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
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
                    { withCredentials: true }
                );
                setNotifications(res.data);
            } catch (err) {
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
                <div className="marktx-container py-8 text-center text-foreground">
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
                <div className="marktx-container py-8 text-center text-marktx-accent-red">
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
                <h1 className="text-2xl font-bold mb-6 text-foreground">📬 Benachrichtigungen</h1>
                {notifications.length === 0 ? (
                    <div className="text-foreground">Keine Benachrichtigungen vorhanden.</div>
                ) : (
                    <ul className="space-y-4">
                        {notifications.map((notif) => (
                            <li
                                key={notif.id}
                                className={`p-4 border rounded-lg ${ notif.is_read ? "bg-background border-border" : "bg-marktx-blue-50 border-border" }`}

                            >
                                <div className="flex justify-between">
                                    <p className="font-medium text-foreground">{notif.message}</p>
                                    <span className="text-xs text-foreground">
                    {new Date(notif.created_at).toLocaleString("de-DE", {
                        dateStyle: "short",
                        timeStyle: "short",
                    })}
                  </span>
                                </div>
                                <span className="text-sm text-foreground">Typ: {notif.type}</span>
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
