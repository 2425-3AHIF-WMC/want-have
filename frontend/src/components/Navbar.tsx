import { useState } from "react";
import {
    Bell,
    MessageSquare,
    Menu,
    X,
    Search,
    User,
    Plus
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Suche nach:", searchQuery);
        // Hier später die Suche implementieren
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="marktx-container">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-marktx-blue-600">Markt<span className="text-marktx-blue-700">X</span></span>
                    </Link>

                    {/* Suchleiste (desktop) */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-6">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <Input
                                type="text"
                                placeholder="Suche nach Artikeln..."
                                className="w-full pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Search size={18} className="text-marktx-gray-400" />
                            </button>
                        </form>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/notifications" aria-label="Benachrichtigungen">
                                <Bell size={20} />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/messages" aria-label="Nachrichten">
                                <MessageSquare size={20} />
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

                {/* Suchleiste (mobile) */}
                <div className="md:hidden pb-3">
                    <form onSubmit={handleSearch} className="relative">
                        <Input
                            type="text"
                            placeholder="Suche nach Artikeln..."
                            className="w-full pr-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Search size={18} className="text-marktx-gray-400" />
                        </button>
                    </form>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden animate-fade-in bg-white border-t border-marktx-gray-200">
                        <div className="flex flex-col space-y-2 py-3">
                            <Link to="/create" className="flex items-center px-4 py-2 text-marktx-blue-600 font-medium">
                                <Plus size={20} className="mr-2" />
                                Anzeige erstellen
                            </Link>
                            <Link to="/notifications" className="flex items-center px-4 py-2">
                                <Bell size={20} className="mr-2" />
                                Benachrichtigungen
                            </Link>
                            <Link to="/messages" className="flex items-center px-4 py-2">
                                <MessageSquare size={20} className="mr-2" />
                                Nachrichten
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
};

export default Navbar;