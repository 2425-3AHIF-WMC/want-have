import React, {
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
    useEffect
} from "react";
import { Bell, MessageSquare, Menu, X, User, Plus, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Navbar = forwardRef((props, ref) => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);

    // Badge-Zustände
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    const navigate = useNavigate();
    const searchInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focusSearchInput() {
            searchInputRef.current?.focus();
        }
    }));

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Chat-ID vom Server holen
    useEffect(() => {
        if (user) {
            axios
                .get<{ chatId: string }>(`${process.env.REACT_APP_API_URL}/chats/me`, {
                    withCredentials: true
                })
                .then((res) => {
                    setChatId(res.data.chatId);
                })
                .catch((err) => {
                    console.error("Fehler beim Laden der Chat-ID:", err);
                    setChatId(null);
                });
        } else {
            setChatId(null);
        }
    }, [user]);

    // Badge-Status abrufen: neue Messages & neue Notifications
    useEffect(() => {
        async function fetchBadgeStatus() {
            if (!user) {
                setHasNewMessages(false);
                setHasNewNotifications(false);
                return;
            }
            try {
                // 1) Neue Messages
                const resMessages = await axios.get<{ hasNew: boolean }>(
                    `${process.env.REACT_APP_API_URL}/api/hasNewMessages`,
                    { withCredentials: true }
                );
                setHasNewMessages(resMessages.data.hasNew);
            } catch (err) {
                console.error("Fehler beim Laden neuer Nachrichten:", err);
                setHasNewMessages(false);
            }
            try {
                // 2) Neue Notifications: Anfrage an /notifications?onlyUnseen=true
                const resNotifs = await axios.get<{ hasNew: boolean }>(
                    `${process.env.REACT_APP_API_URL}/notifications?onlyUnseen=true`,
                    { withCredentials: true }
                );
                setHasNewNotifications(resNotifs.data.hasNew);
            } catch (err) {
                console.error("Fehler beim Laden neuer Notifications:", err);
                setHasNewNotifications(false);
            }
        }
        fetchBadgeStatus();
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
                        {/* Login Icon (immer sichtbar) */}
                        <Button variant="ghost" size="icon" asChild>
                            <Link
                                to="/auth/login"
                                aria-label="Login"
                                onClick={(e) => {
                                    if (user) {
                                        e.preventDefault();
                                        alert("Du bist bereits eingeloggt.");
                                    }
                                }}
                            >
                                <LogIn size={20} className="text-foreground" />
                            </Link>
                        </Button>

                        {/* Eingeloggt-spezifische Buttons */}
                        {user && (
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

                                {/* Nachrichten-Button */}
                                <Button variant="ghost" size="icon" asChild>
                                    <Link
                                        to={chatId ? `/messages/${chatId}` : "#"}
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

                                {/* Profil-Button */}
                                <Button variant="ghost" size="icon" asChild>
                                    <Link to="/profile" aria-label="Profil">
                                        <User size={20} className="text-foreground" />
                                    </Link>
                                </Button>

                                {/* Anzeige erstellen */}
                                <Button className="bg-marktx-blue-600 text-white hover:bg-marktx-blue-700 rounded-md px-4 py-2" asChild>
                                    <Link to="/create" className="flex items-center">
                                        <Plus size={20} className="mr-2 text-white" />
                                        Anzeige erstellen
                                    </Link>
                                </Button>

                                {/* Logout */}
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
                            {isMenuOpen ? <X size={24} className="text-foreground" /> : <Menu size={24} className="text-foreground" />}
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
                                    {/* Anzeige erstellen */}
                                    <Link
                                        to="/create"
                                        className="flex items-center px-4 py-2 text-marktx-blue-600 font-medium"
                                    >
                                        <Plus size={20} className="mr-2" />
                                        Anzeige erstellen
                                    </Link>

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

                                    {/* Nachrichten */}
                                    <Link
                                        to={chatId ? `/messages/${chatId}` : "#"}
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

                                    {/* Profil */}
                                    <Link to="/profile" className="flex items-center px-4 py-2 text-foreground">
                                        <User size={20} className="mr-2" />
                                        Profil
                                    </Link>

                                    {/* Logout */}
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