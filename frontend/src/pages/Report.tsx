import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const categories = [
    "Unangemessene Inhalte",
    "Betrug / Fake",
    "Belästigung / Mobbing",
    "Illegale Artikel",
    "Spam",
    "Sonstiges",
];

const Report = () => {
    const [username, setUsername] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [description, setDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const reportData = {
            username,
            category: selectedCategory,
            description,
        };

        try {
            const response = await fetch("/api/report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reportData),
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                alert("Fehler beim Absenden der Meldung");
            }
        } catch (error) {
            console.error("Fehler beim Senden:", error);
            alert("Verbindung zum Server fehlgeschlagen");
        }
    };


    return (
        <>
            <Navbar />
            <main className="marktx-container py-8 min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-6">🚨 Missbrauch melden</h1>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="max-w-lg">
                        <p className="text-gray-600 mb-4">
                            Bitte fülle das folgende Formular aus, wenn du einen Missbrauch oder Regelverstoß melden möchtest. Deine Meldung bleibt anonym und wird vertraulich behandelt.
                        </p>

                        <label htmlFor="username" className="block font-semibold mb-1">
                            Gemeldeter Benutzername
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                            placeholder="z. B. max.mustermann@htl-leonding.at"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <label htmlFor="category" className="block font-semibold mb-1">
                            Kategorie des Vorfalls
                        </label>
                        <select
                            id="category"
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
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
                ) : (
                    <div className="text-green-600 font-semibold">
                        <p className="mb-2">✅ Vielen Dank für deine Meldung!</p>
                        <p>
                            Unser Team wird den Vorfall prüfen und bei Bedarf entsprechende Maßnahmen ergreifen.
                        </p>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default Report;
