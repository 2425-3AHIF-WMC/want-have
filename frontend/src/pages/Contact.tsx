import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Contact = () => (
    <>
        <Navbar />
        <main className="marktx-container py-8 min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-6">Kontakt</h1>
            <ul className="space-y-4">
                <li>
                    <strong>Almina Silnovic</strong><br />
                    <a href="mailto:a.silnovic@students.htl-leonding.ac.at" className="text-marktx-blue-600 hover:underline">
                        a.silnovic@students.htl-leonding.ac.at
                    </a>
                </li>
                <li>
                    <strong>Azra Özdemir</strong><br />
                    <a href="mailto:a.oezdemir@students.htl-leonding.ac.at" className="text-marktx-blue-600 hover:underline">
                        a.oezdemir@students.htl-leonding.ac.at
                    </a>
                </li>
            </ul>
        </main>
        <Footer />
    </>
);

export default Contact;
