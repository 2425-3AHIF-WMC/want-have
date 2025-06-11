import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "../components/ui/card";
import { Upload, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

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

const CreateListing: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [category, setCategory] = useState<string>(categories[0]);
    const [condition, setCondition] = useState<string>(conditions[0]);
    const [isFree, setIsFree] = useState(false);
    const [negotiable, setNegotiable] = useState(false);

    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number[]>([]);

    const [error, setError] = useState<string | null>(null);

    const MAX_TITLE_LENGTH = 100;
    const MIN_TITLE_LENGTH = 5;
    const MAX_DESC_LENGTH = 1000;
    const MIN_DESC_LENGTH = 10;
    const MAX_IMAGE_SIZE_MB = 5;
    const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

    // Datei-Auswahl
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);

            if (images.length + selectedFiles.length > 5) {
                toast.error("Du kannst maximal 5 Bilder hochladen!");
                return;
            }

            for (const file of selectedFiles) {
                if (file.size > MAX_IMAGE_SIZE_BYTES) {
                    toast.error(`Das Bild "${file.name}" ist größer als ${MAX_IMAGE_SIZE_MB} MB.`);
                    return;
                }
            }

            setImages((prev) => [...prev, ...selectedFiles]);
            const newPreviewUrls = selectedFiles.map((file) =>
                URL.createObjectURL(file)
            );
            setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
        }
    };

    // Bild entfernen
    const removeImage = (index: number) => {
        setImages((prev) => {
            const tmp = [...prev];
            tmp.splice(index, 1);
            return tmp;
        });
        setPreviewUrls((prev) => {
            URL.revokeObjectURL(prev[index]);
            const tmp = [...prev];
            tmp.splice(index, 1);
            return tmp;
        });
        setUploadProgress((prev) => {
            const tmp = [...prev];
            tmp.splice(index, 1);
            return tmp;
        });
    };

    const handleFreeChange = (checked: boolean) => {
        setIsFree(checked);
        if (checked) {
            setPrice("");
            setNegotiable(false);
        }
    };

    // Bilder zu Supabase hochladen (ohne echten Fortschritt, nur 0–100%)
    const uploadImages = async (): Promise<string[]> => {
        const uploadedUrls: string[] = [];
        setUploadProgress(new Array(images.length).fill(0));

        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const fileExt = image.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            const filePath = `listings/${fileName}`;

            const { data, error } = await supabase.storage
                .from("listings")
                .upload(filePath, image);

            if (error) {
                toast.error("Fehler beim Hochladen der Bilder: " + error.message);
                throw error;
            }

            setUploadProgress((prev) => {
                const tmp = [...prev];
                tmp[i] = 100;
                return tmp;
            });

            const { data: urlData } = supabase.storage
                .from("listings")
                .getPublicUrl(filePath);

            uploadedUrls.push(urlData.publicUrl);
        }

        return uploadedUrls;
    };

    // Formular absenden
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setError("Du musst eingeloggt sein, um eine Anzeige zu erstellen.");
            return;
        }

        if (!title || title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
            setError(`Titel muss zwischen ${MIN_TITLE_LENGTH} und ${MAX_TITLE_LENGTH} Zeichen lang sein.`);
            return;
        }
        if (
            !description ||
            description.length < MIN_DESC_LENGTH ||
            description.length > MAX_DESC_LENGTH
        ) {
            setError(`Beschreibung muss zwischen ${MIN_DESC_LENGTH} und ${MAX_DESC_LENGTH} Zeichen lang sein.`);
            return;
        }
        if (!category || !condition) {
            setError("Bitte wähle Kategorie und Zustand aus.");
            return;
        }
        if (!isFree) {
            if (price === "" || isNaN(Number(price))) {
                setError("Bitte gib einen gültigen Preis ein.");
                return;
            }
            if (Number(price) <= 0) {
                setError("Preis muss größer als 0 sein.");
                return;
            }
        }
        if (images.length === 0) {
            setError("Bitte füge mindestens ein Bild hinzu.");
            return;
        }

        setIsUploading(true);

        try {
            const imageUrls = await uploadImages();

            // -------------- API-Call an Backend --------------
            const payload = {
                title,
                description,
                price: isFree ? 0 : Number(price),
                category,
                condition,
                is_free: isFree,
                negotiable: isFree ? false : negotiable,
                image_urls: imageUrls,
                owner_id: user.id,
            };

            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/ads`,
                payload,
                { withCredentials: true }
            );

            toast.success("Anzeige erfolgreich erstellt!");
            navigate("/");
        } catch (err: any) {
            console.error("Upload fehlgeschlagen", err);
            toast.error("Der Upload ist fehlgeschlagen. Bitte versuche es erneut.");
        } finally {
            setIsUploading(false);
        }
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
                            {error && (
                                <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                                    {error}
                                </div>
                            )}
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
                                        maxLength={MAX_TITLE_LENGTH}
                                        minLength={MIN_TITLE_LENGTH}
                                    />
                                    <p className="text-xs text-gray-500">
                                        {title.length} / {MAX_TITLE_LENGTH} Zeichen
                                    </p>
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
                                        maxLength={MAX_DESC_LENGTH}
                                        minLength={MIN_DESC_LENGTH}
                                    />
                                    <p className="text-xs text-gray-500">
                                        {description.length} / {MAX_DESC_LENGTH} Zeichen
                                    </p>
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
                                                    {isUploading && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-md overflow-hidden">
                                                            <div
                                                                className="h-full bg-marktx-blue-600 transition-all duration-500"
                                                                style={{ width: `${uploadProgress[index] || 0}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {images.length < 5 && (
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-marktx-blue-600 bg-marktx-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-marktx-blue-700"
                                            >
                                                <Upload size={16} />
                                                <span>Bild hochladen</span>
                                            </label>
                                        )}
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={images.length >= 5 || isUploading}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max. 5 Bilder, je max. {MAX_IMAGE_SIZE_MB} MB
                                        </p>
                                    </div>
                                </div>

                                {/* Kategorie */}
                                <div>
                                    <Label htmlFor="category">Kategorie *</Label>
                                    <Select
                                        value={category}
                                        onValueChange={(value) => setCategory(value)}
                                    >
                                        <SelectTrigger id="category" className="w-full">
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

                                {/* Zustand */}
                                <div>
                                    <Label htmlFor="condition">Zustand *</Label>
                                    <Select
                                        value={condition}
                                        onValueChange={(value) => setCondition(value)}
                                    >
                                        <SelectTrigger id="condition" className="w-full">
                                            <SelectValue placeholder="Zustand auswählen" />
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

                                {/* Preis */}
                                <div>
                                    <Label htmlFor="price">Preis (€) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                        placeholder="Preis eingeben"
                                        disabled={isFree}
                                        required={!isFree}
                                    />
                                </div>

                                {/* Kostenlos */}
                                <div className="flex items-center gap-3">
                                    <input
                                        id="free"
                                        type="checkbox"
                                        checked={isFree}
                                        onChange={(e) => handleFreeChange(e.target.checked)}
                                    />
                                    <Label htmlFor="free" className="cursor-pointer">
                                        Kostenlos
                                    </Label>
                                </div>

                                {/* Verhandelbar */}
                                <div className="flex items-center gap-3">
                                    <input
                                        id="negotiable"
                                        type="checkbox"
                                        checked={negotiable}
                                        onChange={(e) => setNegotiable(e.target.checked)}
                                        disabled={isFree}
                                    />
                                    <Label htmlFor="negotiable" className="cursor-pointer">
                                        Preis verhandelbar
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isUploading}
                                    className="w-full"
                                >
                                    {isUploading ? "Anzeige wird erstellt..." : "Anzeige erstellen"}
                                </Button>
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
