// Dateipfad: src/pages/Report.tsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const categories = [
    "Unangemessene Inhalte",
    "Betrug / Fake",
    "Belästigung / Mobbing",
    "Illegale Artikel",
    "Spam",
    "Sonstiges",
];

const Report: React.FC = () => {
    const { user } = useAuth();
    const [reason, setReason] = useState("");            // statt username → reason
    const [description, setDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!user) {
            setErrorMsg("Du musst eingeloggt sein, um eine Meldung abzuschicken.");
            return;
        }

        if (!reason) {
            setErrorMsg("Bitte wähle eine Kategorie (Reason) aus.");
            return;
        }

        try {
            // JWT-Cookie (HttpOnly) wird automatisch mitsamt axios-Request gesendet
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/reports/general`,
                {
                    reason,            // Backend erwartet "reason"
                    description,       // Backend erwartet "description"
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                setSubmitted(true);
            } else {
                setErrorMsg("Fehler beim Absenden der Meldung.");
            }
        } catch (err: any) {
            console.error("Fehler beim Senden:", err);
            const serverMsg = err.response?.data?.error || "Serverfehler";
            setErrorMsg("Verbindung fehlgeschlagen: " + serverMsg);
        }
    };

    return (
        <>
            <Navbar />

            <main className="marktx-container py-8 min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-6">🚨 Missbrauch melden</h1>

                {!user ? (
                    <div className="text-red-600">Bitte melde dich erst an, um einen Bericht zu erstellen.</div>
                ) : submitted ? (
                    <div className="text-green-600 font-semibold">
                        <p className="mb-2">✅ Vielen Dank für deine Meldung!</p>
                        <p>Unser Team wird den Vorfall prüfen und bei Bedarf entsprechende Maßnahmen ergreifen.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="max-w-lg">
                        {errorMsg && (
                            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errorMsg}</div>
                        )}

                        <p className="text-gray-600 mb-4">
                            Bitte wähle eine Kategorie und beschreibe den Vorfall. Deine Meldung bleibt anonym.
                        </p>

                        <label htmlFor="reason" className="block font-semibold mb-1">
                            Kategorie des Vorfalls
                        </label>
                        <select
                            id="reason"
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                                -- Bitte auswählen --
                            </option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="description" className="block font-semibold mb-1">
                            Beschreibung des Vorfalls
                        </label>
                        <textarea
                            id="description"
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                            rows={5}
                            placeholder="Beschreibe hier möglichst genau, was vorgefallen ist..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            className="bg-marktx-blue-600 text-white px-4 py-2 rounded hover:bg-marktx-blue-700"
                        >
                            Meldung absenden
                        </button>
                    </form>
                )}
            </main>

            <Footer />
        </>
    );
};

export default Report;
