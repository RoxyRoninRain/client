"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";

interface Dog {
    id: string;
    registered_name: string;
    call_name: string;
}

export default function DogGalleryPage() {
    const params = useParams();
    const [dog, setDog] = useState<Dog | null>(null);
    const [gallery, setGallery] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            if (!params.id) return;

            // Fetch Dog Basic Info
            const { data: dogData } = await supabase
                .from("dogs")
                .select("id, registered_name, call_name")
                .eq("id", params.id)
                .single();

            if (dogData) setDog(dogData as any);

            // Fetch Gallery
            const { data: galleryData } = await supabase
                .from("dog_gallery")
                .select("*")
                .eq("dog_id", params.id)
                .order("created_at", { ascending: false });

            if (galleryData) setGallery(galleryData);
            setLoading(false);
        }

        fetchData();
    }, [params.id]);

    const handleAddImage = async (url: string) => {
        if (!dog) return;
        const { error } = await supabase.from("dog_gallery").insert({
            dog_id: dog.id,
            image_url: url
        });

        if (!error) {
            const { data } = await supabase.from("dog_gallery").select("*").eq("dog_id", dog.id).order("created_at", { ascending: false });
            if (data) setGallery(data);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading gallery...</div>;
    if (!dog) return <div className="min-h-screen flex items-center justify-center">Dog not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/dogs/${dog.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft size={24} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{dog.call_name}'s Gallery</h1>
                            <p className="text-gray-500">{gallery.length} Photos</p>
                        </div>
                    </div>
                    <ImageUpload
                        onChange={handleAddImage}
                        variant="button"
                    />
                </div>

                {/* Gallery Grid */}
                {gallery.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                        <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No photos yet</h3>
                        <p className="text-gray-500 mb-6">Upload photos to showcase this dog.</p>
                        <div className="inline-block">
                            <ImageUpload
                                onChange={handleAddImage}
                                variant="button"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {gallery.map((item) => (
                            <div
                                key={item.id}
                                className="aspect-square bg-gray-200 rounded-xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all"
                                onClick={() => setSelectedImage(item.image_url)}
                            >
                                <img
                                    src={item.image_url}
                                    alt="Gallery"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Fullscreen"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
