import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Search = () => {
    const location = useLocation();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]); // Typ anpassen

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchTerm = params.get("query") || "";
        setQuery(searchTerm);

        if (searchTerm) {
            // Hier deine Logik für Suchergebnisse, z.B. API-Call oder Filter
            // Beispiel: setResults(filterData(searchTerm));
            console.log("Suche gestartet mit:", searchTerm);

            // Beispiel Dummy-Ergebnisse:
            setResults([
                { id: 1, title: `Ergebnis für ${searchTerm} #1` },
                { id: 2, title: `Ergebnis für ${searchTerm} #2` }
            ]);
        } else {
            setResults([]);
        }
    }, [location.search]);

    return (
        <div>
            <h1>Suchergebnisse für: "{query}"</h1>
            {results.length === 0 && <p>Keine Ergebnisse gefunden.</p>}
            <ul>
                {results.map(r => (
                    <li key={r.id}>{r.title}</li>
                ))}
            </ul>
        </div>
    );
};

export default Search;
