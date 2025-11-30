"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, AlertTriangle, Info, Plus, Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Announcement {
    id: string;
    title: string;
    summary: string;
    type: 'alert' | 'info' | 'notification';
    created_at: string;
    event_date?: string;
    creator_id?: string;
    profiles?: {
        real_name: string;
        kennel_name: string;
    };
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            // Get User Role
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, subscription_tier, is_aca_member')
                    .eq('id', user.id)
                    .single();
                if (profile) {
                    // Check if admin, pro, or aca member
                    if (profile.role === 'admin' || profile.subscription_tier === 'pro' || profile.is_aca_member) {
                        setUserRole('authorized');
                    }
                }
            }

            // Get Announcements
            const { data, error } = await supabase
                .from('announcements')
                .select(`
                    *,
                    profiles:creator_id (
                        real_name,
                        kennel_name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching announcements:", error);
            } else {
                setAnnouncements(data || []);
            }
            setLoading(false);
        }

        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) {
            alert("Error deleting announcement: " + error.message);
        } else {
            setAnnouncements(announcements.filter(a => a.id !== id));
        }
    };

    const canCreate = userRole === 'authorized';

    const filteredAnnouncements = announcements.filter(item => {
        if (item.is_event && item.event_date) {
            const eventDate = new Date(item.event_date);
            const oneDayAfter = new Date(eventDate);
            oneDayAfter.setDate(oneDayAfter.getDate() + 1);
            return new Date() < oneDayAfter;
        }
        return true;
    });

    if (loading) {
        return <div className="p-8 text-center">Loading announcements...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Announcements</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Latest updates and events from the community.</p>
                    </div>
                    {canCreate && (
                        <Link href="/announcements/create">
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                                <Plus size={16} className="mr-2" /> Create
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="space-y-4">
                    {filteredAnnouncements.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No active announcements.</p>
                        </div>
                    ) : (
                        filteredAnnouncements.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'alert' ? 'bg-red-100 text-red-600' :
                                            item.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                                'bg-teal-100 text-teal-600'
                                        }`}>
                                        {item.type === 'alert' ? <AlertTriangle size={20} /> :
                                            item.type === 'info' ? <Info size={20} /> :
                                                <Bell size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h2>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                </span>
                                                {canCreate && (
                                                    <div className="flex gap-1 ml-2">
                                                        <Link href={`/announcements/edit/${item.id}`} className="text-gray-400 hover:text-blue-600" title="Edit">
                                                            <Edit size={14} />
                                                        </Link>
                                                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                                            {item.summary}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                                            {item.event_date && (
                                                <div className="flex items-center gap-1 text-teal-600 font-medium">
                                                    <Calendar size={14} />
                                                    Event: {new Date(item.event_date).toLocaleDateString()}
                                                </div>
                                            )}

                                            {item.profiles && (
                                                <div className="flex items-center gap-1">
                                                    <span>Posted by:</span>
                                                    <Link
                                                        href={item.creator_id ? `/profile/${item.creator_id}` : '#'}
                                                        className="font-medium text-gray-900 dark:text-white hover:text-teal-600 hover:underline"
                                                    >
                                                        {item.profiles.real_name || item.profiles.kennel_name}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
