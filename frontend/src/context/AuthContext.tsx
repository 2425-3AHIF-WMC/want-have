// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

interface User {
    id?: string;
    username: string;
    email?: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Axios so konfigurieren, dass JWT-Cookie mitgeschickt wird
    axios.defaults.baseURL = process.env.REACT_APP_API_URL;
    axios.defaults.withCredentials = true;

    useEffect(() => {
        // Beim Laden prüfen, ob wir eingeloggt sind
        async function fetchUser() {
            try {
                const res = await axios.get<User>("/login/me");
                setUser(res.data);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, []);

    const login = () => {
        // WICHTIG: Weiterleitung zur Backend-Login-Route (Port 3001)
        window.location.href = "http://localhost:3001/login";
    };

    const logout = () => {
        // Beendet Session in Keycloak und leitet zurück
        window.location.href = `${process.env.REACT_APP_API_URL}/login/logout`;
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
