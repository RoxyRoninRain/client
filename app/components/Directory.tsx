"use client";

import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Profile {
    id: string;
    kennel_name: string | null;
    real_name: string | null;
    region: string | null;
    is_aca_member: boolean;
}

export default function Directory() {
    const [searchQuery, setSearchQuery] = useState("");
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchProfiles() {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, kennel_name, real_name, region, is_aca_member")
                .eq("status", "active");

            if (error) {
                console.error("Error fetching profiles:", error);
            } else {
                setProfiles(data || []);
            }
            setLoading(false);
        }

        fetchProfiles();
    }, []);

    const filteredBreeders = profiles.filter(profile => {
        const name = profile.kennel_name || profile.real_name || "Unknown Breeder";
        const location = profile.region || "";
        const query = searchQuery.toLowerCase();

        return name.toLowerCase().includes(query) || location.toLowerCase().includes(query);
    });

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Breeder Directory</h2>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or region..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Distance Filter Disabled: No lat/lng in database yet */}
                </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading directory...</div>
                ) : filteredBreeders.map(breeder => (
                    <div key={breeder.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {breeder.kennel_name || breeder.real_name || "Unknown Breeder"}
                                    {breeder.is_aca_member && (
                                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">ACA Member</span>
                                    )}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <MapPin size={16} />
                                    {breeder.region || "No location set"}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && filteredBreeders.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No breeders found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
}
