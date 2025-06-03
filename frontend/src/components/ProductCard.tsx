
import React from "react";
import { Link } from "react-router-dom";
import {
    Card,
    CardContent
} from "./ui/card";
import { Star } from "lucide-react";
import axios from "axios";

export type ProductPrice = number | "Zu verschenken";

interface Seller {
    name: string;
    rating: number;
    id: string;
}

interface ProductCardProps {
    id: string;
    title: string;
    price: ProductPrice;
    imageUrl: string;
    condition: string;
    createdAt: Date;
    seller: Seller;
    isFree?: boolean;
    currentUserId: string;
    onDeleteSuccess?: () => void; // Callback, wenn erfolgreich gelöscht
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
                                                     onDeleteSuccess
                                                 }) => {
    const formattedDate = createdAt.toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handleSendRequest = async () => {
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/requests/${id}`,
                {
                    // Backend liest userId aus JWT
                },
                { withCredentials: true }
            );
            if (res.status === 201) {
                alert("Anfrage wurde erfolgreich gesendet!");
            } else {
                alert("Fehler beim Senden der Anfrage.");
            }
        } catch (err: any) {
            console.error("Fehler beim Senden der Anfrage:", err);
            const msg = err.response?.data?.error || err.message || "Unbekannter Fehler";
            alert("Fehler: " + msg);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Willst du die Anzeige wirklich löschen?")) return;
        try {
            const res = await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/products/${id}`,
                { withCredentials: true }
            );
            if (res.status === 200) {
                alert("Anzeige gelöscht.");
                onDeleteSuccess && onDeleteSuccess();
            } else {
                alert("Fehler beim Löschen der Anzeige.");
            }
        } catch (err: any) {
            console.error("Fehler beim Löschen:", err);
            const msg = err.response?.data?.error || err.message || "Unbekannter Fehler";
            alert("Fehler: " + msg);
        }
    };

    return (
        <Card className="bg-white shadow-md rounded-md overflow-hidden">
            <Link to={`/product/${id}`}>
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-48 object-cover"
                />
            </Link>
            <CardContent className="p-4">
                <Link to={`/product/${id}`} className="hover:underline">
                    <h3 className="text-lg font-semibold text-marktx-blue-700 mb-2 line-clamp-2">
                        {title}
                    </h3>
                </Link>
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

// Wrapper-Komponente, angepasst an API-Datenformat
interface Product {
    id: string;
    title: string;
    price: ProductPrice;
    imageUrl: string;
    condition: string;
    createdAt: Date;
    seller: Seller;
    isFree?: boolean;
}

interface ProductCardWrapperProps {
    product: Product;
    currentUserId: string;
    key?: React.Key;
    onDeleteSuccess?: () => void;
}

export const ProductCardWrapper: React.FC<ProductCardWrapperProps> = ({
                                                                          product,
                                                                          currentUserId,
                                                                          onDeleteSuccess
                                                                      }) => {
    return (
        <ProductCard
            id={product.id}
            title={product.title}
            price={product.price}
            imageUrl={product.imageUrl}
            condition={product.condition}
            createdAt={product.createdAt}
            seller={product.seller}
            isFree={product.isFree}
            currentUserId={currentUserId}
            onDeleteSuccess={onDeleteSuccess}
        />
    );
};

export default ProductCard;
