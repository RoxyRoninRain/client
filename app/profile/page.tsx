"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Dog, Baby, Mail, Phone, Globe, MapPin, Edit2, Save, X, Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InviteGenerator } from "@/components/InviteGenerator";
import ImageUpload from "@/components/ImageUpload";

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
}

interface Dog {
    id: string;
    call_name: string;
    registered_name: string;
    registration_number: string;
    image_url?: string;
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

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [litters, setLitters] = useState<Litter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState<Partial<Profile>>({});

    // Create Profile State
    const [createError, setCreateError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileError) {
                if (profileError.code !== 'PGRST116') {
                    console.error("Error fetching profile:", JSON.stringify(profileError, null, 2));
                }
            } else {
                console.log("Profile data found:", profileData);
            }

            if (profileData) {
                setProfile(profileData);
                setFormData(profileData);
            }

            // Fetch Dogs
            const { data: dogsData } = await supabase
                .from("dogs")
                .select("id, call_name, registered_name, registration_number, image_url")
                .eq("owner_id", user.id);

            // Fetch Litters
            const { data: littersData } = await supabase
                .from("litters")
                .select("id, whelp_date, litter_name, puppy_count, sire_name, dam_name")
                .eq("owner_id", user.id);

            if (dogsData) setDogs(dogsData);
            if (littersData) setLitters(littersData);

