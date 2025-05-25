import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Rules = () => (
    <>
        <Navbar />
        <main className="marktx-container py-8 min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-6">Nutzungsrichtlinien</h1>
            <p className="mb-4">
                MarktX ist eine exklusive Handelsplattform für die Schülerinnen und Schüler der HTL Leonding. Die Plattform ermöglicht es den Nutzern, verschiedene Artikel zu kaufen, zu verkaufen oder zu verschenken, ohne die Schule verlassen zu müssen.
            </p>

            <h2 className="font-semibold mt-6 mb-2">💼 Funktionen</h2>
            <ul className="list-disc list-inside mb-4">
                <li>Inserate erstellen: Schülerinnen und Schüler können Produkte einstellen und verkaufen.</li>
                <li>Verhandlungen führen: Nutzer können über eine Chatfunktion miteinander kommunizieren.</li>
                <li>Gratis-Abteilung: Bietet eine Möglichkeit, alte Schulbücher oder andere Gegenstände kostenlos weiterzugeben.</li>
                <li>Schul-ID Verifizierung: Registrierung nur mit einer gültigen Schul-ID möglich.</li>
                <li>Sichere Umgebung: Nur Schülerinnen und Schüler der HTL Leonding haben Zugriff.</li>
                <li>Verbot illegaler Artikel: Keine illegalen oder unangemessenen Gegenstände erlaubt.</li>
            </ul>

            <h2 className="font-semibold mt-6 mb-2">📝 Nutzungsrichtlinien</h2>
            <ul className="list-disc list-inside">
                <li>Nur für Schüler: Lehrer dürfen sich nicht anmelden oder handeln.</li>
                <li>Keine illegalen oder unangemessenen Artikel: Verstöße können zur Sperrung führen.</li>
                <li>Treffpunkt Schule: Alle Transaktionen sollten sicher auf dem Schulgelände stattfinden.</li>
                <li>Verantwortung: Jeder Nutzer ist für seine Inserate und Verhandlungen selbst verantwortlich.</li>
            </ul>
        </main>
        <Footer />
    </>
);

export default Rules;
