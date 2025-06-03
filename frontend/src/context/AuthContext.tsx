import React, { createContext, useContext, useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";

interface User {
    id: string;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { keycloak, initialized } = useKeycloak();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (keycloak?.authenticated) {
                try {
                    const res = await axios.get<User>("http://localhost:3000/user/me", {
                        headers: { Authorization: `Bearer ${keycloak.token}` },
                        withCredentials: true,
                    });
                    setUser(res.data);
                } catch (err) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        };

        if (initialized) {
            fetchUser();
        }
    }, [keycloak, initialized]);

    const login = () => keycloak.login();
    const logout = () => keycloak.logout();

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};