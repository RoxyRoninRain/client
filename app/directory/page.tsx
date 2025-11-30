"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ShieldCheck, Users, Dog as DogIcon, MapPin } from "lucide-react";
import Link from "next/link";
import ProUpgradeCard from "@/components/ProUpgradeCard";

interface Dog {
    id: string;
    call_name: string;
    registered_name: string;
    breed: string;
    owner_id: string;
    is_active_stud: boolean;
    is_available_puppy: boolean;
    image_url?: string;
    profiles: {
        kennel_name: string;
        region: string;
        is_aca_member: boolean;
    };
    health_records: {
        is_verified: boolean;
        ofa_hips: string;
    }[];
}

interface Member {
    id: string;
    real_name: string;
    kennel_name: string;
    region: string;
    avatar_url: string;
    is_aca_member: boolean;
    role?: string;
    bio: string;
}

export default function DirectoryPage() {
    const [activeTab, setActiveTab] = useState<'akitas' | 'members'>('akitas');

    const [dogs, setDogs] = useState<Dog[]>([]);
    const [members, setMembers] = useState<Member[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [regionFilter, setRegionFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all"); // all, stud, puppy

    const supabase = createClient();

    useEffect(() => {
        if (activeTab === 'akitas') {
            fetchDogs();
        } else {
            fetchMembers();
        }
    }, [activeTab]);

    async function fetchDogs() {
        setLoading(true);
        let query = supabase
            .from("dogs")
            .select(`
                *,
                profiles (
                    kennel_name,
                    region,
                    is_aca_member
                ),
                health_records (
                    is_verified,
                    ofa_hips
                )
            `);

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching dogs:", error);
        } else {
            setDogs(data as any || []);
        }
        setLoading(false);
    }

    async function fetchMembers() {
        setLoading(true);
        let query = supabase
            .from("profiles")
            .select("id, real_name, kennel_name, region, avatar_url, is_aca_member, bio");

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching members:", error);
        } else {
            setMembers(data as any || []);
        }
        setLoading(false);
    }

    const filteredDogs = dogs.filter(dog => {
        // Search Term
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            dog.call_name.toLowerCase().includes(searchLower) ||
            dog.registered_name.toLowerCase().includes(searchLower) ||
            dog.profiles?.kennel_name?.toLowerCase().includes(searchLower);

        // Region Filter
        const matchesRegion = regionFilter === "all" || dog.profiles?.region === regionFilter;

        // Type Filter
        const matchesType =
            typeFilter === "all" ||
            (typeFilter === "stud" && dog.is_active_stud) ||
            (typeFilter === "puppy" && dog.is_available_puppy);

        return matchesSearch && matchesRegion && matchesType;
    });

    const filteredMembers = members.filter(member => {
        // Search Term
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (member.real_name?.toLowerCase() || "").includes(searchLower) ||
            (member.kennel_name?.toLowerCase() || "").includes(searchLower);

        // Region Filter
        const matchesRegion = regionFilter === "all" || member.region === regionFilter;

        return matchesSearch && matchesRegion;
    });

    const [userProfile, setUserProfile] = useState<Member | null>(null);
    const [checkingAccess, setCheckingAccess] = useState(true);

    // Get unique regions for filter based on active tab
    const regions = activeTab === 'akitas'
        ? Array.from(new Set(dogs.map(d => d.profiles?.region).filter(Boolean)))
        : Array.from(new Set(members.map(m => m.region).filter(Boolean)));

    useEffect(() => {
        checkAccess();
    }, []);

    async function checkAccess() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setUserProfile(data);
        }
        setCheckingAccess(false);
    }

    if (checkingAccess) return <div className="p-8 text-center">Checking access...</div>;

    if (!userProfile?.is_aca_member && userProfile?.role !== 'admin') {
        return <ProUpgradeCard />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Directory</h1>
                        <p className="text-gray-500 dark:text-gray-400">Find preservationist Akita breeders, owners, and dogs.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={activeTab === 'akitas' ? fetchDogs : fetchMembers}>
                            Refresh
                        </Button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('akitas')}
                        className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'akitas'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <DogIcon size={20} />
                        Akitas
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'members'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Users size={20} />
                        Members
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder={activeTab === 'akitas' ? "Search dogs or kennels..." : "Search members or kennels..."}
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <Select value={regionFilter} onValueChange={setRegionFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Region" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Regions</SelectItem>
                                {regions.map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {activeTab === 'akitas' && (
                        <div className="w-full md:w-48">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="stud">Stud Dogs</SelectItem>
                                    <SelectItem value="puppy">Puppies</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading directory...</div>
                ) : (
                    <>
                        {activeTab === 'akitas' ? (
                            // Akitas Grid
                            filteredDogs.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed">
                                    No dogs found matching your criteria.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredDogs.map(dog => (
                                        <Link key={dog.id} href={`/dogs/${dog.id}`} className="block group">
                                            <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 overflow-hidden">
                                                <div className="h-40 bg-gray-100 dark:bg-gray-700 relative flex items-center justify-center text-gray-400 overflow-hidden">
                                                    {dog.image_url ? (
                                                        <img src={dog.image_url} alt={dog.call_name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                    ) : (
                                                        <span className="text-3xl">🐕</span>
                                                    )}

                                                    {dog.health_records?.[0]?.is_verified && (
                                                        <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-md" title="Verified Health">
                                                            <ShieldCheck size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                                <CardHeader className="p-3 pb-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-base group-hover:text-teal-600 transition-colors line-clamp-1">
                                                                {dog.call_name}
                                                            </CardTitle>
                                                            <p className="text-xs text-gray-500 line-clamp-1">{dog.registered_name}</p>
                                                        </div>
                                                        {dog.is_active_stud && <Badge variant="secondary" className="text-[10px] px-1 h-5">Stud</Badge>}
                                                        {dog.is_available_puppy && <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-[10px] px-1 h-5">Puppy</Badge>}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-3">
                                                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                                                        <div className="flex justify-between">
                                                            <span>Kennel:</span>
                                                            <span className="font-medium truncate ml-2">{dog.profiles?.kennel_name || "Unknown"}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Region:</span>
                                                            <span className="font-medium truncate ml-2">{dog.profiles?.region || "N/A"}</span>
                                                        </div>
                                                        {dog.health_records?.[0]?.ofa_hips && (
                                                            <div className="flex justify-between">
                                                                <span>Hips:</span>
                                                                <span className="font-medium">{dog.health_records[0].ofa_hips}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )
                        ) : (
                            // Members Grid
                            filteredMembers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed">
                                    No members found matching your criteria.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredMembers.map(member => (
                                        <Link key={member.id} href={`/profile/${member.id}`} className="block group">
                                            <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 overflow-hidden">
                                                <div className="h-24 bg-teal-50 dark:bg-teal-900/20 relative">
                                                    {/* Cover photo placeholder or actual if available */}
                                                </div>
                                                <div className="px-4 -mt-8 relative">
                                                    <div className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 overflow-hidden">
                                                        {member.avatar_url ? (
                                                            <img src={member.avatar_url} alt={member.kennel_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                                                                {member.real_name?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {member.is_aca_member && (
                                                        <div className="absolute bottom-0 right-4 bg-blue-600 text-white p-0.5 rounded-full shadow-md border-2 border-white dark:border-gray-800" title="ACA Member">
                                                            <ShieldCheck size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                                <CardHeader className="p-3 pt-2 pb-1">
                                                    <CardTitle className="text-base group-hover:text-teal-600 transition-colors line-clamp-1">
                                                        {member.kennel_name || member.real_name}
                                                    </CardTitle>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{member.real_name}</p>
                                                </CardHeader>
                                                <CardContent className="p-3 pt-1">
                                                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <MapPin size={12} />
                                                            <span className="truncate">{member.region || "No region set"}</span>
                                                        </div>
                                                        <p className="line-clamp-2 text-gray-500 text-[10px]">
                                                            {member.bio || "No bio available."}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
