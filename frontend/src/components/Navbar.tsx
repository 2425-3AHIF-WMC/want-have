import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useRef,
} from "react";
import {
    Bell,
    MessageSquare,
    Menu,
    X,
    User,
    LogIn,
} from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { keycloak } from "../services/keycloak"; // Keycloak importieren

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const Navbar = forwardRef((props, ref) => {
    const { user, logout, isLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    const navigate = useNavigate();
    const searchInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focusSearchInput() {
            searchInputRef.current?.focus();
        },
    }));

    const toggleMenu = () => setIsMenuOpen((open) => !open);

    // Chat-ID vom Server holen (wenn eingeloggt)
    useEffect(() => {
        if (!user) {
            setChatId(null);
            return;
        }

        const fetchChatId = async () => {
            try {
                // Token aktualisieren, falls kurz vor Ablauf
                await keycloak.updateToken(30);
                const token = keycloak.token;
                if (!token) throw new Error("Kein gültiger Token vorhanden");

                const res = await axios.get<{ chatId: string }>(`${API_BASE_URL}/chats/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                });
                setChatId(res.data.chatId);
            } catch (err) {
                console.error("Fehler beim Laden der ChatId:", err);
                alert("Fehler beim Laden der Chat: Bitte melde dich neu an.");
                setChatId(null);
            }
        };

        fetchChatId();
    }, [user]);

    // Neue Nachrichten & Benachrichtigungen abfragen
    useEffect(() => {
        if (!user) {
            setHasNewMessages(false);
            setHasNewNotifications(false);
            return;
        }

        const fetchBadges = async () => {
            try {
                await keycloak.updateToken(30);
                const token = keycloak.token;
                if (!token) throw new Error("Kein gültiger Token vorhanden");

                const [msgRes, notifRes] = await Promise.all([
                    axios.get<{ hasNew: boolean }>(`${API_BASE_URL}/messages/hasNewMessages`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE_URL}/notifications/`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setHasNewMessages(msgRes.data.hasNew);
                const unseenExists = notifRes.data.some((n: any) => !n.is_read);
                setHasNewNotifications(unseenExists);
            } catch (error) {
                console.error("Fehler beim Laden der Badges:", error);
                setHasNewMessages(false);
                setHasNewNotifications(false);
            }
        };

        fetchBadges();
    }, [user]);

    return (
        <nav className="bg-background shadow-sm sticky top-0 z-50">
            <div className="marktx-container">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-marktx-blue-600">
              Markt<span className="text-marktx-blue-700">X</span>
            </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!user ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => (window.location.href = "http://localhost:3001/login")}
                                aria-label="Login"
                                disabled={isLoading}
                            >
                                <LogIn size={20} className="text-foreground" />
                            </Button>
                        ) : (
                            <>
                                {/* Benachrichtigungen */}
                                <Button variant="ghost" size="icon" asChild>
                                    <Link to="/notifications" aria-label="Benachrichtigungen">
                                        <div className="relative">
                                            <Bell size={20} className="text-foreground" />
                                            {hasNewNotifications && (
                                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600" />
                                            )}
                                        </div>
                                    </Link>
                                </Button>

                                {/* Chat-Icon */}
                                <Button variant="ghost" size="icon" asChild>
                                    <Link
                                        to={chatId ? `/chat/${chatId}` : "#"}
                                        aria-label="Nachrichten"
                                        onClick={(e) => {
                                            if (!chatId) {
                                                e.preventDefault();
                                                alert("Bitte zuerst anmelden, um Nachrichten zu sehen!");
                                            }
                                        }}
                                    >
                                        <div className="relative">
                                            <MessageSquare size={20} className="text-foreground" />
                                            {hasNewMessages && (
                                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600" />
                                            )}
                                        </div>
                                    </Link>
                                </Button>

                                {/* Logout Button */}
                                <Button
                                    className="border border-border text-foreground hover:bg-muted rounded-md px-4 py-2"
                                    onClick={() => {
                                        logout();
                                        navigate("/");
                                    }}
                                >
                                    Logout
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={toggleMenu}>
                            {isMenuOpen ? (
                                <X size={24} className="text-foreground" />
                            ) : (
                                <Menu size={24} className="text-foreground" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden animate-fade-in bg-background border-t border-border">
                        <div className="flex flex-col space-y-2 py-3">
                            {!user ? (
                                <Link
                                    to="/auth/login"
                                    className="flex items-center px-4 py-2 text-marktx-blue-600 font-medium"
                                >
                                    <User size={20} className="mr-2" />
                                    Login
                                </Link>
                            ) : (
                                <>
                                    {/* Benachrichtigungen */}
                                    <Link
                                        to="/notifications"
                                        className="flex items-center px-4 py-2 relative text-foreground"
                                    >
                                        <Bell size={20} className="mr-2" />
                                        Benachrichtigungen
                                        {hasNewNotifications && (
                                            <span className="absolute top-3 right-4 block h-2 w-2 rounded-full bg-red-600" />
                                        )}
                                    </Link>

                                    {/* Chat */}
                                    <Link
                                        to={chatId ? `/chat/${chatId}` : "#"}
                                        className="flex items-center px-4 py-2 relative text-foreground"
                                        onClick={(e) => {
                                            if (!chatId) {
                                                e.preventDefault();
                                                alert("Bitte zuerst anmelden, um Nachrichten zu sehen!");
                                            }
                                        }}
                                    >
                                        <MessageSquare size={20} className="mr-2" />
                                        Nachrichten
                                        {hasNewMessages && (
                                            <span className="absolute top-3 right-4 block h-2 w-2 rounded-full bg-red-600" />
                                        )}
                                    </Link>

                                    {/* Logout Button */}
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate("/");
                                        }}
                                        className="flex items-center px-4 py-2 text-red-600 font-medium"
                                    >
                                        <X size={20} className="mr-2" />
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
});

export default Navbar;
