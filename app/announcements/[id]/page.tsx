"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bell, Calendar, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'alert' | 'info' | 'notification';
    created_at: string;
}

export default function AnnouncementDetailPage() {
    const { id } = useParams();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchAnnouncement() {
            if (!id) return;

            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching announcement:", error);
            } else {
                setAnnouncement(data);
            }
            setLoading(false);
        }

        fetchAnnouncement();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">Announcement Not Found</h1>
                <Link href="/">
                    <Button variant="outline">Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-3xl mx-auto space-y-6">
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>

                <Card className="border-t-4 border-t-teal-600">
                    <CardHeader className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${announcement.type === 'alert' ? 'bg-red-100 text-red-600' :
                                    announcement.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                        'bg-teal-100 text-teal-600'
                                }`}>
                                {announcement.type === 'alert' ? <AlertTriangle size={24} /> :
                                    announcement.type === 'info' ? <Info size={24} /> :
                                        <Bell size={24} />}
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold">{announcement.title}</CardTitle>
                                <div className="flex items-center text-sm text-gray-500 gap-2">
                                    <Calendar size={14} />
                                    {format(new Date(announcement.created_at), "MMMM d, yyyy 'at' h:mm a")}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {announcement.content}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
