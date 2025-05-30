import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ChatComponent from "./components/ChatComponent";
import { AuthProvider } from '@/context/AuthContext';


import Home from "./pages/Home";
import FAQ from "./pages/FAQ";
import Rules from "./pages/Rules";
import Contact from "./pages/Contact";
import Report from "./pages/Report";

import CreateListing from "./components/CreateListing";
import NotFound from "./components/NotFound";
import { Toaster } from "sonner";


import "./index.css";
import MessagesList from "./components/MessagesList";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <TooltipProvider>
            <Toaster />
            <BrowserRouter basename="/want-have">
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create" element={<CreateListing />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/messages" element={<MessagesList />} />
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
    </QueryClientProvider>
);

export default App;
