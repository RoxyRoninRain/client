"use client";

import { useState } from "react";
import { ShieldCheck, Mail } from "lucide-react";

interface DogProfileProps {
    name: string;
    breed: string;
    is_verified: boolean;
    owner_email: string;
    imageUrl?: string;
    registration_number?: string;
}

export default function DogProfile({
    name,
    breed,
    is_verified,
    owner_email,
    imageUrl,
    registration_number,
}: DogProfileProps) {
    const [showEmail, setShowEmail] = useState(false);

    const handleContactClick = () => {
        setShowEmail(true);
        window.location.href = `mailto:${owner_email}`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden max-w-md mx-auto border border-gray-100 dark:border-gray-700">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
                {is_verified && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg" title="Verified Health Data">
                        <ShieldCheck size={24} />
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">{breed}</p>
                        {registration_number && (
                            <p className="text-xs text-gray-400 mt-1">Reg: {registration_number}</p>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleContactClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <Mail size={20} />
                        {showEmail ? "Opening Mail Client..." : "Contact Owner"}
                    </button>
                    {showEmail && (
                        <p className="text-center text-sm text-gray-500 mt-2 select-all">
                            {owner_email}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
