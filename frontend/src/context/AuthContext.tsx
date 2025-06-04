import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get<User>("http://localhost:3000/login/me", {
                    withCredentials: true,
                });
                setUser(res.data);
            } catch {
                setUser(null);
            }
            setIsLoading(false);
        };

        fetchUser();
    }, []);

    const login = () => {
        window.location.href = "http://localhost:3000/login/login"; // Backend Login URL
    };

    const logout = () => {
        window.location.href = "http://localhost:3000/login/logout"; // Backend Logout URL
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
