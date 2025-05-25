import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const faqData = {
    Einkauf: [
        { question: "Wie kaufe ich einen Artikel?", answer: "Du suchst einen Artikel aus und klickst auf 'Kaufen'." },
        { question: "Kann ich auch zurückgeben?", answer: "MarktX bietet keine Rückgabe-Garantie, kläre das bitte mit dem Verkäufer." },
    ],
    Zahlung: [
        { question: "Welche Zahlungsmethoden gibt es?", answer: "Momentan nur Barzahlung bei Übergabe an der Schule." },
        { question: "Ist die Zahlung sicher?", answer: "Wir empfehlen persönliche Übergabe und Barzahlung auf der Schule." },
    ],
    Verkauf: [
        { question: "Wie kann ich einen Artikel verkaufen?", answer: "Klicke auf 'Anzeige erstellen' und fülle die Angaben aus." },
        { question: "Kann ich mehrere Artikel gleichzeitig einstellen?", answer: "Ja, du kannst beliebig viele Inserate erstellen." },
    ],
};

const FAQ = () => {
    return (
        <>
            <Navbar />
            <main className="marktx-container py-8 min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-6">Häufig gestellte Fragen</h1>
                <Tabs defaultValue="Einkauf">
                    <TabsList>
                        {Object.keys(faqData).map((category) => (
                            <TabsTrigger key={category} value={category}>
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {Object.entries(faqData).map(([category, qas]) => (
                        <TabsContent key={category} value={category} className="mt-4">
                            {qas.map(({ question, answer }, i) => (
                                <div key={i} className="mb-4">
                                    <h3 className="font-semibold">{question}</h3>
                                    <p className="text-marktx-gray-700 ml-4">{answer}</p>
                                </div>
                            ))}
                        </TabsContent>
                    ))}
                </Tabs>
            </main>
            <Footer />
        </>
    );
};

export default FAQ;
