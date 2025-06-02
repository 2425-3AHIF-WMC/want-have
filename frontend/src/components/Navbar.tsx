import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import {
    Bell,
    MessageSquare,
    Menu,
    X,
    User,
    Plus
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Navbar = forwardRef((props, ref) => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [chatId, setChatId] = useState<string | null>(null);

    // Badge States
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    };

    // ChatId aus User ableiten oder fetchen
    useEffect(() => {
        if (user) {
            // Hier kannst du auch eine API-Abfrage machen, um Chat-ID zu holen
            const simulatedChatId = "abc123"; // Beispiel
            setChatId(simulatedChatId);
        } else {
            setChatId(null);
        }
    }, [user]);

    // Badge-Status abrufen (nur wenn User eingeloggt)
    useEffect(() => {
        async function fetchNotificationStatus() {
            if (!user) {
                setHasNewMessages(false);
                setHasNewNotifications(false);
                return;
            }
            try {
                const resMessages = await axios.get("http://localhost:3000/api/hasNewMessages", { withCredentials: true });
                setHasNewMessages(resMessages.data.hasNew);

                const resNotifications = await axios.get("http://localhost:3000/api/hasNewNotifications", { withCredentials: true });
                setHasNewNotifications(resNotifications.data.hasNew);
            } catch (err) {
                console.error("Fehler beim Laden der Benachrichtigungsdaten", err);
                setHasNewMessages(false);
                setHasNewNotifications(false);
            }
        }
        fetchNotificationStatus();
    }, [user]);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
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
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/notifications" aria-label="Benachrichtigungen">
                                <div className="relative">
                                    <Bell size={20} />
                                    {hasNewNotifications && (
                                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600" />
                                    )}
                                </div>
                            </Link>
                        </Button>

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
                                    <MessageSquare size={20} />
                                    {hasNewMessages && (
                                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600" />
                                    )}
                                </div>
                            </Link>
                        </Button>

                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/profile" aria-label="Profil">
                                <User size={20} />
                            </Link>
                        </Button>

                        <Button className="btn-primary" asChild>
                            <Link to="/create">
                                <Plus size={20} className="mr-2" />
                                Anzeige erstellen
                            </Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={toggleMenu}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden animate-fade-in bg-white border-t border-marktx-gray-200">
                        <div className="flex flex-col space-y-2 py-3">
                            <Link to="/create" className="flex items-center px-4 py-2 text-marktx-blue-600 font-medium">
                                <Plus size={20} className="mr-2" />
                                Anzeige erstellen
                            </Link>

                            <Link to="/notifications" className="flex items-center px-4 py-2 relative">
                                <Bell size={20} className="mr-2" />
                                Benachrichtigungen
                                {hasNewNotifications && (
                                    <span className="absolute top-3 left-28 block h-2 w-2 rounded-full bg-red-600" />
                                )}
                            </Link>

                            <Link
                                to={chatId ? `/messages/${chatId}` : "#"}
                                className="flex items-center px-4 py-2"
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
                                    <span className="absolute top-3 left-20 block h-2 w-2 rounded-full bg-red-600" />
                                )}
                            </Link>

                            <Link to="/profile" className="flex items-center px-4 py-2">
                                <User size={20} className="mr-2" />
                                Profil
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
});

export default Navbar;
