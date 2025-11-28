"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DogProfile from "@/app/components/DogProfile";

interface Dog {
    id: string;
    registered_name: string;
    call_name: string;
    registration_number: string;
    owner: {
        email: string;
        is_aca_member: boolean;
    };
}

export default function DogPage() {
    const params = useParams();
    const [dog, setDog] = useState<Dog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchDog() {
            if (!params.id) return;

            const { data, error } = await supabase
                .from("dogs")
                .select(`
          id,
          registered_name,
          call_name,
          registration_number,
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
                // Supabase returns owner as an array or object depending on relationship, 
                // but .single() on the main query helps. 
                // However, the foreign key relation returns an object if 1:1 or array if 1:N.
                // Assuming profiles is 1:1 from dogs.owner_id, it should be an object.
                // We need to cast it safely.
                setDog(data as any);
            }
            setLoading(false);
        }

        fetchDog();
    }, [params.id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading dog profile...</div>;
    }

    if (error || !dog) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Dog not found."}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <DogProfile
                    name={dog.call_name || dog.registered_name}
                    breed="Akita" // Hardcoded for now
                    is_verified={dog.owner.is_aca_member} // Using owner's ACA status as proxy for verification for MVP
                    owner_email={dog.owner.email}
                    registration_number={dog.registration_number}
                    imageUrl="/placeholder-dog.jpg" // Placeholder until we have image storage
                />

                <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Official Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Registered Name</p>
                            <p className="font-medium">{dog.registered_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Registration Number</p>
                            <p className="font-medium">{dog.registration_number}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
