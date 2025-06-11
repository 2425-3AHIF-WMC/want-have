import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { keycloak, initKeycloak } from "../services/keycloak";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Eventhandler vor init registrieren
        keycloak.onAuthLogout = () => {
            console.log("🚪 Keycloak logout event");
            setUser(null);
        };

        initKeycloak()
            .then(() => {
                console.log("✅ keycloak", keycloak);
                console.log("🪪 token:", keycloak.token);
                console.log("🧾 tokenParsed:", keycloak.tokenParsed);

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
