import React from "react";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
    const { user, isLoading, login, logout } = useAuth();

    if (isLoading) return <div className="text-foreground p-8">Lädt …</div>;

    if (!user) {
        return (
            <div className="p-8 text-foreground">
                <h2 className="text-2xl mb-4">Du bist nicht eingeloggt</h2>
                <button
                    onClick={login}
                    className="bg-marktx-blue-600 text-white px-4 py-2 rounded-md hover:bg-marktx-blue-700"
                >
                    Mit Keycloak anmelden
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 text-foreground">
            <h2 className="text-2xl mb-4">Willkommen, {user.name || user.username}!</h2>
            <p className="mb-4">Email: {user.email || "Keine E-Mail vorhanden"}</p>
            <button
                onClick={() => logout()}
                className="bg-marktx-accent-orange text-white px-4 py-2 rounded-md hover:bg-marktx-accent-red"
            >
                Logout
            </button>
        </div>
    );
};

export default LoginPage;
