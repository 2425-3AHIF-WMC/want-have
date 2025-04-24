import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Upload, X, Image } from "lucide-react";

const categories = [
    "Schulbücher",
    "Elektronik",
    "Kleidung",
    "Möbel",
    "Schreibwaren",
    "Sonstiges"
];

const conditions = [
    "Neu",
    "Wie neu",
    "Gut",
    "Akzeptabel",
    "Gebraucht"
];

const CreateListing = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [isFree, setIsFree] = useState(false);
    const [negotiable, setNegotiable] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);

            if (images.length + selectedFiles.length > 5) {
                alert("Du kannst maximal 5 Bilder hochladen!");
                return;
            }

            setImages([...images, ...selectedFiles]);

            // Erzeuge Preview-URLs für die Bilder
            const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...newPreviewUrls]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviewUrls = [...previewUrls];
        URL.revokeObjectURL(newPreviewUrls[index]);
        newPreviewUrls.splice(index, 1);
        setPreviewUrls(newPreviewUrls);
    };

    const handleFreeChange = (checked: boolean) => {
        setIsFree(checked);
        if (checked) {
            setPrice("");
            setNegotiable(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validierung
        if (!title || !description || !category || !condition) {
            alert("Bitte fülle alle Pflichtfelder aus!");
            return;
        }

        if (!isFree && (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
            alert("Bitte gib einen gültigen Preis ein!");
            return;
        }

        if (images.length === 0) {
            alert("Bitte füge mindestens ein Bild hinzu!");
            return;
        }

        // Hier würde später der API-Call erfolgen
        console.log({
            title,
            description,
            price: isFree ? 0 : parseFloat(price),
            category,
            condition,
            isFree,
            negotiable,
            images,
        });

        // Rückgängig machen der Objekt-URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));

        alert("Anzeige erfolgreich erstellt!");
        navigate("/");
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow py-8">
                <div className="marktx-container max-w-3xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Neue Anzeige erstellen</CardTitle>
                            <CardDescription>
                                Fülle das Formular aus, um deine Anzeige zu erstellen. Felder mit * sind Pflichtfelder.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Titel */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Titel *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="z.B. Mathematik Schulbuch 5. Klasse"
                                        required
                                    />
                                </div>

                                {/* Beschreibung */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Beschreibung *</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Beschreibe den Artikel genauer. Zustand, Besonderheiten, etc."
                                        required
                                        rows={5}
                                    />
                                </div>

                                {/* Bilder */}
                                <div className="space-y-2">
                                    <Label htmlFor="images">Bilder *</Label>
                                    <div className="border-2 border-dashed border-marktx-gray-300 rounded-lg p-6 text-center">
                                        <div className="mb-4 flex flex-wrap gap-3 justify-center">
                                            {previewUrls.map((url, index) => (
                                                <div key={index} className="relative w-24 h-24">
                                                    <img
                                                        src={url}
                                                        alt={`Vorschau ${index}`}
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute -top-2 -right-2 bg-marktx-accent-red text-white rounded-full p-1"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}

                                            {previewUrls.length === 0 && (
                                                <div className="w-full">
                                                    <Image size={48} className="mx-auto text-marktx-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer p-3 bg-marktx-blue-50 text-marktx-blue-600 rounded-md inline-flex items-center text-sm"
                                        >
                                            <Upload size={16} className="mr-2" />
                                            {previewUrls.length === 0
                                                ? "Bilder hochladen"
                                                : "Weitere Bilder hinzufügen"}
                                        </label>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />

                                        <p className="mt-2 text-xs text-marktx-gray-500">
                                            {images.length}/5 Bilder (max. 5 MB pro Bild)
                                        </p>
                                    </div>
                                </div>

                                {/* Kategorie und Zustand */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Kategorie *</Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="Kategorie auswählen" />
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

                                    <div className="space-y-2">
                                        <Label htmlFor="condition">Zustand *</Label>
                                        <Select value={condition} onValueChange={setCondition}>
                                            <SelectTrigger id="condition">
                                                <SelectValue placeholder="Zustand auswählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {conditions.map((con) => (
                                                        <SelectItem key={con} value={con}>
                                                            {con}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Preis */}
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="free"
                                            checked={isFree}
                                            onChange={(e) => handleFreeChange(e.target.checked)}
                                            className="mr-2 h-4 w-4 text-marktx-blue-600"
                                        />
                                        <Label htmlFor="free">
                                            Zu verschenken
                                        </Label>
                                    </div>

                                    {!isFree && (
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Preis (€) *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    className="pl-8"
                                                    placeholder="0.00"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-marktx-gray-500">
                          €
                        </span>
                                            </div>

                                            <div className="flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    id="negotiable"
                                                    checked={negotiable}
                                                    onChange={(e) => setNegotiable(e.target.checked)}
                                                    disabled={isFree}
                                                    className="mr-2 h-4 w-4 text-marktx-blue-600"
                                                />
                                                <Label htmlFor="negotiable">
                                                    Verhandlungsbasis
                                                </Label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/")}
                                    >
                                        Abbrechen
                                    </Button>
                                    <Button type="submit" className="btn-primary">
                                        Anzeige erstellen
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CreateListing;