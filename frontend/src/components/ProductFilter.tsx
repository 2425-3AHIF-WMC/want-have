import React, { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Filter } from "lucide-react";

type PriceRange = [number, number];

interface ProductFilterProps {
    filters: {
        category: string;
        condition: string;
        priceRange: PriceRange;
        isFree: boolean;
    };
    onFilterChange: (filters: {
        category: string;
        condition: string;
        priceRange: PriceRange;
        isFree: boolean;
    }) => void;
}

const categories = [
    "Alle Kategorien",
    "Schulbücher",
    "Elektronik",
    "Kleidung",
    "Möbel",
    "Schreibwaren",
    "Sonstiges",
];

const conditions = [
    "Alle Zustände",
    "Neu",
    "Wie neu",
    "Gut",
    "Akzeptabel",
];

const ProductFilter = ({ filters, onFilterChange }: ProductFilterProps) => {
    // Lokaler State, der vom Elternteil synchronisiert wird
    const [category, setCategory] = useState(filters.category);
    const [condition, setCondition] = useState(filters.condition);
    const [priceRange, setPriceRange] = useState(filters.priceRange);
    const [isFree, setIsFree] = useState(filters.isFree);

    // Synchronisiere lokale State mit props, falls sich diese ändern
    useEffect(() => {
        setCategory(filters.category);
        setCondition(filters.condition);
        setPriceRange(filters.priceRange);
        setIsFree(filters.isFree);
    }, [filters]);

    const applyFilters = () => {
        onFilterChange({
            category,
            condition,
            priceRange,
            isFree,
        });
    };

    const resetFilters = () => {
        setCategory("Alle Kategorien");
        setCondition("Alle Zustände");
        setPriceRange([0, 500]);
        setIsFree(false);
        onFilterChange({
            category: "Alle Kategorien",
            condition: "Alle Zustände",
            priceRange: [0, 500],
            isFree: false,
        });
    };

    return (
        <div className="space-y-6 p-4 bg-white rounded-md border border-gray-200 shadow-sm">
            <div>
                <Label htmlFor="category-select" className="mb-1 block font-semibold">
                    Kategorie
                </Label>
                <Select
                    value={category}
                    onValueChange={(value) => setCategory(value)}
                    //id="category-select"
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="condition-select" className="mb-1 block font-semibold">
                    Zustand
                </Label>
                <Select
                    value={condition}
                    onValueChange={(value) => setCondition(value)}
                    //id="condition-select"
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Zustand wählen" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {conditions.map((cond) => (
                                <SelectItem key={cond} value={cond}>
                                    {cond}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="price-range" className="mb-1 block font-semibold">
                    Preis (0€ - 500€)
                </Label>
                <Slider
                    id="price-range"
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as PriceRange)}
                    max={500}
                    step={1}
                    //range
                />
                <div className="flex justify-between text-sm mt-1">
                    <span>{priceRange[0]} €</span>
                    <span>{priceRange[1]} €</span>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="free-checkbox"
                    checked={isFree}
                    onChange={() => setIsFree(!isFree)}
                />
                <Label htmlFor="free-checkbox" className="select-none">
                    Nur Artikel zu verschenken anzeigen
                </Label>
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={resetFilters}>
                    Zurücksetzen
                </Button>
                <Button onClick={applyFilters} className="flex items-center space-x-2">
                    <Filter size={16} />
                    <span>Filter anwenden</span>
                </Button>
            </div>
        </div>
    );
};

export default ProductFilter;
