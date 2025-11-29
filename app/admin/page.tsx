"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, User, Search, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Profile {
    id: string;
    email: string;
    real_name: string;
    kennel_name: string;
    role: string;
    status: string;
    created_at: string;
    subscription_tier: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        checkAdmin();
    }, []);

    async function checkAdmin() {
        const { data: { user } } = await supabase.auth.getUser();

        console.log("CheckAdmin User:", user);

        if (!user) {
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log("User:", user);
        console.log("Profile:", profile);

        // Set these for debug display even if we return early
        setCurrentUser(user);
        setCurrentProfile(profile);

        if (profile?.role !== 'admin') {
            setLoading(false);
            return; // Will show "Access Denied" below
        }

        fetchProfiles();
    }

    async function fetchProfiles() {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching profiles:", error);
        } else {
            setProfiles(data || []);
        }
        setLoading(false);
    }

    const filteredProfiles = profiles.filter(p =>
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.real_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.kennel_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading admin dashboard...</div>;

    if (!currentUser || currentProfile?.role !== 'admin') {
        const isNotLoggedIn = !currentUser;
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-2" />
                        <CardTitle className="text-red-600">
                            {isNotLoggedIn ? "Authentication Required" : "Access Denied"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        {isNotLoggedIn ? (
                            <p className="text-gray-600 dark:text-gray-300">
                                You need to be logged in to view this page.
                            </p>
                        ) : (
                            <>
                                <div className="text-left text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-w-xs mx-auto">
                                    <p><strong>User ID:</strong> {currentUser?.id}</p>
                                    <p><strong>Email:</strong> {currentUser?.email}</p>
                                    <p><strong>Profile Role:</strong> {currentProfile?.role || 'null'}</p>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">
                                    You do not have permission to view this page.
                                </p>
                            </>
                        )}

                        <div className="flex gap-2 justify-center">
                            <Button onClick={() => router.push("/")} variant="outline">
                                Return to Dashboard
                            </Button>
                            {isNotLoggedIn && (
                                <Button onClick={() => router.push("/login")}>
                                    Log In
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="text-red-600" /> Admin Dashboard
                    </h1>
                    <div className="text-sm text-gray-500">
                        Total Users: {profiles.length}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>User Management</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                                    <tr>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Joined</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredProfiles.map(profile => (
                                        <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="p-4">
                                                <div className="font-medium">{profile.real_name || "Unknown"}</div>
                                                <div className="text-gray-500 text-xs">{profile.email}</div>
                                                {profile.kennel_name && (
                                                    <div className="text-teal-600 text-xs">{profile.kennel_name}</div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={profile.role === 'admin' ? "destructive" : "secondary"}>
                                                    {profile.role}
                                                </Badge>
                                                {profile.subscription_tier === 'pro' && (
                                                    <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-200">Pro</Badge>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {profile.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                {new Date(profile.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Ban size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
