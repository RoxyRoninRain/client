"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MapPin, Mail, Phone, Globe, Baby, Dog, Award, Edit2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DogProfile from "@/components/DogProfile";

interface Profile {
    id: string;
    real_name: string;
    kennel_name: string;
    region: string;
    bio: string;
    cover_photo_url: string;
    avatar_url: string;
    contact_email: string;
    contact_phone: string;
    website: string;
    preferred_contact_method: 'email' | 'phone' | 'website';
    role: string;
    subscription_tier: string;
    is_aca_member: boolean;
}

interface Dog {
    id: string;
    call_name: string;
    registered_name: string;
    registration_number: string;
    image_url?: string;
    is_active_stud: boolean;
    is_available_puppy: boolean;
    health_records: {
        is_verified: boolean;
    }[];
}

interface Litter {
    id: string;
    whelp_date: string;
    litter_name?: string;
    puppy_count?: number;
    sire_name?: string;
    dam_name?: string;
    sire?: { call_name: string } | null;
    dam?: { call_name: string } | null;
}

export default function PublicProfilePage() {
    const params = useParams();
    const id = params?.id as string;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [litters, setLitters] = useState<Litter[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (!id) return;

            // Fetch Profile
            const { data: profileData, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id)
                .single();

            if (profileData) {
                setProfile(profileData);
            } else {
                console.error("Error fetching profile:", error);
            }

            // Fetch Dogs
            const { data: dogsData } = await supabase
                .from("dogs")
                .select(`*, health_records (is_verified)`)
                .eq("owner_id", id);

            if (dogsData) setDogs(dogsData as any || []);

            // Fetch Litters
            const { data: littersData } = await supabase
                .from("litters")
                .select(`
                    id, 
                    whelp_date,
                    litter_name,
                    puppy_count,
                    sire_name,
                    dam_name,
                    sire:dogs!sire_id(call_name),
                    dam:dogs!dam_id(call_name)
                `)
                .eq("owner_id", id);

            if (littersData) {
                const formattedLitters = littersData.map((l: any) => ({
                    ...l,
                    sire: Array.isArray(l.sire) ? l.sire[0] : l.sire,
                    dam: Array.isArray(l.dam) ? l.dam[0] : l.dam
                }));
                setLitters(formattedLitters);
            }

            setLoading(false);
        }

        loadData();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
                <Link href="/directory">
                    <Button>Back to Directory</Button>
                </Link>
            </div>
        );
    }

    const isOwner = currentUser && currentUser.id === profile.id;
    const studs = dogs.filter(d => d.is_active_stud);
    const puppies = dogs.filter(d => d.is_available_puppy);
    const others = dogs.filter(d => !d.is_active_stud && !d.is_available_puppy);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Cover Photo */}
            <div className="h-48 md:h-64 bg-gray-300 dark:bg-gray-800 relative">
                {profile.cover_photo_url ? (
                    <img src={profile.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Dog size={48} />
                    </div>
                )}
                <Link href="/directory" className="absolute top-4 left-4">
                    <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                        <ArrowLeft size={16} className="mr-2" /> Back
                    </Button>
                </Link>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 overflow-hidden flex-shrink-0 relative">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                    {profile.real_name?.[0]}
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {profile.kennel_name || profile.real_name}
                                        {profile.is_aca_member && (
                                            <span title="ACA Member">
                                                <ShieldCheck className="text-blue-600" size={24} />
                                            </span>
                                        )}
                                    </h1>
                                    {profile.kennel_name && profile.real_name && (
                                        <p className="text-gray-500 font-medium">{profile.real_name}</p>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <MapPin size={14} /> {profile.region || "No region set"}
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        {profile.is_aca_member && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">ACA Member</Badge>}
                                        {profile.subscription_tier === 'pro' && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pro Breeder</Badge>}
                                    </div>

                                    <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl">
                                        {profile.bio || "No bio added yet."}
                                    </p>

                                    <div className="flex flex-wrap gap-4 mt-4">
                                        {profile.contact_email && (
                                            <div className={`flex items-center gap-2 text-sm ${profile.preferred_contact_method === 'email' ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                                                <Mail size={14} /> {profile.contact_email}
                                            </div>
                                        )}
                                        {profile.contact_phone && (
                                            <div className={`flex items-center gap-2 text-sm ${profile.preferred_contact_method === 'phone' ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                                                <Phone size={14} /> {profile.contact_phone}
                                            </div>
                                        )}
                                        {profile.website && (
                                            <div className={`flex items-center gap-2 text-sm ${profile.preferred_contact_method === 'website' ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                                                <Globe size={14} /> <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Website</a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    {isOwner ? (
                                        <Link href="/profile">
                                            <Button className="w-full">
                                                <Edit2 size={16} className="mr-2" /> Manage Profile
                                            </Button>
                                        </Link>
                                    ) : (
                                        profile.contact_email && (
                                            <Button className="w-full flex items-center gap-2" onClick={() => window.location.href = `mailto:${profile.contact_email}`}>
                                                <Mail size={16} /> Contact Breeder
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column: Dogs */}
                    <div className={`${litters.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>

                        {/* Active Studs */}
                        {studs.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                    <Award className="text-amber-500" /> Active Studs
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {studs.map(dog => (
                                        <DogProfile
                                            key={dog.id}
                                            name={dog.call_name}
                                            breed="Akita"
                                            is_verified={dog.health_records?.[0]?.is_verified || false}
                                            owner_email={profile.contact_email || ""}
                                            registration_number={dog.registration_number}
                                            imageUrl={dog.image_url}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Available Puppies */}
                        {puppies.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                    <Award className="text-green-500" /> Available Puppies
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {puppies.map(dog => (
                                        <DogProfile
                                            key={dog.id}
                                            name={dog.call_name}
                                            breed="Akita"
                                            is_verified={dog.health_records?.[0]?.is_verified || false}
                                            owner_email={profile.contact_email || ""}
                                            registration_number={dog.registration_number}
                                            imageUrl={dog.image_url}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Other Dogs */}
                        {others.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                    <Dog className="text-teal-600" /> Our Dogs
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {others.map(dog => (
                                        <DogProfile
                                            key={dog.id}
                                            name={dog.call_name}
                                            breed="Akita"
                                            is_verified={dog.health_records?.[0]?.is_verified || false}
                                            owner_email={profile.contact_email || ""}
                                            registration_number={dog.registration_number}
                                            imageUrl={dog.image_url}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {dogs.length === 0 && (
                            <Card className="bg-gray-50 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Dog size={48} className="mb-4 opacity-20" />
                                    <p>No dogs added yet.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Litters */}
                    {litters.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Baby className="text-purple-600" /> Active Litters
                            </h2>
                            <div className="grid gap-4">
                                {litters.map(litter => (
                                    <Card key={litter.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{litter.litter_name || "Unnamed Litter"}</CardTitle>
                                            <p className="text-sm text-gray-500">Whelped: {new Date(litter.whelp_date).toLocaleDateString()}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col gap-1 text-sm">
                                                <p><span className="font-medium">Sire:</span> {litter.sire_name || litter.sire?.call_name || "Unknown"}</p>
                                                <p><span className="font-medium">Dam:</span> {litter.dam_name || litter.dam?.call_name || "Unknown"}</p>
                                                <p className="mt-2 font-medium text-purple-600">{litter.puppy_count} Puppies</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
