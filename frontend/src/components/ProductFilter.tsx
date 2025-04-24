import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Filter } from "lucide-react";

type PriceRange = [number, number];

interface ProductFilterProps {
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
    "Sonstiges"
];

const conditions = [
    "Alle Zustände",
    "Neu",
    "Wie neu",
    "Gut",
    "Akzeptabel",
    "Gebraucht"
];

const ProductFilter = ({ onFilterChange }: ProductFilterProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("Alle Kategorien");
    const [selectedCondition, setSelectedCondition] = useState<string>("Alle Zustände");
    const [priceRange, setPriceRange] = useState<PriceRange>([0, 500]);
    const [showOnlyFree, setShowOnlyFree] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const handleApplyFilters = () => {
        onFilterChange({
            category: selectedCategory,
            condition: selectedCondition,
            priceRange,
            isFree: showOnlyFree,
        });
    };

    const handleResetFilters = () => {
        setSelectedCategory("Alle Kategorien");
        setSelectedCondition("Alle Zustände");
        setPriceRange([0, 500]);
        setShowOnlyFree(false);

        onFilterChange({
            category: "Alle Kategorien",
            condition: "Alle Zustände",
            priceRange: [0, 500],
            isFree: false,
        });
    };

    return (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Filter size={18} className="mr-2 text-marktx-blue-600" />
                    <h3 className="font-medium">Filter</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                </Button>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="category" className="text-sm">Kategorie</Label>
                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                        <SelectTrigger id="category" className="w-full">
                            <SelectValue placeholder="Wähle eine Kategorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {isExpanded && (
                    <>
                        <div>
                            <Label htmlFor="condition" className="text-sm">Zustand</Label>
                            <Select
                                value={selectedCondition}
                                onValueChange={setSelectedCondition}
                            >
                                <SelectTrigger id="condition" className="w-full">
                                    <SelectValue placeholder="Wähle einen Zustand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {conditions.map((condition) => (
                                            <SelectItem key={condition} value={condition}>
                                                {condition}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <Label className="text-sm">Preis</Label>
                                <span className="text-sm text-marktx-gray-500">
                  {priceRange[0]}€ - {priceRange[1]}€
                </span>
                            </div>
                            <Slider
                                defaultValue={priceRange}
                                min={0}
                                max={500}
                                step={5}
                                onValueChange={(values) => setPriceRange(values as PriceRange)}
                                className="py-4"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="free"
                                checked={showOnlyFree}
                                onChange={(e) => setShowOnlyFree(e.target.checked)}
                                className="mr-2 h-4 w-4 text-marktx-blue-600"
                            />
                            <Label htmlFor="free" className="text-sm">Nur Artikel zum Verschenken</Label>
                        </div>
                    </>
                )}

                <div className="flex space-x-3 pt-2">
                    <Button
                        onClick={handleApplyFilters}
                        className="btn-primary flex-1"
                    >
                        Anwenden
                    </Button>
                    <Button
                        onClick={handleResetFilters}
                        variant="outline"
                        className="flex-1"
                    >
                        Zurücksetzen
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductFilter;