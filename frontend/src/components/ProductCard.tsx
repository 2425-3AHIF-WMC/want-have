import React from "react";
import { Card, CardContent } from "./ui/card";
import { Star } from "lucide-react";

export type ProductPrice = number | "Zu verschenken";

interface ProductCardProps {
    id: string;
    title: string;
    price: ProductPrice;
    imageUrl: string;
    condition: string;
    createdAt: Date;
    seller: {
        name: string;
        rating: number;
        id: string;
    };
    isFree?: boolean;
    currentUserId: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
                                                     id,
                                                     title,
                                                     price,
                                                     imageUrl,
                                                     condition,
                                                     createdAt,
                                                     seller,
                                                     isFree,
                                                     currentUserId,
                                                 }) => {
    const formattedDate = createdAt.toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handleSendRequest = async () => {
        try {
            await fetch("/api/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: id,
                    buyerId: currentUserId,
                    sellerId: seller.id,
                }),
            });
            alert("Anfrage wurde erfolgreich gesendet!");
        } catch (error) {
            alert("Fehler beim Senden der Anfrage.");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Willst du die Anzeige wirklich löschen?")) return;
        try {
            await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            alert("Anzeige gelöscht.");
            window.location.reload(); // Optional: Seite neu laden
        } catch (error) {
            alert("Fehler beim Löschen.");
        }
    };

    return (
        <Card className="bg-white shadow-md rounded-md overflow-hidden">
            <a href={`/product/${id}`}>
                <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
            </a>
            <CardContent className="p-4">
                <a href={`/product/${id}`} className="hover:underline">
                    <h3 className="text-lg font-semibold text-marktx-blue-700 mb-2 line-clamp-2">{title}</h3>
                </a>
                <p className="text-marktx-gray-600 text-sm mb-3">
                    {typeof price === "number" ? `${price.toFixed(2)} €` : price}
                    {isFree && <span className="ml-1 text-marktx-green-600"> (Gratis)</span>}
                </p>
                <div className="flex items-center text-sm text-marktx-gray-500 mb-2">
                    Zustand: {condition}
                </div>
                <div className="flex items-center text-sm text-marktx-gray-500 mb-2">
                    Verkauft von: {seller.name}
                </div>
                <div className="flex items-center text-sm text-marktx-gray-500">
                    Bewertung:
                    <Star size={14} className="text-yellow-500 ml-1 inline-block align-text-bottom" />
                    <span className="ml-1">{seller.rating}</span>
                </div>
                <p className="text-marktx-gray-400 text-xs mt-2">
                    Erstellt am: {formattedDate}
                </p>

                {/* Buttons */}
                <div className="mt-4">
                    {currentUserId === seller.id ? (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Anzeige löschen
                        </button>
                    ) : (
                        <button
                            onClick={handleSendRequest}
                            className="px-4 py-2 bg-marktx-blue-600 text-white rounded hover:bg-marktx-blue-700"
                        >
                            Anfrage senden
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// Neue Wrapper-Komponente
interface Product {
    id: string;
    title: string;
    price: ProductPrice;
    imageUrl: string;
    condition: string;
    createdAt: Date;
    seller: {
        name: string;
        rating: number;
        id: string;
    };
    isFree?: boolean;
}

interface ProductCardWrapperProps {
    product: Product;
    currentUserId: string;
    key?: React.Key;
}

export const ProductCardWrapper: React.FC<ProductCardWrapperProps> = ({ product, currentUserId }) => {
    return <ProductCard
        id={product.id}
        title={product.title}
        price={product.price}
        imageUrl={product.imageUrl}
        condition={product.condition}
        createdAt={product.createdAt}
        seller={product.seller}
        isFree={product.isFree}
        currentUserId={currentUserId}
    />;
};

export default ProductCard;
