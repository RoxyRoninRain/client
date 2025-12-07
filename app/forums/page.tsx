"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { HeartPulse, Brain, Trophy, Baby, MessageSquare, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Category {
    id: string;
    title: string;
    description: string;
    icon: string;
    recentTopics?: Topic[];
}

interface Topic {
    id: string;
    title: string;
    created_at: string;
    author_id: string;
    profiles?: any; // Supabase join can return object or array depending on relation, keeping permissive
}

export default function ForumsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);

        // 1. Fetch Categories
        const { data: cats, error } = await supabase
            .from('forum_categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error("Error fetching categories:", error);
            setLoading(false);
            return;
        }

        const categoriesWithTopics = await Promise.all((cats || []).map(async (cat: Category) => {
            // 2. Fetch Recent Topics for each Category
            const { data: topics } = await supabase
                .from('forum_topics')
                .select(`
                    id,
                    title,
                    created_at,
                    author_id,
                    profiles (
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
                .eq('category_id', cat.id)
                .order('created_at', { ascending: false })
                .limit(3);

            const topicsWithActivity = (topics || []).map((topic: any) => {
                const posts = topic.forum_posts || [];
                let lastActiveTime = new Date(topic.created_at).getTime();
                let lastActiveUser = topic.profiles;
                let action = "Created";

                if (posts.length > 0) {
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
            });

            return {
                ...cat,
                recentTopics: topicsWithActivity
            };
        }));

        setCategories(categoriesWithTopics as Category[]);
        setLoading(false);
    }

    // Helper to get icon component
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'HeartPulse': return <HeartPulse size={24} className="text-red-500" />;
            case 'Brain': return <Brain size={24} className="text-orange-500" />;
            case 'Trophy': return <Trophy size={24} className="text-yellow-500" />;
            case 'Baby': return <Baby size={24} className="text-pink-500" />;
            default: return <MessageSquare size={24} className="text-teal-600" />;
        }
    };

    const getInitials = (topic: any) => {
        const name = topic.profiles?.real_name || topic.profiles?.kennel_name || "?";
        return name.substring(0, 2).toUpperCase();
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-3">
                            <MessageSquare className="text-teal-600" size={32} /> Akita Connect Forums
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Join the discussion with other Akita enthusiasts.</p>
                    </div>
                    <Link href="/forums/new">
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                            <PlusCircle className="mr-2 h-4 w-4" /> New Topic
                        </Button>
                    </Link>
                </header>

                <div className="space-y-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">No categories found.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        categories.map(category => (
                            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {/* Category Header */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            {getIcon(category.icon)}
                                        </div>
                                        <div>
                                            <Link href={`/forums/category/${category.id}`} className="hover:underline">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {category.title}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={`/forums/category/${category.id}`}>
                                        <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20">
                                            View All
                                        </Button>
                                    </Link>
                                </div>

                                {/* Recent Topics List */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {category.recentTopics && category.recentTopics.length > 0 ? (
                                        category.recentTopics.map((topic: any) => (
                                            <div key={topic.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group">
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-8 w-8 mt-1">
                                                        <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                                                            {getInitials(topic)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <Link href={`/forums/${topic.id}`} className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-teal-600 transition-colors block mb-1">
                                                            {topic.title}
                                                        </Link>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>{topic.action} by {topic.lastActiveUser?.real_name || topic.lastActiveUser?.kennel_name || "Unknown"}</span>
                                                            <span>•</span>
                                                            <span>{formatDistanceToNow(new Date(topic.lastActiveTime), { addSuffix: true })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="hidden sm:block">
                                                    <Link href={`/forums/${topic.id}`}>
                                                        <MessageSquare className="text-gray-300 group-hover:text-teal-500 h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm italic">
                                            No topics yet. Be the first to post!
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
