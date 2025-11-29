"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function NewEventPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("info");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("You must be logged in to create an event.");
                setSubmitting(false);
                return;
            }

            // Check if user is Pro or Admin (RLS will also enforce this, but good to check UI side)
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier, role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin' && profile?.subscription_tier !== 'pro') {
                setError("Only Pro users can create events.");
                setSubmitting(false);
                return;
            }

            const { error: insertError } = await supabase
                .from('announcements')
                .insert({
                    title,
                    summary,
                    content,
                    type,
                    event_date: new Date(date).toISOString(),
                    location,
                    is_event: true
                });

            if (insertError) throw insertError;

            router.push("/");

        } catch (err: any) {
            console.error("Error creating event:", err);
            setError(err.message || "Failed to create event.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-2xl mx-auto space-y-6">
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Calendar className="text-teal-600" /> Create New Event
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="title">Event Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Regional Meetup"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date & Time</Label>
                                    <Input
                                        id="date"
                                        type="datetime-local"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="info">Info</SelectItem>
                                            <SelectItem value="alert">Alert</SelectItem>
                                            <SelectItem value="notification">Notification</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <Input
                                        id="location"
                                        placeholder="e.g., Central Park, NY"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="summary">Short Summary</Label>
                                <Input
                                    id="summary"
                                    placeholder="Brief description for the calendar list"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Full Details</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Detailed information about the event..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[150px]"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href="/">
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={submitting || !title || !date}
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    {submitting ? "Creating..." : <><Send size={16} className="mr-2" /> Create Event</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
