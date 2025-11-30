"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, AlertTriangle, Info, Calendar, MapPin, User, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Announcement {
    id: string;
    title: string;
    summary: string;
    type: 'alert' | 'info' | 'notification';
    created_at: string;
    is_event?: boolean;
    event_date?: string;
    location?: string;
    creator_id?: string;
    profiles?: {
        real_name: string;
        kennel_name: string;
    };
}

export default function AnnouncementDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const supabase = createClient();

    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState(true);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);

            // 1. Fetch Announcement
            const { data, error } = await supabase
                .from('announcements')
                .select(`
                    *,
                    profiles:creator_id (
                        real_name,
                        kennel_name
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching announcement:", error);
            } else {
                setAnnouncement(data);
            }

            // 2. Check Permissions
            const { data: { user } } = await supabase.auth.getUser();
            if (user && data) {
                if (user.id === data.creator_id) {
                    setCanEdit(true);
                } else {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();
                    if (profile?.role === 'admin') {
                        setCanEdit(true);
                    }
                }
            }

            setLoading(false);
        }

        if (id) {
            loadData();
        }
    }, [id]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) {
            alert("Error deleting announcement: " + error.message);
        } else {
            router.push("/announcements");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!announcement) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold mb-4">Announcement Not Found</h1>
                <Link href="/announcements">
                    <Button>Back to Announcements</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/announcements" className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 transition-colors mb-6">
                    <ArrowLeft size={16} className="mr-1" /> Back to Announcements
                </Link>

                <Card className="overflow-hidden shadow-lg border-0">
                    <div className={`h-2 w-full ${announcement.type === 'alert' ? 'bg-red-500' :
                            announcement.type === 'info' ? 'bg-blue-500' :
                                'bg-teal-500'
                        }`} />

                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${announcement.type === 'alert' ? 'bg-red-100 text-red-600' :
                                        announcement.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                            'bg-teal-100 text-teal-600'
                                    }`}>
                                    {announcement.type === 'alert' ? <AlertTriangle size={24} /> :
                                        announcement.type === 'info' ? <Info size={24} /> :
                                            <Bell size={24} />}
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {announcement.title}
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Posted {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>

                            {canEdit && (
                                <div className="flex gap-2">
                                    <Link href={`/announcements/edit/${announcement.id}`}>
                                        <Button variant="outline" size="sm">
                                            <Edit size={16} className="mr-2" /> Edit
                                        </Button>
                                    </Link>
                                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                                        <Trash2 size={16} className="mr-2" /> Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Event Details */}
                        {announcement.is_event && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {announcement.event_date && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-teal-600" size={20} />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase">Date</p>
                                            <p className="font-medium">{new Date(announcement.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                )}
                                {announcement.location && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="text-teal-600" size={20} />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
                                            <p className="font-medium">{announcement.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                            {announcement.summary}
                        </div>

                        {/* Author */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User size={16} />
                                <span>Posted by:</span>
                                <Link
                                    href={announcement.creator_id ? `/profile/${announcement.creator_id}` : '#'}
                                    className="font-medium text-gray-900 dark:text-white hover:text-teal-600 hover:underline"
                                >
                                    {announcement.profiles?.real_name || announcement.profiles?.kennel_name || "Unknown"}
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
