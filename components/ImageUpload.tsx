"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X, Upload } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    bucket?: string;
    path?: string;
    className?: string;
    placeholder?: React.ReactNode;
    aspectRatio?: "square" | "video" | "wide";
    variant?: "default" | "compact" | "button";
    label?: string;
    sizes?: string;
}

export default function ImageUpload({
    value,
    onChange,
    bucket = "images",
    path = "uploads",
    className = "",
    placeholder,
    aspectRatio = "square",
    variant = "default",
    label,
    sizes = "(max-width: 768px) 100vw, 50vw"
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        setUploading(true);
        setError(null);

        try {
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onChange(publicUrl);
        } catch (err: any) {
            console.error("Error uploading image:", err);
            setError(err.message || "Failed to upload image");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
    };

    const aspectRatioClass = {
        square: "aspect-square",
        video: "aspect-video",
        wide: "aspect-[3/1]"
    }[aspectRatio];

    if (variant === "button") {
        return (
            <>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />
                <div onClick={() => fileInputRef.current?.click()}>
                    {uploading ? (
                        <Button disabled variant="outline" size="sm">
                            <Loader2 className="animate-spin mr-2" size={16} /> Uploading...
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" className={className}>
                            <Upload className="mr-2" size={16} /> {label || "Upload Image"}
                        </Button>
                    )}
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </>
        );
    }

    return (
        <div className={`relative group ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {value ? (
                <div className={`relative w-full ${aspectRatioClass} ${className.includes('rounded') ? '' : 'rounded-lg'} overflow-hidden border border-gray-200`}>
                    <Image
                        src={value}
                        alt="Uploaded image"
                        fill
                        sizes={sizes}
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Change
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                        >
                            <X size={16} />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full ${aspectRatioClass} bg-gray-50 border-2 border-dashed border-gray-300 ${className.includes('rounded') ? '' : 'rounded-lg'} flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors p-4`}
                >
                    {uploading ? (
                        <Loader2 className="animate-spin text-teal-600" size={24} />
                    ) : (
                        <>
                            {placeholder || <Camera className="text-gray-400 mb-2" size={24} />}
                            <span className="text-sm text-gray-500 font-medium">Upload Image</span>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}
