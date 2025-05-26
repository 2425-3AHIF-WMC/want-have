import { Link } from "react-router-dom";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-marktx-gray-100 mt-12">
            <div className="marktx-container py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">MarktX</h3>
                        <p className="text-marktx-gray-500 text-sm">
                            Die Handelsplattform für Schülerinnen und Schüler der HTL Leonding.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Links & Kontakt</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-marktx-blue-600 hover:underline text-sm">
                                    Startseite
                                </Link>
                            </li>
                            <li>
                                <Link to="/create" className="text-marktx-blue-600 hover:underline text-sm">
                                    Anzeige erstellen
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-marktx-blue-600 hover:underline text-sm">
                                    Kontakt
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Hilfe</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/faq" className="text-marktx-blue-600 hover:underline text-sm">
                                    Häufig gestellte Fragen
                                </Link>
                            </li>
                            <li>
                                <Link to="/rules" className="text-marktx-blue-600 hover:underline text-sm">
                                    Nutzungsrichtlinien
                                </Link>
                            </li>
                            <li>
                                <Link to="/report" className="text-marktx-blue-600 hover:underline text-sm">
                                    Missbrauch melden
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-marktx-gray-200 mt-8 pt-4 text-center text-xs text-marktx-gray-500">
                    <p>© {currentYear} MarktX - HTL Leonding. Alle Rechte vorbehalten.</p>
                    <p className="mt-2">Eine Plattform für die HTL Leonding Schulgemeinschaft.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
