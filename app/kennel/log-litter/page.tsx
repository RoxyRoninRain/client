"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/ImageUpload";

interface Dog {
    id: string;
    call_name: string;
}

export default function LogLitterPage() {
    const [myDogs, setMyDogs] = useState<Dog[]>([]);
    const [formData, setFormData] = useState({
        sire_id: "",
        dam_id: "",
        whelp_date: "",
        num_puppies: "0",
        image_url: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function fetchDogs() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("dogs")
                    .select("id, call_name")
                    .eq("owner_id", user.id);
                setMyDogs(data || []);
            }
        }
        fetchDogs();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (key: string, value: string) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to log a litter.");
            setLoading(false);
            return;
        }

        const { error: insertError } = await supabase
            .from("litters")
            .insert({
                owner_id: user.id,
                sire_id: formData.sire_id || null, // Optional if external
                dam_id: formData.dam_id || null,   // Optional if external
                whelp_date: formData.whelp_date,
                image_url: formData.image_url,
                // We might want to store puppy count in a separate table or column, 
                // but for now let's just create the litter record.
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
                    <CardTitle>Log a New Litter</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label>Litter Photo</Label>
                            <ImageUpload
                                value={formData.image_url}
                                onChange={(url: string) => setFormData({ ...formData, image_url: url })}
                                className="w-full max-w-xs"
                                aspectRatio="video"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sire_id">Sire (Father)</Label>
                                <Select onValueChange={(val: string) => handleSelectChange("sire_id", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Sire" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {myDogs.map(dog => (
                                            <SelectItem key={dog.id} value={dog.id}>{dog.call_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dam_id">Dam (Mother)</Label>
                                <Select onValueChange={(val: string) => handleSelectChange("dam_id", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Dam" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {myDogs.map(dog => (
                                            <SelectItem key={dog.id} value={dog.id}>{dog.call_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whelp_date">Whelp Date *</Label>
                            <Input id="whelp_date" type="date" value={formData.whelp_date} onChange={handleChange} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="num_puppies">Number of Puppies</Label>
                            <Input id="num_puppies" type="number" min="1" value={formData.num_puppies} onChange={handleChange} />
                            <p className="text-xs text-gray-500">This is just for your records.</p>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Logging..." : "Log Litter"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
