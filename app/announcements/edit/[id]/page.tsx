"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        content: "", // Note: content column might be missing in schema, checking... schema has content.
        type: "notification",
        is_event: false,
        event_date: "",
        location: ""
    });

    useEffect(() => {
        async function fetchAnnouncement() {
            // Check auth
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // Fetch announcement
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                alert("Announcement not found or error fetching.");
                router.push("/announcements");
                return;
            }

            // Check permission (creator or admin)
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data.creator_id !== user.id && profile?.role !== 'admin') {
                alert("You do not have permission to edit this announcement.");
                router.push("/announcements");
                return;
            }

            setFormData({
                title: data.title,
                summary: data.summary,
                content: data.content || "",
                type: data.type,
                is_event: data.is_event || false,
                event_date: data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : "",
                location: data.location || ""
            });
            setLoading(false);
        }

        fetchAnnouncement();
    }, [id, router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const updates: any = {
            title: formData.title,
            summary: formData.summary,
            content: formData.content,
            type: formData.type,
            is_event: formData.is_event,
        };

        if (formData.is_event) {
            updates.event_date = formData.event_date ? new Date(formData.event_date).toISOString() : null;
            updates.location = formData.location;
        } else {
            updates.event_date = null;
            updates.location = null;
        }

        const { error } = await supabase
            .from('announcements')
            .update(updates)
            .eq('id', id);

        if (error) {
            alert("Error updating announcement: " + error.message);
        } else {
            router.push("/announcements");
            router.refresh();
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-2xl mx-auto space-y-6">
                <Link href="/announcements" className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to Announcements
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-teal-700">Edit Announcement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="notification">Notification</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                        <SelectItem value="alert">Alert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="summary">Summary</Label>
                                <Textarea
                                    id="summary"
                                    required
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    rows={3}
                                />
                                <p className="text-xs text-gray-500">Brief description shown in lists.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content (Optional)</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={5}
                                />
                                <p className="text-xs text-gray-500">Full details.</p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_event"
                                    checked={formData.is_event}
                                    onChange={(e) => setFormData({ ...formData, is_event: e.target.checked })}
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                />
                                <Label htmlFor="is_event">This is an event</Label>
                            </div>

                            {formData.is_event && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-teal-100">
                                    <div className="space-y-2">
                                        <Label htmlFor="event_date">Event Date</Label>
                                        <Input
                                            id="event_date"
                                            type="date"
                                            required={formData.is_event}
                                            value={formData.event_date}
                                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. Online, New York, etc."
                                        />
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
