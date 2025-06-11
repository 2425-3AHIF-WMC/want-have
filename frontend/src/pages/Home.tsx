import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard, { ProductCardWrapper } from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext"; // oder dein Pfad
import { supabase } from "../lib/supabaseClient";

type Filters = {
    category: string;
    condition: string;
    priceRange: [number, number];
    isFree: boolean;
};

async function fetchProducts(filters: Filters, searchTerm: string): Promise<Product[]> {
    let query = supabase.from("ads").select("*");

    if (filters.category && filters.category !== "Alle Kategorien") {
        query = query.ilike("category", `%${filters.category}%`);
    }
    if (filters.condition && filters.condition !== "Alle Zustände") {
        query = query.ilike("condition", `%${filters.condition}%`);
    }
    if (filters.isFree) {
        query = query.eq("is_free", true);
    } else {
        query = query.gte("price", filters.priceRange[0]).lte("price", filters.priceRange[1]);
    }
    if (searchTerm.trim()) {
        query = query.ilike("title", `%${searchTerm.trim()}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return data;
}

export type ProductPrice = number | "Zu verschenken";

export interface Product {
    id: string;
    title: string;
    price: ProductPrice;
    image_url: string;
    condition: string;
    created_at: string; // ISO-String vom Server
    seller: { name: string; rating: number; id: string };
    is_free?: boolean;
    category?: string;
}

const Home: React.FC = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState<{
        category: string;
        condition: string;
        priceRange: [number, number];
        isFree: boolean;
    }>({
        category: "Alle Kategorien",
        condition: "Alle Zustände",
        priceRange: [0, 500],
        isFree: false,
    });

    const [searchTerm, setSearchTerm] = useState("");

    // React Query: Produkte vom Backend holen
    const { data: products, isLoading, error, refetch } = useQuery({
        queryKey: ["products", filters, searchTerm],
        queryFn: () => fetchProducts(filters, searchTerm),
    });

    // Filter anwenden, wenn sich Filter oder Suchterm ändert
    useEffect(() => {
        refetch();
    }, [filters, searchTerm, refetch]);

    return (
        <div className="flex flex-col min-h-screen" id="home-section">
            <Navbar />
            <main className="flex-grow">
                <div className="bg-marktx-blue-600 text-white py-12">
                    <div className="marktx-container">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">Willkommen bei MarktX!</h1>
                            <p className="text-xl mb-6">
                                Der Handelsplatz für Schülerinnen und Schüler der HTL Leonding.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <a href="#waren">
                                    <Button className="bg-white text-marktx-blue-600 hover:bg-marktx-blue-50">
                                        Angebote stöbern
                                    </Button>
                                </a>
                                <Button className="btn-accent">
                                    <Link to="/create">Anzeige erstellen</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suchfeld */}
                <div className="marktx-container my-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                refetch();
                            }
                        }}
                        placeholder="Suche nach Artikeln..."
                        className="w-full p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-marktx-blue-600"
                    />
                </div>

                {/* Kategorien-Buttons */}
                <div className="bg-marktx-gray-100 py-6" id="waren">
                    <div className="marktx-container">
                        <div className="flex overflow-x-auto pb-2 space-x-4 scrollbar-none">
                            {[
                                "Alle Kategorien",
                                "Schulbücher",
                                "Elektronik",
                                "Kleidung",
                                "Möbel",
                                "Schreibwaren",
                                "Sonstiges",
                            ].map((cat) => (
                                <Button
                                    key={cat}
                                    variant={filters.category === cat ? "default" : "outline"}
                                    className="whitespace-nowrap"
                                    onClick={() =>
                                        setFilters((f) => ({
                                            ...f,
                                            category: cat,
                                        }))
                                    }
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Hauptbereich: Filter-Sidebar + Produkt-Grid */}
                <div className="marktx-container py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <ProductFilter filters={filters} onFilterChange={setFilters} />
                            <div className="bg-marktx-blue-50 border-2 border-marktx-blue-200 rounded-lg p-4 text-center">
                                <Tag size={24} className="mx-auto mb-2 text-marktx-blue-600" />
                                <h3 className="font-bold text-marktx-blue-700 mb-2">Artikel zu verschenken?</h3>
                                <p className="text-sm mb-3">
                                    Hast du Schulbücher oder andere Artikel, die du verschenken möchtest?
                                </p>
                                <Button className="w-full btn-primary">
                                    <Link to="/create">Gratisanzeige erstellen</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Produkt-Grid mit Tabs */}
                        <div className="lg:col-span-3">
                            <Tabs defaultValue="newest">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Entdecke Angebote</h2>
                                    <TabsList>
                                        <TabsTrigger value="newest">Neueste</TabsTrigger>
                                        <TabsTrigger value="popular">Beliebteste</TabsTrigger>
                                        <TabsTrigger value="free">Zu verschenken</TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Neueste */}
                                <TabsContent value="newest" className="mt-0">
                                    {isLoading ? (
                                        <div className="text-center text-gray-500">Lade Artikel...</div>
                                    ) : error ? (
                                        <div className="text-center text-red-600">Fehler: {error.message}</div>
                                    ) : products && products.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {products.map((product) => (
                                                <ProductCardWrapper
                                                    key={product.id}
                                                    product={{
                                                        ...product,
                                                        imageUrl: product.image_url,
                                                        createdAt: new Date(product.created_at),
                                                    }}
                                                    currentUserId={user?.id ?? ""}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            Keine Artikel gefunden.
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Beliebteste */}
                                <TabsContent value="popular" className="mt-0">
                                    {isLoading ? (
                                        <div className="text-center text-gray-500">Lade Artikel...</div>
                                    ) : error ? (
                                        <div className="text-center text-red-600">Fehler: {error.message}</div>
                                    ) : products && products.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {[...products]
                                                .sort((a, b) => b.seller.rating - a.seller.rating)
                                                .map((product) => (
                                                    <ProductCardWrapper
                                                        key={product.id}
                                                        product={{
                                                            ...product,
                                                            imageUrl: product.image_url,
                                                            createdAt: new Date(product.created_at),
                                                        }}
                                                        currentUserId={user?.id ?? ""}
                                                    />
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            Keine Artikel gefunden.
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Zu verschenken */}
                                <TabsContent value="free" className="mt-0">
                                    {isLoading ? (
                                        <div className="text-center text-gray-500">Lade Artikel...</div>
                                    ) : error ? (
                                        <div className="text-center text-red-600">Fehler: {error.message}</div>
                                    ) : products && products.filter((p) => p.is_free).length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {products
                                                .filter((p) => p.is_free)
                                                .map((product) => (
                                                    <ProductCardWrapper
                                                        key={product.id}
                                                        product={{
                                                            ...product,
                                                            imageUrl: product.image_url,
                                                            createdAt: new Date(product.created_at),
                                                        }}
                                                        currentUserId={user?.id ?? ""}
                                                    />
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            Keine Gratis-Artikel gefunden.
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