            setLoading(false);
        }

        loadProfile();
    }, [router]);

    async function handleSave() {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    real_name: formData.real_name,
                    kennel_name: formData.kennel_name,
                    region: formData.region,
                    bio: formData.bio,
                    contact_email: formData.contact_email,
                    contact_phone: formData.contact_phone,
                    website: formData.website,
                    preferred_contact_method: formData.preferred_contact_method,
                    cover_photo_url: formData.cover_photo_url,
                    avatar_url: formData.avatar_url
                })
                .eq("id", profile?.id);

            if (error) throw error;

            setProfile({ ...profile, ...formData } as Profile);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    async function createProfile() {
        setCreateError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            real_name: 'New User',
            kennel_name: 'My Kennel',
            role: 'user'
        });

        if (error) {
            console.error("Error creating profile:", error);
            setCreateError(error.message + " (" + error.code + ")");
        } else {
            window.location.reload();
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Loading profile...</div>;
    }

    if (!profile) {
        return (
            <div className="p-8 text-center">
                <p className="mb-4">Profile not found. This can happen if your account was created before the profile system was updated.</p>
                {currentUserId && <p className="text-xs text-gray-400 mb-4">User ID: {currentUserId}</p>}
                {createError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{createError}</div>}
                <div className="flex gap-4 justify-center">
                    <Link href="/login"><Button variant="outline">Go to Login</Button></Link>
                    <Button onClick={createProfile}>Create Profile</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Cover Photo */}
            <div className="h-48 md:h-64 bg-gray-300 dark:bg-gray-800 relative">
                {profile.cover_photo_url ? (
                    <img src={profile.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera size={48} />
                    </div>
                )}
                {isEditing && (
                    <div className="absolute top-4 right-4 z-20">
                        <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm">
                            <p className="text-xs font-medium text-gray-500 mb-1">Change Cover</p>
                            <ImageUpload
                                value={formData.cover_photo_url || ''}
                                onChange={(url: string) => setFormData({ ...formData, cover_photo_url: url })}
                                aspectRatio="wide"
                                className="w-64"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 overflow-hidden flex-shrink-0 relative group">
                            {isEditing ? (
                                <ImageUpload
                                    value={formData.avatar_url || ''}
                                    onChange={(url: string) => setFormData({ ...formData, avatar_url: url })}
                                    className="w-full h-full rounded-full"
                                    placeholder={<Camera className="text-gray-400" />}
                                />
                            ) : (
                                <>
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                            {profile.real_name?.[0]}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Profile Info / Edit Form */}
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start">
                                {isEditing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        <div className="space-y-2">
                                            <Label>Real Name</Label>
                                            <Input value={formData.real_name || ''} onChange={e => setFormData({ ...formData, real_name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kennel Name</Label>
                                            <Input value={formData.kennel_name || ''} onChange={e => setFormData({ ...formData, kennel_name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Region</Label>
                                            <Input value={formData.region || ''} onChange={e => setFormData({ ...formData, region: e.target.value })} />
                                        </div>
                                        {/* Avatar URL Input Removed - handled by ImageUpload overlay */}
                                        <div className="col-span-full space-y-2">
                                            <Label>Bio</Label>
                                            <Textarea value={formData.bio || ''} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                                        </div>

                                        <div className="col-span-full border-t pt-4 mt-2">
                                            <h3 className="font-semibold mb-3">Contact Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Email</Label>
                                                    <Input value={formData.contact_email || ''} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Phone</Label>
                                                    <Input value={formData.contact_phone || ''} onChange={e => setFormData({ ...formData, contact_phone: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Website</Label>
                                                    <Input value={formData.website || ''} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Preferred Contact</Label>
                                                    <Select
                                                        value={formData.preferred_contact_method}
                                                        onValueChange={(val: any) => setFormData({ ...formData, preferred_contact_method: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="email">Email</SelectItem>
                                                            <SelectItem value="phone">Phone</SelectItem>
                                                            <SelectItem value="website">Website</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.kennel_name || profile.real_name}</h1>
                                        <p className="text-gray-500 font-medium">{profile.real_name}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <MapPin size={14} /> {profile.region || "No region set"}
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
                                )}

                                <div className="flex flex-col gap-2">
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                                                <X size={16} className="mr-2" /> Cancel
                                            </Button>
                                            <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
                                                {saving ? "Saving..." : <><Save size={16} className="mr-2" /> Save Changes</>}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                                            <Edit2 size={16} className="mr-2" /> Edit Profile
                                        </Button>
                                    )}
                                    <InviteGenerator userId={profile.id} />

                                    {isEditing && (
                                        <div className="pt-4 border-t mt-4">
                                            <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete your account? This action cannot be undone and will delete all your data.")) {
                                                        // Call delete API
                                                        fetch('/api/auth/delete-account', { method: 'DELETE' })
                                                            .then(async (res) => {
                                                                if (res.ok) {
                                                                    await supabase.auth.signOut();
                                                                    router.push('/');
                                                                } else {
                                                                    alert("Failed to delete account. Please try again.");
                                                                }
                                                            })
                                                            .catch(err => {
                                                                console.error("Error deleting account:", err);
                                                                alert("An error occurred.");
                                                            });
                                                    }
                                                }}
                                            >
                                                Delete Account
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Dogs */}
                    <div className={`${litters.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Dog className="text-teal-600" /> My Dogs
                            </h2>
                            <Link href="/kennel/add-dog">
                                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                                    <Plus size={16} className="mr-2" /> Add Dog
                                </Button>
                            </Link>
                        </div>

                        {dogs.length === 0 ? (
                            <Card className="bg-gray-50 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Dog size={48} className="mb-4 opacity-20" />
                                    <p>No dogs added yet.</p>
                                    <Link href="/kennel/add-dog" className="text-teal-600 hover:underline mt-2">Add your first dog</Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {dogs.map(dog => (
                                    <Link key={dog.id} href={`/dogs/${dog.id}`}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden h-full flex flex-col">
                                            {dog.image_url ? (
                                                <div className="h-40 w-full relative">
                                                    <img src={dog.image_url} alt={dog.call_name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-40 w-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                    <Dog size={32} />
                                                </div>
                                            )}
                                            <CardHeader className="p-4 pb-0">
                                                <CardTitle className="text-base">{dog.call_name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-2 flex-grow">
                                                <p className="text-xs text-gray-500 line-clamp-1">{dog.registered_name}</p>
                                                <p className="text-xs text-gray-400 mt-1">{dog.registration_number}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Litters (Only if active) */}
                    {litters.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Baby className="text-purple-600" /> Active Litters
                                </h2>
                                <Link href="/kennel/log-litter">
                                    <Button variant="outline" size="sm">
                                        <Plus size={16} className="mr-2" /> Log Litter
                                    </Button>
                                </Link>
                            </div>
                            <div className="grid gap-4">
                                {litters.map(litter => (
                                    <Card key={litter.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{litter.litter_name}</CardTitle>
                                            <p className="text-sm text-gray-500">Whelped: {new Date(litter.whelp_date).toLocaleDateString()}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between text-sm">
                                                <span>{litter.sire_name} x {litter.dam_name}</span>
                                                <span className="font-medium">{litter.puppy_count} Puppies</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Litters Button if empty (Compact) */}
                    {litters.length === 0 && (
                        <div className="lg:col-span-3 flex justify-end">
                            <Link href="/kennel/log-litter">
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-teal-600">
                                    <Baby size={16} className="mr-2" /> Log a Litter
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
