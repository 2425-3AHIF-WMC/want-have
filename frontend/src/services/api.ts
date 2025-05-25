import axios from 'axios';
import { ProductPrice } from '@/components/ProductCard';

// Basis-URL für API-Anfragen - ändern Sie diese auf Ihre Backend-URL
const API_BASE_URL = 'http://localhost:3001/api';

// Interface für Produktdaten
export interface ProductData {
    id: string;
    title: string;
    price: ProductPrice;
    imageUrl: string;
    condition: string;
    createdAt: Date;
    seller: {
        name: string;
        rating: number;
    };
    isFree?: boolean;
    description?: string;
    category?: string;
}

// Interface für Filter-Parameter
export interface FilterParams {
    category?: string;
    condition?: string;
    priceMin?: number;
    priceMax?: number;
    isFree?: boolean;
}

// API-Client mit Axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Produkte abrufen mit optionalen Filtern
 */
export const getProducts = async (filters?: FilterParams): Promise<ProductData[]> => {
    try {
        const response = await apiClient.get('/products', { params: filters });
        return response.data;
    } catch (error) {
        console.error('Fehler beim Abrufen der Produkte:', error);
        return []; // Leeres Array zurückgeben
    }
};

/**
 * Einzelnes Produkt nach ID abrufen
 */
export const getProductById = async (id: string): Promise<ProductData | null> => {
    try {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Fehler beim Abrufen des Produkts mit ID ${id}:`, error);
        return null;
    }
};

/**
 * Neues Produkt erstellen
 */
export const createProduct = async (productData: FormData): Promise<ProductData | null> => {
    try {
        const response = await apiClient.post('/products', productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fehler beim Erstellen des Produkts:', error);
        return null;
    }
};
