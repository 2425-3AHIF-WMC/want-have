import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ChatComponent from "./components/ChatComponent";
import { AuthProvider } from './context/AuthContext';

import Home from "./pages/Home";
import FAQ from "./pages/FAQ";
import Rules from "./pages/Rules";
import Contact from "./pages/Contact";
import Report from "./pages/Report";

import CreateListing from "./components/CreateListing";
import NotFound from "./components/NotFound";
import ChatPage from './components/ChatPage';
import PartnerComponent from "./components/PartnerComponent";
import { Navigate } from "react-router-dom";


import { Toaster } from "sonner";


import "./index.css";
import MessagesList from "./components/MessagesList";
import ProfilePage from "./pages/LoginPage";
import {ReactKeycloakProvider} from "@react-keycloak/web";
import {keycloak} from "./services/keycloak";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ReactKeycloakProvider authClient={keycloak} initOptions={{ onLoad: "check-sso" }}>
        <AuthProvider>
        <TooltipProvider>
            <Toaster />
            <BrowserRouter basename="/">
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create" element={<CreateListing />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="/messages" element={<MessagesList />} />
                    <Route path="/chats/:chatId/partner" element={<PartnerComponent />} />
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/chat/:chatId" element={<ChatComponent
                        chatId={""} // Hier solltest du die chatId aus den URL-Parametern holen
                        userId={"currentUserId"} // Aktuelle Benutzer-ID aus deinem Auth-System
                        chatPartner={{
                            id: "partnerId",
                            name: "Partner Name",
                            avatar: "",
                            isOnline: true
                        }}
                    />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
        </AuthProvider>
        </ReactKeycloakProvider>
    </QueryClientProvider>
);

export default App;
