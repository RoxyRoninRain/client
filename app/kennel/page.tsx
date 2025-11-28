"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Dog, Baby } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Dog {
    id: string;
    call_name: string;
    registered_name: string;
    registration_number: string;
}

interface Litter {
    id: string;
    whelp_date: string;
    sire: { call_name: string } | null;
    dam: { call_name: string } | null;
}

export default function KennelDashboard() {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [litters, setLitters] = useState<Litter[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            // Fetch Dogs
            const { data: dogsData } = await supabase
                .from("dogs")
                .select("id, call_name, registered_name, registration_number")
                .eq("owner_id", user.id);

            // Fetch Litters
            const { data: littersData } = await supabase
                .from("litters")
                .select(`
          id, 
          whelp_date,
          sire:dogs!sire_id(call_name),
          dam:dogs!dam_id(call_name)
        `)
                .eq("owner_id", user.id);

            setDogs(dogsData || []);
            // Cast littersData because Supabase types for joins can be tricky
            setLitters((littersData as any) || []);
            setLoading(false);
        }

        fetchData();
    }, [router]);

    if (loading) {
        return <div className="p-8 text-center">Loading kennel data...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Kennel</h1>
                    <p className="text-gray-500">Manage your dogs and litters</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/kennel/add-dog">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} /> Add Dog
                        </Button>
                    </Link>
                    <Link href="/kennel/log-litter">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Plus size={16} /> Log Litter
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Dogs Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Dog className="text-blue-500" /> Your Dogs
                    </h2>
                    {dogs.length === 0 ? (
                        <Card className="bg-gray-50 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <p>No dogs added yet.</p>
                                <Link href="/kennel/add-dog" className="text-blue-600 hover:underline mt-2">Add your first dog</Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {dogs.map(dog => (
                                <Card key={dog.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{dog.call_name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-500">{dog.registered_name}</p>
                                        <p className="text-xs text-gray-400 mt-1">{dog.registration_number}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* Litters Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Baby className="text-pink-500" /> Your Litters
                    </h2>
                    {litters.length === 0 ? (
                        <Card className="bg-gray-50 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <p>No litters logged yet.</p>
                                <Link href="/kennel/log-litter" className="text-blue-600 hover:underline mt-2">Log a litter</Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {litters.map(litter => (
                                <Card key={litter.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Litter born {new Date(litter.whelp_date).toLocaleDateString()}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600">
                                            Sire: <span className="font-medium">{litter.sire?.call_name || "Unknown"}</span>
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Dam: <span className="font-medium">{litter.dam?.call_name || "Unknown"}</span>
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
