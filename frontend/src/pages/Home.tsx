import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tag } from "lucide-react";
import { Link } from "react-router-dom";
import {useAuth} from ".././context/AuthContext";

type ProductPrice = number | "Zu verschenken";

type Product = {
    id: string;
    title: string;
    price: ProductPrice;
    imageUrl: string;
    condition: string;
    createdAt: Date;
    seller: { name: string; rating: number };
    isFree?: boolean;
    category?: string;
};

const dummyProducts: Product[] = [
    {
        id: "1",
        title: "Mathematik Schulbuch 5. Klasse",
        price: "Zu verschenken",
        imageUrl:
            "https://images.unsplash.com/photo-1588580000645-4562a6d2c839?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Gut",
        createdAt: new Date(2023, 3, 20),
        seller: { name: "Marie S.", rating: 4.5 },
        isFree: true,
        category: "Schulbücher",
    },
    {
        id: "2",
        title: "Grafiktaschenrechner TI-84",
        price: 45.99,
        imageUrl:
            "https://images.unsplash.com/photo-1613834926943-64d32d57cd55?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Wie neu",
        createdAt: new Date(),
        seller: { name: "Thomas H.", rating: 5 },
        category: "Elektronik",
    },
    {
        id: "3",
        title: "Englisch Wörterbuch",
        price: 12.50 as ProductPrice,
        imageUrl: "https://images.unsplash.com/photo-1451226428352-cf66bf8a0317?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Gebraucht",
        createdAt: new Date(2023, 3, 19),
        seller: {
            name: "Lukas M.",
            rating: 4,
        },
    },
    {
        id: "4",
        title: "Informatik Skript",
        price: "Zu verschenken" as ProductPrice,
        imageUrl: "https://images.unsplash.com/photo-1517497869-78e32066d3d2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Akzeptabel",
        createdAt: new Date(2023, 3, 18),
        seller: {
            name: "Julia K.",
            rating: 4.5,
        },
        isFree: true,
    },
    {
        id: "5",
        title: "USB-C Ladekabel (neu)",
        price: 8.99 as ProductPrice,
        imageUrl: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Neu",
        createdAt: new Date(2023, 3, 17),
        seller: {
            name: "Marcel W.",
            rating: 3.5,
        },
    },
    {
        id: "6",
        title: "Physik Formelsammlung",
        price: "Zu verschenken" as ProductPrice,
        imageUrl: "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Gut",
        createdAt: new Date(2023, 3, 15),
        seller: {
            name: "Sarah L.",
            rating: 5,
        },
        isFree: true,
    },
    {
        id: "7",
        title: "Laptop-Tasche 15\"",
        price: 22.50 as ProductPrice,
        imageUrl: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Wie neu",
        createdAt: new Date(2023, 3, 14),
        seller: {
            name: "Felix R.",
            rating: 4,
        },
    },
    {
        id: "8",
        title: "Schulrucksack",
        price: 15 as ProductPrice,
        imageUrl: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Gebraucht",
        createdAt: new Date(2023, 3, 13),
        seller: {
            name: "Anja B.",
            rating: 4.5,
        },
    },
];
const Home = () => {
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

    const [filteredProducts, setFilteredProducts] = useState<Product[]>(dummyProducts);

    const applySearchAndFilter = () => {
        let filtered = dummyProducts;

        // Suche
        if (searchTerm.trim() !== "") {
            filtered = filtered.filter((p) =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter Kategorie
        if (filters.category !== "Alle Kategorien") {
            filtered = filtered.filter((p) => p.category === filters.category);
        }

        // Filter Zustand
        if (filters.condition !== "Alle Zustände") {
            filtered = filtered.filter((p) => p.condition === filters.condition);
        }

        // Filter kostenlos
        if (filters.isFree) {
            filtered = filtered.filter((p) => p.isFree);
        }

        // Preisfilter (preispflichtige Artikel zwischen Preisrange)
        filtered = filtered.filter((p) => {
            if (p.price === "Zu verschenken") {
                return filters.isFree;
            }
            return (
                typeof p.price === "number" &&
                p.price >= filters.priceRange[0] &&
                p.price <= filters.priceRange[1]
            );
        });

        setFilteredProducts(filtered);
    };

    // Filter + Suche neu anwenden, wenn sich Filter ändern
    useEffect(() => {
        applySearchAndFilter();
    }, [filters]);

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
    };

    const { user } = useAuth();
    const currentUserId = user?.id || ""; // fallback if not logged in

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

                {/* Suchfeld oben */}
                <div className="marktx-container my-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                applySearchAndFilter();
                            }
                        }}
                        placeholder="Suche nach Artikeln..."
                        className="w-full p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-marktx-blue-600"
                    />
                </div>

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
                            ].map((category) => (
                                <Button
                                    key={category}
                                    variant={filters.category === category ? "default" : "outline"}
                                    className="whitespace-nowrap"
                                    onClick={() =>
                                        setFilters((f) => ({
                                            ...f,
                                            category: category === "Alle Kategorien" ? "Alle Kategorien" : category,
                                        }))
                                    }
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="marktx-container py-8" >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <ProductFilter filters={filters} onFilterChange={handleFilterChange} />
                            <div className="bg-marktx-blue-50 border-2 border-marktx-blue-200 rounded-lg p-4 text-center">
                                <Tag size={24} className="mx-auto mb-2 text-marktx-blue-600" />
                                <h3 className="font-bold text-marktx-blue-700 mb-2">Artikel zu verschenken?</h3>
                                <p className="text-sm mb-3">Hast du Schulbücher oder andere Artikel, die du verschenken möchtest?</p>
                                <Button className="w-full btn-primary">
                                    <Link to="/create">Gratisanzeige erstellen</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <Tabs defaultValue="newest">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold" >Entdecke Angebote</h2>
                                    <TabsList>
                                        <TabsTrigger value="newest">Neueste</TabsTrigger>
                                        <TabsTrigger value="popular">Beliebteste</TabsTrigger>
                                        <TabsTrigger value="free">Zu verschenken</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="newest" className="mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredProducts.map((product) => (
                                            <ProductCard key={product.id} {...product} currentUserId={currentUserId} />
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="popular" className="mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredProducts
                                            .slice()
                                            .sort((a, b) => b.seller.rating - a.seller.rating)
                                            .map((product) => (
                                                <ProductCard key={product.id} {...product} currentUserId={currentUserId}/>
                                            ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="free" className="mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredProducts.filter((p) => p.isFree).map((product) => (
                                            <ProductCard key={product.id} {...product} currentUserId={currentUserId}/>
                                        ))}
                                    </div>
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
