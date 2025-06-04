import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const faqData = {
    Einkauf: [
        { question: "Wie kaufe ich einen Artikel?", answer: "Du suchst einen Artikel aus und klickst auf 'Kaufen'." },
        { question: "Kann ich auch zurückgeben?", answer: "MarktX bietet keine Rückgabe-Garantie, kläre das bitte mit dem Verkäufer." },
        { question: "Wie kontaktiere ich den Verkäufer?", answer: "Nach dem Klick auf 'Kaufen' erscheint die Chatfunktion." },
        { question: "Was passiert nach dem Kauf?", answer: "Ihr trefft euch an der Schule und übergebt den Artikel persönlich." }
    ],
    Zahlung: [
        { question: "Welche Zahlungsmethoden gibt es?", answer: "Momentan nur Barzahlung bei Übergabe an der Schule." },
        { question: "Ist die Zahlung sicher?", answer: "Wir empfehlen persönliche Übergabe und Barzahlung auf der Schule." },
        { question: "Gibt es Quittungen?", answer: "MarktX erstellt keine Quittungen – bei Bedarf könnt ihr privat etwas vereinbaren." }
    ],
    Verkauf: [
        { question: "Wie kann ich einen Artikel verkaufen?", answer: "Klicke auf 'Anzeige erstellen' und fülle die Angaben aus." },
        { question: "Kann ich mehrere Artikel gleichzeitig einstellen?", answer: "Ja, du kannst beliebig viele Inserate erstellen." },
        { question: "Wie ändere ich mein Inserat?", answer: "Gehe auf dein Profil und klicke auf 'Bearbeiten' beim Inserat." },
        { question: "Wie lösche ich ein Inserat?", answer: "Im Profil findest du bei jedem Inserat die Option 'Löschen'." }
    ],
    Sicherheit: [
        { question: "Wie erkenne ich vertrauenswürdige Verkäufer?", answer: "Achte auf vollständige Angaben, klare Bilder und gute Kommunikation." },
        { question: "Was mache ich bei Betrugsverdacht?", answer: "Melde uns den Fall sofort über die 'Problem melden'-Funktion." },
        { question: "Sind meine Daten öffentlich?", answer: "Nein, deine Kontaktdaten sind nur sichtbar, wenn du etwas kaufst oder verkaufst." },
        { question: "Wie melde ich einen Nutzer?", answer: "Öffne das Profil des Nutzers und klicke auf 'Melden'." }
    ],
    "Profil & Konto": [
        { question: "Wie erstelle ich ein Konto?", answer: "Du registrierst dich mit deiner Schul-E-Mail und legst ein Passwort fest." },
        { question: "Kann ich mein Passwort ändern?", answer: "Ja, im Profilbereich unter 'Einstellungen'." },
        { question: "Was, wenn ich mein Passwort vergesse?", answer: "Nutze die 'Passwort vergessen'-Funktion auf der Login-Seite." },
        { question: "Wie lösche ich mein Konto?", answer: "Schreibe uns über das Kontaktformular, wenn du dein Konto löschen willst." }
    ],
    Verschenken: [
        { question: "Wie verschenke ich etwas?", answer: "Beim Erstellen der Anzeige einfach 'Verschenken' auswählen." },
        { question: "Kann ich verschenkte Artikel zurücknehmen?", answer: "Nein, verschenkte Artikel gehören dem neuen Besitzer." },
        { question: "Warum verschenken statt verkaufen?", answer: "Du hilfst anderen Schülern und reduzierst Müll." },
        { question: "Wie erkenne ich verschenkte Artikel?", answer: "Diese sind im Marktplatz mit dem Label 'GRATIS' gekennzeichnet." }
    ],
    "Bilder & Beschreibung": [
        { question: "Muss ich ein Bild hochladen?", answer: "Ja, ein Bild hilft anderen zu sehen, was du anbietest." },
        { question: "Was macht eine gute Beschreibung aus?", answer: "Sei ehrlich, genau und erwähne alle wichtigen Details (Zustand, Mängel)." },
        { question: "Wie viele Bilder kann ich hochladen?", answer: "Momentan bis zu 3 Bilder pro Anzeige." },
        { question: "Darf ich Bilder aus dem Internet nutzen?", answer: "Nein, verwende nur selbstgemachte Bilder." }
    ],
    "MarktX & Schulregeln": [
        { question: "Wer darf MarktX nutzen?", answer: "Nur Schüler und Lehrer der HTL Leonding mit Schul-E-Mail." },
        { question: "Was ist auf MarktX verboten?", answer: "Verboten sind Artikel wie Waffen, Alkohol, Drogen oder Inhalte, die gegen Schulregeln verstoßen." },
        { question: "Wer betreibt MarktX?", answer: "MarktX ist ein Schulprojekt von Schüler:innen der HTL Leonding." },
        { question: "Was passiert bei Regelverstoß?", answer: "Bei Regelverstößen kann dein Konto gesperrt werden." }
    ]
};


const FAQ = () => {
    return (
        <>
            <Navbar />
            <main className="marktx-container py-10 min-h-[60vh]">
                <h1 className="text-3xl font-bold mb-8 text-center">Häufig gestellte Fragen</h1>

                <Tabs defaultValue="Einkauf" className="w-full max-w-4xl mx-auto">
                    <TabsList className="grid grid-cols-3 bg-gray-100 rounded-lg p-1 mb-6">
                        {Object.keys(faqData).map((category) => (
                            <TabsTrigger
                                key={category}
                                value={category}
                                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                            >
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {Object.entries(faqData).map(([category, qas]) => (
                        <TabsContent key={category} value={category} className="space-y-4">
                            {qas.map(({ question, answer }, i) => (
                                <div
                                    key={i}
                                    className="bg-white shadow-sm p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <h3 className="font-semibold text-marktx-dark">{question}</h3>
                                    <p className="text-marktx-gray-700 mt-1 text-sm">{answer}</p>
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
