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
    const [selectedCategory, setSelectedCategory] = useState("");
    const [description, setDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Hier kannst du z.B. einen API-Call machen, um die Meldung zu speichern
        setSubmitted(true);
    };

    return (
        <>
            <Navbar />
            <main className="marktx-container py-8 min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-6">Missbrauch melden</h1>
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="max-w-lg">
                        <label className="block mb-2 font-semibold" htmlFor="category">
                            Kategorie wählen
                        </label>
                        <select
                            id="category"
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                                -- Bitte wählen --
                            </option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <label className="block mb-2 font-semibold" htmlFor="description">
                            Beschreibung
                        </label>
                        <textarea
                            id="description"
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            className="bg-marktx-blue-600 text-white px-4 py-2 rounded hover:bg-marktx-blue-700"
                        >
                            Melden
                        </button>
                    </form>
                ) : (
                    <p className="text-green-600 font-semibold">Vielen Dank für Ihre Meldung! Wir werden uns darum kümmern.</p>
                )}
            </main>
            <Footer />
        </>
    );
};

export default Report;
