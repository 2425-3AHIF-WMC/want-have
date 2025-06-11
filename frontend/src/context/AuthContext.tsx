// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import {keycloak} from "../services/keycloak";
import {initKeycloak} from "../services/keycloak";


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
interface KeycloakTokenParsed {
    sub?: string;
    preferred_username?: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    // ggf. weitere Felder hinzufügen
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        initKeycloak()
            .then(() => {
                const tokenParsed = keycloak.tokenParsed as KeycloakTokenParsed | undefined;
                if (!tokenParsed) {
                    setIsLoading(false);
                    return;
                }

                const user = {
                    id: tokenParsed.sub,
                    username: tokenParsed.preferred_username || "",
                    email: tokenParsed.email,
                    name: tokenParsed.name || `${tokenParsed.given_name || ""} ${tokenParsed.family_name || ""}`.trim(),
                };
                setUser(user);
                setIsLoading(false);

                // 👉 Hier auf Logout reagieren
                keycloak.onAuthLogout = () => {
                    console.log("🚪 Keycloak logout event");
                    setUser(null);

                };
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, []);




    const login = () => {
        keycloak.login();
    };


    const logout = () => {
        keycloak.logout({
            redirectUri: window.location.origin,
        });
        setUser(null);
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

