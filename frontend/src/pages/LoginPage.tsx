// src/pages/LoginPage.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
    const { user, isLoading, login, logout } = useAuth();

    if (isLoading) return <div>Lädt …</div>;

    if (!user) {
        return (
            <div>
                <h2>Du bist nicht eingeloggt</h2>
                <button onClick={login}>Mit Keycloak anmelden</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Willkommen, {user.name || user.username}!</h2>
            <p>Email: {user.email || "Keine E-Mail vorhanden"}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default LoginPage;
