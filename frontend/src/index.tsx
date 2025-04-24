import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductFilter from "@/components/ProductFilter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Tag } from "lucide-react";

// Updated type for the price property
type ProductPrice = number | "Zu verschenken";

// Dummy-Daten für die Beispiel-Produkte
const dummyProducts = [
    {
        id: "1",
        title: "Mathematik Schulbuch 5. Klasse",
        price: "Zu verschenken" as ProductPrice,
        imageUrl: "https://images.unsplash.com/photo-1588580000645-4562a6d2c839?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Gut",
        createdAt: new Date(2023, 3, 20),
        seller: {
            name: "Marie S.",
            rating: 4.5,
        },
        isFree: true,
    },
    {
        id: "2",
        title: "Grafiktaschenrechner TI-84",
        price: 45.99 as ProductPrice,
        imageUrl: "https://images.unsplash.com/photo-1613834926943-64d32d57cd55?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        condition: "Wie neu",
        createdAt: new Date(),
        seller: {
            name: "Thomas H.",
            rating: 5,
        },
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

const Index = () => {
    const handleFilterChange = (filters: any) => {
        console.log("Filter geändert:", filters);
        // Hier später die Filterlogik implementieren
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow">
                {/* Hero-Bereich */}
                <div className="bg-marktx-blue-600 text-white py-12">
                    <div className="marktx-container">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                Willkommen bei MarktX!
                            </h1>
                            <p className="text-xl mb-6">
                                Der Handelsplatz für Schülerinnen und Schüler der HTL Leonding.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <Button className="bg-white text-marktx-blue-600 hover:bg-marktx-blue-50">
                                    Angebote stöbern
                                </Button>
                                <Button className="btn-accent">
                                    Anzeige erstellen
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kategorie-Navigation */}
                <div className="bg-marktx-gray-100 py-6">
                    <div className="marktx-container">
                        <div className="flex overflow-x-auto pb-2 space-x-4 scrollbar-none">
                            {["Alle Kategorien", "Schulbücher", "Elektronik", "Kleidung", "Möbel", "Schreibwaren", "Sonstiges"].map((category) => (
                                <Button
                                    key={category}
                                    variant="outline"
                                    className="whitespace-nowrap"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Hauptinhalt */}
                <div className="marktx-container py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Linke Spalte: Filter */}
                        <div className="lg:col-span-1">
                            <ProductFilter onFilterChange={handleFilterChange} />

                            {/* Zu verschenken-Bereich */}
                            <div className="bg-marktx-blue-50 border-2 border-marktx-blue-200 rounded-lg p-4 text-center">
                                <Tag size={24} className="mx-auto mb-2 text-marktx-blue-600" />
                                <h3 className="font-bold text-marktx-blue-700 mb-2">Artikel zu verschenken?</h3>
                                <p className="text-sm mb-3">Hast du Schulbücher oder andere Artikel, die du verschenken möchtest?</p>
                                <Button className="w-full btn-primary">Gratisanzeige erstellen</Button>
                            </div>
                        </div>

                        {/* Rechte Spalte: Produktliste */}
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

                                <TabsContent value="newest" className="mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {dummyProducts.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                id={product.id}
                                                title={product.title}
                                                price={product.price}
                                                imageUrl={product.imageUrl}
                                                condition={product.condition}
                                                createdAt={product.createdAt}
                                                seller={product.seller}
                                                isFree={product.isFree}
                                            />
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="popular" className="mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Hier würden beliebte Produkte angezeigt werden */}
                                        {dummyProducts
                                            .slice()
                                            .sort((a, b) => b.seller.rating - a.seller.rating)
                                            .map((product) => (
                                                <ProductCard
                                                    key={product.id}
                                                    id={product.id}
                                                    title={product.title}
                                                    price={product.price}
                                                    imageUrl={product.imageUrl}
                                                    condition={product.condition}
                                                    createdAt={product.createdAt}
                                                    seller={product.seller}
                                                    isFree={product.isFree}
                                                />
                                            ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="free" className="mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {dummyProducts
                                            .filter((product) => product.isFree)
                                            .map((product) => (
                                                <ProductCard
                                                    key={product.id}
                                                    id={product.id}
                                                    title={product.title}
                                                    price={product.price}
                                                    imageUrl={product.imageUrl}
                                                    condition={product.condition}
                                                    createdAt={product.createdAt}
                                                    seller={product.seller}
                                                    isFree={product.isFree}
                                                />
                                            ))}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="mt-8 flex justify-center">
                                <Button variant="outline" className="flex items-center space-x-2">
                                    <span>Mehr anzeigen</span>
                                    <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Index;