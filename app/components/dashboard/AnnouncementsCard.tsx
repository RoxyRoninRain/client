import { useEffect, useState } from "react";
import { Bell, AlertTriangle, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
    id: string;
    title: string;
    summary: string;
    type: 'alert' | 'info' | 'notification';
    created_at: string;
}

export default function AnnouncementsCard() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchAnnouncements() {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error("Error fetching announcements:", JSON.stringify(error, null, 2));
                console.error("Error details:", error.message, error.details, error.hint);
            } else {
                setAnnouncements(data || []);
            }
            setLoading(false);
        }

        fetchAnnouncements();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-teal-600" />
                    Announcements
                </h2>
                <Link href="/announcements" className="text-xs font-medium text-teal-600 hover:text-teal-700 cursor-pointer">View All</Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {announcements.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No new announcements.</p>
                ) : (
                    announcements.map((item) => (
                        <Link href={`/announcements/${item.id}`} key={item.id} className="flex gap-3 items-start group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'alert' ? 'bg-red-100 text-red-600' :
                                item.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                    'bg-teal-100 text-teal-600'
                                }`}>
                                {item.type === 'alert' ? <AlertTriangle size={14} /> :
                                    item.type === 'info' ? <Info size={14} /> :
                                        <Bell size={14} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 transition-colors">{item.title}</h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                                    {item.summary}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
