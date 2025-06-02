import React from "react";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
    const { user, isLoading, login, logout } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    if (!user) {
        return (
            <div>
                <h2>You are not logged in</h2>
                <button onClick={login}>Login with Keycloak</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Welcome, {user.name || user.username}!</h2>
            <p>Email: {user.email || "No email provided"}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default LoginPage;
