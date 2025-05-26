import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Rules = () => (
    <>
        <Navbar />
        <main className="marktx-container py-8 min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-6">📜 Nutzungsrichtlinien von MarktX</h1>

            <p className="mb-4">
                MarktX ist die offizielle Handelsplattform der HTL Leonding, entwickelt von Schüler:innen für Schüler:innen. Sie ermöglicht es, gebrauchte Gegenstände wie Bücher, Kleidung, Elektronik oder Zubehör unkompliziert innerhalb der Schule zu verkaufen, zu kaufen oder zu verschenken – sicher, kostenlos und lokal.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-2">💼 Plattformfunktionen im Überblick</h2>
            <ul className="list-disc list-inside mb-4 text-marktx-gray-800">
                <li><strong>Inserate erstellen:</strong> Jede/r Schüler:in kann Produkte einstellen, mit Beschreibung und Bildern.</li>
                <li><strong>Verhandeln via Chat:</strong> Käufer:innen und Verkäufer:innen kommunizieren direkt in einem sicheren Schul-Chat.</li>
                <li><strong>Gratisbereich:</strong> Du kannst Artikel verschenken – z. B. alte Schulbücher oder Kleidung.</li>
                <li><strong>Verifizierter Zugang:</strong> Nur mit gültiger HTL-Leonding-Schul-E-Mail kannst du ein Konto erstellen.</li>
                <li><strong>Transparenz & Sicherheit:</strong> Profile sind schulöffentlich, um Vertrauen zwischen Nutzern zu stärken.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-2">📘 Allgemeine Regeln & sinnvolle Tipps</h2>
            <ul className="list-disc list-inside mb-4 text-marktx-gray-800">
                <li><strong>Verwende echte Bilder:</strong> Lade nur selbstgemachte, aktuelle Fotos hoch – keine Bilder aus dem Internet.</li>
                <li><strong>Beschreibe ehrlich:</strong> Mängel, Gebrauchsspuren oder Defekte müssen klar angegeben werden.</li>
                <li><strong>Keine Reservierungsgarantie:</strong> Ein Artikel bleibt öffentlich sichtbar, bis er als verkauft markiert ist.</li>
                <li><strong>Kommuniziere respektvoll:</strong> Im Chat gelten die Regeln der Netiquette – bleib höflich und fair.</li>
                <li><strong>Treffpunkt:</strong> Übergaben erfolgen ausschließlich auf dem Schulgelände während der Schulzeiten.</li>
                <li><strong>Datenschutz beachten:</strong> Teile keine sensiblen Daten wie Handynummer oder Adresse im Chat.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-2">🚫 Was ist verboten?</h2>
            <ul className="list-disc list-inside mb-4 text-red-700">
                <li><strong>Illegale Gegenstände:</strong> Waffen, Alkohol, Drogen, Feuerwerkskörper usw.</li>
                <li><strong>Unangemessene Inhalte:</strong> Beleidigende, sexuelle, diskriminierende oder politische Artikel.</li>
                <li><strong>Fake-Angebote:</strong> Keine Scherzinserate, nicht-existierende Artikel oder Täuschungen.</li>
                <li><strong>Spam & Werbung:</strong> Keine Weiterleitungen auf externe Verkaufsplattformen oder Werbung für Drittanbieter.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-2">👥 Nutzerpflichten</h2>
            <ul className="list-disc list-inside mb-4 text-marktx-gray-800">
                <li><strong>Eigenverantwortung:</strong> Jede/r Nutzer:in haftet für die Richtigkeit und Rechtmäßigkeit seiner Inserate.</li>
                <li><strong>Konfliktklärung:</strong> Probleme zwischen Käufer:in und Verkäufer:in müssen persönlich geklärt werden.</li>
                <li><strong>Verstoßmeldung:</strong> Bei Missbrauch kannst du Nutzer:innen oder Inserate anonym melden.</li>
                <li><strong>Konto löschen:</strong> Auf Wunsch kann dein Konto jederzeit gelöscht werden – kontaktiere das Admin-Team.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-2">🔒 Sicherheit & Support</h2>
            <ul className="list-disc list-inside mb-4 text-marktx-gray-800">
                <li><strong>Nur für Schüler:innen:</strong> Lehrer:innen oder Externe dürfen MarktX nicht nutzen.</li>
                <li><strong>Missbrauch führt zur Sperre:</strong> Wer wiederholt gegen Regeln verstößt, wird dauerhaft gesperrt.</li>
                <li><strong>Support-Team:</strong> Bei technischen Problemen oder Unsicherheiten kannst du das Entwicklerteam über das Kontaktformular erreichen.</li>
            </ul>

            <p className="text-sm mt-6 text-gray-500">
                Stand: Mai 2025 – Änderungen vorbehalten. Für Feedback oder Ideen melde dich gerne bei uns.
            </p>
        </main>
        <Footer />
    </>
);

export default Rules;
