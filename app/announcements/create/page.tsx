"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateAnnouncementPage() {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [type, setType] = useState<'alert' | 'info' | 'notification'>("notification");
    const [eventDate, setEventDate] = useState("");
    const [location, setLocation] = useState("");
    const [isEvent, setIsEvent] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check permissions
        async function checkPermission() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, subscription_tier, is_aca_member')
                .eq('id', user.id)
                .single();

            const isAuthorized = profile && (
                profile.role === 'admin' ||
                profile.subscription_tier === 'pro' ||
                profile.is_aca_member
            );

            if (!isAuthorized) {
                alert("You do not have permission to create announcements.");
                router.push("/announcements");
            }
        }
        checkPermission();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('announcements').insert({
            title,
            summary,
            type,
            is_event: isEvent,
            event_date: isEvent && eventDate ? new Date(eventDate).toISOString() : null,
            location: isEvent ? location : null,
            creator_id: user.id,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error("Error creating announcement:", error);
            alert("Failed to create announcement: " + error.message);
        } else {
            router.push("/announcements");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <Link href="/announcements" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft size={16} className="mr-2" /> Back to Announcements
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Create New Announcement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="Announcement Title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={type} onValueChange={(val: any) => setType(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="notification">Notification (Green)</SelectItem>
                                        <SelectItem value="info">Info (Blue)</SelectItem>
                                        <SelectItem value="alert">Alert (Red)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="summary">Summary</Label>
                                <Textarea
                                    id="summary"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    required
                                    placeholder="Enter the details..."
                                    className="h-32"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isEvent"
                                    checked={isEvent}
                                    onChange={(e) => setIsEvent(e.target.checked)}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <Label htmlFor="isEvent">This is an event (add to calendar)</Label>
                            </div>

                            {isEvent && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="eventDate">Event Date</Label>
                                        <Input
                                            id="eventDate"
                                            type="date"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            required={isEvent}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="e.g. Tokyo, Japan"
                                        />
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
                                {loading ? "Creating..." : "Post Announcement"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
