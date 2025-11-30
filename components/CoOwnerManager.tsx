"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, UserPlus, Search, ShieldCheck } from "lucide-react";

interface Owner {
    user_id: string;
    is_primary: boolean;
    profiles: {
        real_name: string;
        kennel_name: string;
        email: string;
        avatar_url: string;
    };
}

interface CoOwnerManagerProps {
    dogId: string;
    currentUserId: string;
}

export default function CoOwnerManager({ dogId, currentUserId }: CoOwnerManagerProps) {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResult, setSearchResult] = useState<any>(null);
    const [searching, setSearching] = useState(false);
    const [adding, setAdding] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchOwners();
    }, [dogId]);

    async function fetchOwners() {
        setLoading(true);
        const { data, error } = await supabase
            .from("dog_owners")
            .select(`
                user_id,
                is_primary,
                profiles:user_id (
                    real_name,
                    kennel_name,
                    email,
                    avatar_url
                )
            `)
            .eq("dog_id", dogId);

        if (error) {
            console.error("Error fetching owners:", error);
        } else {
            setOwners(data as any || []);
        }
        setLoading(false);
    }

    async function handleSearch() {
        if (!searchEmail) return;
        setSearching(true);
        setSearchResult(null);

        const { data, error } = await supabase
            .from("profiles")
            .select("id, real_name, kennel_name, email, avatar_url")
            .eq("email", searchEmail)
            .single();

        if (error) {
            console.error("Error searching user:", error);
            alert("User not found.");
        } else {
            setSearchResult(data);
        }
        setSearching(false);
    }

    async function handleAddOwner() {
        if (!searchResult) return;
        setAdding(true);

        const { error } = await supabase
            .from("dog_owners")
            .insert({
                dog_id: dogId,
                user_id: searchResult.id,
                is_primary: false
            });

        if (error) {
            console.error("Error adding owner:", error);
            alert("Failed to add owner: " + error.message);
        } else {
            setSearchEmail("");
            setSearchResult(null);
            fetchOwners();
        }
        setAdding(false);
    }

    async function handleRemoveOwner(userId: string) {
        if (!confirm("Are you sure you want to remove this co-owner?")) return;

        const { error } = await supabase
            .from("dog_owners")
            .delete()
            .eq("dog_id", dogId)
            .eq("user_id", userId);

        if (error) {
            console.error("Error removing owner:", error);
            alert("Failed to remove owner.");
        } else {
            fetchOwners();
        }
    }

    const isPrimaryOwner = owners.find(o => o.user_id === currentUserId)?.is_primary;

    if (loading) return <div>Loading owners...</div>;

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UsersIcon /> Manage Co-Owners
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Owners List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500">Current Owners</h3>
                    {owners.map(owner => (
                        <div key={owner.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    {owner.profiles.avatar_url ? (
                                        <img src={owner.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                            {owner.profiles.real_name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {owner.profiles.real_name}
                                        {owner.is_primary && <span className="ml-2 text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">Primary</span>}
                                    </p>
                                    <p className="text-xs text-gray-500">{owner.profiles.kennel_name}</p>
                                </div>
                            </div>
                            {/* Only allow removing if current user is primary, or removing self? For now, primary removes others. */}
                            {isPrimaryOwner && !owner.is_primary && (
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveOwner(owner.user_id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 size={16} />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add New Owner */}
                {isPrimaryOwner && (
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-500">Add Co-Owner</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search by email..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                            />
                            <Button onClick={handleSearch} disabled={searching} variant="secondary">
                                <Search size={16} />
                            </Button>
                        </div>

                        {searchResult && (
                            <div className="flex items-center justify-between p-3 border border-teal-200 bg-teal-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 font-bold">
                                        {searchResult.real_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{searchResult.real_name}</p>
                                        <p className="text-xs text-gray-500">{searchResult.kennel_name}</p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={handleAddOwner} disabled={adding} className="bg-teal-600 hover:bg-teal-700 text-white">
                                    <UserPlus size={16} className="mr-2" /> Add
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function UsersIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-users"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
