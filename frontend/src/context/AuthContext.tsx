import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
    user: { id: string; username: string } | null;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ id: string; username: string } | null>(null);

    useEffect(() => {
        // Beim Laden prüfen ob User eingeloggt ist
        const checkAuth = async () => {
            try {
                const res = await axios.get('http://localhost:3000/auth/me', {
                    withCredentials: true
                });
                setUser(res.data);
            } catch (err) {
                setUser(null);
            }
        };
        checkAuth();
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        const res = await axios.post('http://localhost:3000/auth/login', credentials, {
            withCredentials: true
        });
        setUser(res.data.user);
    };

    const logout = async () => {
        await axios.post('http://localhost:3000/auth/logout', {}, {
            withCredentials: true
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}