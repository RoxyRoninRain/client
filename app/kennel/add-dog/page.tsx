"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function AddDogPage() {
    const [formData, setFormData] = useState({
        registered_name: "",
        call_name: "",
        registration_number: "",
        sire_name: "",
        dam_name: "",
        image_url: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const [checkingAccess, setCheckingAccess] = useState(true);
    const [limitReached, setLimitReached] = useState(false);

    useEffect(() => {
        async function checkLimit() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('is_aca_member').eq('id', user.id).single();

                if (!profile?.is_aca_member) {
                    const { count } = await supabase
                        .from('dogs')
                        .select('*', { count: 'exact', head: true })
                        .eq('owner_id', user.id);

                    if ((count || 0) >= 3) {
                        setLimitReached(true);
                    }
                }
            } else {
                setError("You must be logged in to add a dog.");
            }
            setCheckingAccess(false);
        }
        checkLimit();
    }, []);

    if (checkingAccess) return <div className="p-8 text-center">Checking limits...</div>;

    if (limitReached) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card className="text-center p-8 border-l-4 border-l-yellow-500">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck size={32} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Kennel Limit Reached</h2>
                    <p className="text-gray-500 mb-6">
                        Free accounts are limited to 3 active dogs. Upgrade to Pro (ACA Member) for unlimited dogs and advanced features.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700">Join ACA Today</Button>
                    </div>
                </Card>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to add a dog.");
            setLoading(false);
            return;
        }

        const { error: insertError } = await supabase
            .from("dogs")
            .insert({
                owner_id: user.id,
                registered_name: formData.registered_name,
                call_name: formData.call_name,
                registration_number: formData.registration_number,
                sire_name: formData.sire_name,
                dam_name: formData.dam_name,
                image_url: formData.image_url,
                // Defaults for now
                is_active_stud: false,
                is_available_puppy: false,
                is_retired: false
            });

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
        } else {
            router.push("/kennel");
            router.refresh();
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add a New Dog</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label>Dog Photo</Label>
                            <ImageUpload
                                value={formData.image_url}
                                onChange={(url: string) => setFormData({ ...formData, image_url: url })}
                                className="w-full max-w-xs"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="call_name">Call Name *</Label>
                                <Input id="call_name" value={formData.call_name} onChange={handleChange} required placeholder="e.g. Hachiko" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registration_number">Registration Number</Label>
                                <Input id="registration_number" value={formData.registration_number} onChange={handleChange} placeholder="AKC Number" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="registered_name">Registered Name *</Label>
                            <Input id="registered_name" value={formData.registered_name} onChange={handleChange} required placeholder="e.g. CH Royal's Hachiko" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sire_name">Sire Name</Label>
                                <Input id="sire_name" value={formData.sire_name} onChange={handleChange} placeholder="Father's Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dam_name">Dam Name</Label>
                                <Input id="dam_name" value={formData.dam_name} onChange={handleChange} placeholder="Mother's Name" />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Adding..." : "Add Dog"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
