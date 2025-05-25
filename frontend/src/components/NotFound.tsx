import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";


const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow flex items-center justify-center">
                <div className="text-center px-4 py-16">
                    <h1 className="text-6xl font-bold text-marktx-blue-600 mb-4">404</h1>
                    <p className="text-xl text-marktx-gray-600 mb-6">Diese Seite wurde nicht gefunden.</p>
                    <Button asChild>
                        <Link to="/" className="inline-flex items-center">
                            <Home size={18} className="mr-2" />
                            Zurück zur Startseite
                        </Link>
                    </Button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default NotFound;