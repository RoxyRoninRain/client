import { useEffect, useState } from "react";
import { MessageSquare, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Topic {
    id: string;
    title: string;
    created_at: string;
    profiles: {
        real_name: string;
        kennel_name: string;
    };
    // forum_posts: { count: number }[]; // If we can fetch count
}

interface Member {
    id: string;
    real_name: string;
    kennel_name: string;
    region: string;
    created_at: string;
}

export default function CommunityPulse() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [newMembers, setNewMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            // Fetch Recent Topics
            const { data: topicsData } = await supabase
                .from('forum_topics')
                .select(`
                    id,
                    title,
                    created_at,
                    profiles (
                        real_name,
                        kennel_name
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(3);

            if (topicsData) setTopics(topicsData as any);

            // Fetch New Members
            const { data: membersData } = await supabase
                .from('profiles')
                .select('id, real_name, kennel_name, region, created_at')
                .order('created_at', { ascending: false })
                .limit(3);

            if (membersData) setNewMembers(membersData as any);

            setLoading(false);
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Community Pulse
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Recent Discussions */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Discussions</h3>
                        <Link href="/forums" className="text-xs text-teal-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3 flex-1">
                        {topics.length === 0 ? (
                            <p className="text-xs text-gray-400">No recent discussions.</p>
                        ) : (
                            topics.map((topic) => (
                                <Link href={`/forums/${topic.id}`} key={topic.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                    <MessageSquare size={16} className="mt-1 text-teal-500" />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{topic.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            by {topic.profiles?.real_name || topic.profiles?.kennel_name || "Unknown"} • {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* New Users */}
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">New Members</h3>
                    <div className="space-y-3 flex-1">
                        {newMembers.length === 0 ? (
                            <p className="text-xs text-gray-400">No new members.</p>
                        ) : (
                            newMembers.map((user) => (
                                <Link href={`/profile/${user.id}`} key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                                        {(user.real_name || user.kennel_name || "?").substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.real_name || user.kennel_name}</h4>
                                        <p className="text-xs text-gray-500">{user.region || "Unknown Location"}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
