"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MapPin, Mail, Award, Plus, Baby } from "lucide-react";
import DogProfile from "@/components/DogProfile";
import { InviteGenerator } from "@/components/InviteGenerator";

interface Profile {
    id: string;
    kennel_name: string;
    real_name: string;
    region: string;
    email: string;
    is_aca_member: boolean;
    subscription_tier: string;
    created_at: string;
}

interface Dog {
    id: string;
    call_name: string;
    registered_name: string;
    breed: string; // Assuming 'breed' is a field or we default to Akita
    registration_number: string;
    image_url?: string;
    is_active_stud: boolean;
    is_available_puppy: boolean;
    is_retired: boolean;
    health_records: {
        is_verified: boolean;
    }[];
}

export default function PublicProfilePage() {
    const params = useParams();
    const id = params?.id as string;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [litters, setLitters] = useState<any[]>([]); // Using any for simplicity, should define interface
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (id) {
                fetchProfileData(user);
            }
        }
        init();
    }, [id]);

    async function fetchProfileData(user: any) {
        setLoading(true);

        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();

        if (profileError) {
            // Handle "No Rows" error (PGRST116)
            if (profileError.code === 'PGRST116') {
                if (user && user.id === id) {
                    // Current user has no profile row -> Prompt to create one?
                    // For now, we can just show a "Setup Profile" message or minimal fallback
                    console.warn("Profile row missing for current user.");
                    // Fallback object so the page renders for the owner
                    setProfile({
                        id: user.id,
                        email: user.email,
                        real_name: "New User",
                        kennel_name: "My Kennel",
                        region: "Unknown",
                        is_aca_member: false,
                        subscription_tier: "free",
                        created_at: new Date().toISOString()
                    });
                } else {
                    setError("Breeder not found.");
                }
            } else {
                console.error("Error fetching profile:", JSON.stringify(profileError, null, 2));
                setError("Error loading profile.");
            }
        } else {
            setProfile(profileData);
        }

        // 2. Fetch Dogs
        const { data: dogsData } = await supabase
            .from("dogs")
            .select(`*, health_records (is_verified)`)
            .eq("owner_id", id);

        setDogs(dogsData as any || []);

        // 3. Fetch Litters
        const { data: littersData } = await supabase
            .from("litters")
            .select(`
                id, 
                whelp_date,
                sire:dogs!sire_id(call_name),
                dam:dogs!dam_id(call_name)
            `)
            .eq("owner_id", id);

        setLitters(littersData || []);

        setLoading(false);
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    // If we have an error and NO profile fallback, show error
    if (error && !profile) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">Profile not found</div>;

    const isOwner = currentUser && currentUser.id === profile.id;
    const studs = dogs.filter(d => d.is_active_stud);
    const puppies = dogs.filter(d => d.is_available_puppy);
    const others = dogs.filter(d => !d.is_active_stud && !d.is_available_puppy);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Profile Header */}
                <Card className="border-none shadow-md overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900"></div>
                    <CardContent className="relative pt-0 pb-8 px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 mb-6 gap-4">
                            <div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg inline-block mb-4">
                                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-3xl">
                                        🐕
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {profile.kennel_name || profile.real_name}
                                    {profile.is_aca_member && (
                                        <span title="ACA Member">
                                            <ShieldCheck className="text-blue-600" size={24} />
                                        </span>
                                    )}
                                </h1>
                                <div className="flex items-center gap-2 text-gray-500 mt-1">
                                    <MapPin size={16} />
                                    <span>{profile.region || "Unknown Region"}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                                {isOwner ? (
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => window.location.href = '/kennel/add-dog'}>
                                            <Plus size={16} className="mr-2" /> Add Dog
                                        </Button>
                                        <Button variant="outline" onClick={() => window.location.href = '/kennel/log-litter'}>
                                            <Plus size={16} className="mr-2" /> Log Litter
                                        </Button>
                                    </div>
                                ) : (
                                    <Button className="flex items-center gap-2" onClick={() => window.location.href = `mailto:${profile.email}`}>
                                        <Mail size={16} /> Contact Breeder
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex gap-2">
                                {profile.is_aca_member && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">ACA Member</Badge>}
                                {profile.subscription_tier === 'pro' && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pro Breeder</Badge>}
                            </div>

                            {/* Invite Generator for Owner */}
                            {isOwner && (
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border">
                                    <span className="text-sm text-gray-500 font-medium">Invite Codes:</span>
                                    <InviteGenerator userId={profile.id} />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Litters Section */}
                {litters.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Baby className="text-pink-500" /> Litters
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {litters.map(litter => (
                                <Card key={litter.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Born {new Date(litter.whelp_date).toLocaleDateString()}</CardTitle>
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
                    </section>
                )}

                {/* Dogs Sections */}
                <div className="space-y-8">
                    {studs.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Award className="text-amber-500" /> Active Studs
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studs.map(dog => (
                                    <DogProfile
                                        key={dog.id}
                                        name={dog.call_name}
                                        breed="Akita"
                                        is_verified={dog.health_records?.[0]?.is_verified || false}
                                        owner_email={profile.email}
                                        registration_number={dog.registration_number}
                                        imageUrl={dog.image_url}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {puppies.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Award className="text-green-500" /> Available Puppies
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {puppies.map(dog => (
                                    <DogProfile
                                        key={dog.id}
                                        name={dog.call_name}
                                        breed="Akita"
                                        is_verified={dog.health_records?.[0]?.is_verified || false}
                                        owner_email={profile.email}
                                        registration_number={dog.registration_number}
                                        imageUrl={dog.image_url}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {others.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-500">Other Dogs</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                                {others.map(dog => (
                                    <DogProfile
                                        key={dog.id}
                                        name={dog.call_name}
                                        breed="Akita"
                                        is_verified={dog.health_records?.[0]?.is_verified || false}
                                        owner_email={profile.email}
                                        registration_number={dog.registration_number}
                                        imageUrl={dog.image_url}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
