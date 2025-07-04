import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Notifications from "./pages/Notifications";
import ChatPage from "./components/ChatPage";
import CreateListing from "./components/CreateListing";
import MessagesList from "./components/MessagesList";
import PartnerComponent from "./components/PartnerComponent";
import FAQ from "./pages/FAQ";
import Rules from "./pages/Rules";
import Contact from "./pages/Contact";
import Report from "./pages/Report";

import { Toaster } from "sonner";

const queryClient = new QueryClient();

// Geschützter Bereich (leitet auf /login um, wenn nicht eingeloggt)
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div className="text-foreground p-8">Lädt …</div>;
    return user ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Toaster />

                <Routes>
                    {/* Öffentliche Routen */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="/create" element={<CreateListing />} />
                    <Route path="/messages" element={<MessagesList />} />

                    {/* Geschützte Routen */}
                    <Route
                        path="/notifications"
                        element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/chats/:chatId/partner"
                        element={
                            <PrivateRoute>
                                <PartnerComponent />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/chat/:chatId"
                        element={
                            <PrivateRoute>
                                <ChatPage />
                            </PrivateRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
