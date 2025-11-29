"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DogProfile from "@/app/components/DogProfile";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Dog, Activity, Trophy, Image as ImageIcon, Plus, X } from "lucide-react";
import Link from "next/link";

interface Dog {
    id: string;
    registered_name: string;
    call_name: string;
    registration_number: string;
    image_url?: string;
    owner: {
        email: string;
        is_aca_member: boolean;
    } | null;
}

export default function DogPage() {
    const params = useParams();
    const [dog, setDog] = useState<Dog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const [showHealthModal, setShowHealthModal] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Data States
    const [healthRecords, setHealthRecords] = useState<any[]>([]);
    const [wins, setWins] = useState<any[]>([]);
    const [gallery, setGallery] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDogData() {
            if (!params.id) return;

            // Fetch Dog
            const { data: dogData, error } = await supabase
                .from("dogs")
                .select(`
          id,
          registered_name,
          call_name,
          registration_number,
          image_url,
          owner:profiles (
            email,
            is_aca_member
          )
        `)
                .eq("id", params.id)
                .single();

            if (error) {
                console.error("Error fetching dog:", error);
                setError("Dog not found or error loading data.");
            } else {
                setDog(dogData as any);
            }

            // Fetch Related Data
            const { data: healthData } = await supabase.from("dog_health").select("*").eq("dog_id", params.id);
            if (healthData) setHealthRecords(healthData);

            const { data: winsData } = await supabase.from("dog_wins").select("*").eq("dog_id", params.id);
            if (winsData) setWins(winsData);

            const { data: galleryData } = await supabase.from("dog_gallery").select("*").eq("dog_id", params.id);
            if (galleryData) setGallery(galleryData);

            setLoading(false);
        }

        fetchDogData();
    }, [params.id]);

    const handleAddGalleryImage = async (url: string) => {
        if (!dog) return;
        const { error } = await supabase.from("dog_gallery").insert({
            dog_id: dog.id,
            image_url: url
        });

        if (!error) {
            const { data } = await supabase.from("dog_gallery").select("*").eq("dog_id", dog.id);
            if (data) setGallery(data);
            setShowGalleryModal(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading dog profile...</div>;
    }

    if (error || !dog) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Dog not found."}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <DogProfile
                    name={dog.call_name || dog.registered_name}
                    breed="Akita"
                    is_verified={dog.owner?.is_aca_member ?? false}
                    owner_email={dog.owner?.email ?? "Unknown"}
                    registration_number={dog.registration_number}
                    imageUrl={dog.image_url || "/placeholder-dog.jpg"}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Details & Health */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Official Details */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Dog className="text-teal-600" size={20} /> Official Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">Registered Name</p>
                                    <p className="font-medium text-lg">{dog.registered_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Registration Number</p>
                                    <p className="font-medium text-lg">{dog.registration_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Call Name</p>
                                    <p className="font-medium text-lg">{dog.call_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Breed</p>
                                    <p className="font-medium text-lg">Akita</p>
                                </div>
                            </div>
                        </div>

                        {/* Health & Genetics */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="text-red-500" size={20} /> Health & Genetics
                                </h3>
                                <Button variant="outline" size="sm" onClick={() => setShowHealthModal(true)}>
                                    <Plus size={16} className="mr-2" /> Add Record
                                </Button>
                            </div>

                            {healthRecords.length === 0 ? (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500 mb-2">No health records or genetic results added yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {healthRecords.map(record => (
                                        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{record.title}</p>
                                                <p className="text-xs text-gray-500">{record.type} • {new Date(record.created_at).toLocaleDateString()}</p>
                                            </div>
                                            {record.file_url && (
                                                <Link href={record.file_url} target="_blank" className="text-teal-600 text-sm hover:underline">View</Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Show Wins */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Trophy className="text-yellow-500" size={20} /> Show Wins
                                </h3>
                                <Button variant="outline" size="sm" onClick={() => setShowWinModal(true)}>
                                    <Plus size={16} className="mr-2" /> Add Win
                                </Button>
                            </div>

                            {wins.length === 0 ? (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500 mb-2">No show wins recorded yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {wins.map(win => (
                                        <div key={win.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            {win.image_url && (
                                                <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                                    <img src={win.image_url} alt={win.title} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{win.title}</p>
                                                <p className="text-xs text-gray-500">{win.show_name} • {new Date(win.win_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Gallery & Actions */}
                    <div className="space-y-8">
                        {/* Gallery */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <Link href={`/dogs/${dog.id}/gallery`} className="hover:opacity-80 transition-opacity">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <ImageIcon className="text-purple-500" size={20} /> Gallery
                                    </h3>
                                </Link>
                                <div className="flex items-center gap-2">
                                    <Link href={`/dogs/${dog.id}/gallery`}>
                                        <Button variant="ghost" size="sm" className="hidden sm:flex">View All</Button>
                                    </Link>
                                    <ImageUpload
                                        onChange={handleAddGalleryImage}
                                        variant="button"
                                        label="Upload"
                                        className="w-auto"
                                    />
                                </div>
                            </div>

                            {gallery.length === 0 ? (
                                <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    <ImageIcon size={32} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {gallery.map(item => (
                                        <div
                                            key={item.id}
                                            className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer"
                                            onClick={() => setSelectedImage(item.image_url)}
                                        >
                                            <img src={item.image_url} alt="Gallery" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showHealthModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Add Health Record</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const title = formData.get('title') as string;
                            const type = formData.get('type') as string;
                            const date = formData.get('date') as string;
                            const file = formData.get('file') as File;

                            if (!dog) return;

                            let file_url = null;

                            if (file && file.size > 0) {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                                const filePath = `health_records/${fileName}`;

                                const { error: uploadError } = await supabase.storage
                                    .from('documents')
                                    .upload(filePath, file);

                                if (uploadError) {
                                    console.error('Error uploading file:', uploadError);
                                } else {
                                    const { data: { publicUrl } } = supabase.storage
                                        .from('documents')
                                        .getPublicUrl(filePath);
                                    file_url = publicUrl;
                                }
                            }

                            const { error } = await supabase.from('dog_health').insert({
                                dog_id: dog.id,
                                title,
                                type,
                                record_date: date,
                                file_url
                            });

                            if (!error) {
                                const { data } = await supabase.from("dog_health").select("*").eq("dog_id", dog.id);
                                if (data) setHealthRecords(data);
                                setShowHealthModal(false);
                            }
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input name="title" required className="w-full p-2 border rounded-md" placeholder="e.g. OFA Hips" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select name="type" className="w-full p-2 border rounded-md">
                                        <option value="certificate">Certificate</option>
                                        <option value="genetic_test">Genetic Test</option>
                                        <option value="vaccination">Vaccination</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input name="date" type="date" required className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Document (Optional)</label>
                                    <input name="file" type="file" className="w-full p-2 border rounded-md" accept=".pdf,.jpg,.jpeg,.png" />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="outline" onClick={() => setShowHealthModal(false)}>Cancel</Button>
                                    <Button type="submit">Save Record</Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showWinModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Add Show Win</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const title = formData.get('title') as string;
                            const show_name = formData.get('show_name') as string;
                            const date = formData.get('date') as string;
                            const image_url = formData.get('image_url') as string;

                            if (!dog) return;

                            const { error } = await supabase.from('dog_wins').insert({
                                dog_id: dog.id,
                                title,
                                show_name,
                                win_date: date,
                                image_url: image_url || null
                            });

                            if (!error) {
                                const { data } = await supabase.from("dog_wins").select("*").eq("dog_id", dog.id);
                                if (data) setWins(data);
                                setShowWinModal(false);
                            }
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Win Image (Optional)</label>
                                    <div className="flex items-center gap-2">
                                        <ImageUpload
                                            onChange={(url) => {
                                                const input = document.getElementById('win-image-url') as HTMLInputElement;
                                                if (input) input.value = url;
                                            }}
                                            variant="button"
                                        />
                                        <span className="text-xs text-gray-500">Upload a photo of the win</span>
                                    </div>
                                    <input type="hidden" name="image_url" id="win-image-url" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Win Title</label>
                                    <input name="title" required className="w-full p-2 border rounded-md" placeholder="e.g. Best of Breed" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Show Name</label>
                                    <input name="show_name" required className="w-full p-2 border rounded-md" placeholder="e.g. Westminster 2024" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input name="date" type="date" required className="w-full p-2 border rounded-md" />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="outline" onClick={() => setShowWinModal(false)}>Cancel</Button>
                                    <Button type="submit">Save Win</Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Gallery Fullscreen"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
