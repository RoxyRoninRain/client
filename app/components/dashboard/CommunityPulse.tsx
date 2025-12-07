import { useEffect, useState } from "react";
import { MessageSquare, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Topic {
    id: string;
    title: string;
    created_at: string;
    profiles: {
        id: string;
        real_name: string;
        kennel_name: string;
    };
    forum_posts?: any[];
    lastActiveTime?: number;
    lastActiveUser?: any;
    action?: string;
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
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            // Fetch Recent Topics with their latest posts to determine activity
            const { data: topicsData } = await supabase
                .from('forum_topics')
                .select(`
                    id,
                    title,
                    created_at,
                    profiles (
                        id,
                        real_name,
                        kennel_name
                    ),
                    forum_posts (
                        created_at,
                        author_id,
                        profiles (
                            real_name,
                            kennel_name
                        )
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (topicsData) {
                const sortedTopics = (topicsData as any[])
                    .map(topic => {
                        const posts = topic.forum_posts || [];
                        let lastActiveTime = new Date(topic.created_at).getTime();
                        let lastActiveUser = topic.profiles;
                        let action = "Created";

                        if (posts.length > 0) {
                            // Find latest post
                            const latestPost = posts.reduce((latest: any, current: any) => {
                                return new Date(current.created_at).getTime() > new Date(latest.created_at).getTime()
                                    ? current
                                    : latest;
                            }, posts[0]);

                            if (new Date(latestPost.created_at).getTime() > lastActiveTime) {
                                lastActiveTime = new Date(latestPost.created_at).getTime();
                                lastActiveUser = latestPost.profiles;
                                action = "Commented";
                            }
                        }

                        return { ...topic, lastActiveTime, lastActiveUser, action };
                    })
                    .sort((a, b) => b.lastActiveTime - a.lastActiveTime)
                    .slice(0, 5);

                setTopics(sortedTopics);
            }

            // Fetch New Members
            const { data: membersData } = await supabase
                .from('profiles')
                .select('id, real_name, kennel_name, region, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

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

            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Recent Discussions */}
                <div className="flex flex-col h-1/2 md:h-full min-h-0">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Discussions</h3>
                        <Link href="/forums" className="text-xs text-teal-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {topics.length === 0 ? (
                            <p className="text-xs text-gray-400">No recent discussions.</p>
                        ) : (
                            topics.map((topic) => (
                                <div
                                    key={topic.id}
                                    onClick={() => router.push(`/forums/${topic.id}`)}
                                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <MessageSquare size={16} className="mt-1 text-teal-500 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{topic.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {topic.action} by <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {topic.lastActiveUser?.real_name || topic.lastActiveUser?.kennel_name || "Unknown"}
                                            </span> • {topic.lastActiveTime && formatDistanceToNow(new Date(topic.lastActiveTime), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* New Members */}
                <div className="flex flex-col h-1/2 md:h-full min-h-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-6 md:pt-0 md:pl-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">New Members</h3>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {newMembers.length === 0 ? (
                            <p className="text-xs text-gray-400">No new members.</p>
                        ) : (
                            newMembers.map((user) => (
                                <Link href={`/profile/${user.id}`} key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        {(user.real_name || user.kennel_name || "?").substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.real_name || user.kennel_name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{user.region || "Unknown Location"}</p>
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
