"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Plus, User, Pin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Topic {
    id: string;
    title: string;
    author_id: string;
    created_at: string;
    is_pinned: boolean;
    is_locked: boolean;
    author?: {
        kennel_name: string;
        real_name: string;
    };
}

interface Category {
    id: string;
    title: string;
    description: string;
}

export default function CategoryPage() {
    const { id } = useParams();
    const [category, setCategory] = useState<Category | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    async function loadData() {
        setLoading(true);

        // Fetch Category Info
        const { data: catData } = await supabase
            .from('forum_categories')
            .select('*')
            .eq('id', id)
            .single();

        if (catData) {
            setCategory(catData);
        }

        // Fetch Topics
        const { data: topicData, error } = await supabase
            .from('forum_topics')
            .select(`
                *,
                author:profiles(kennel_name, real_name)
            `)
            .eq('category_id', id)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching topics:", error);
        } else {
            setTopics(topicData || []);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-5xl mx-auto space-y-6">
                <Link href="/forums" className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to Categories
                </Link>

                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {category?.title || "Loading..."}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {category?.description}
                        </p>
                    </div>
                    <Link href={`/forums/new?category=${id}`}>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                            <Plus size={16} /> New Topic
                        </Button>
                    </Link>
                </header>

                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading topics...</p>
                    ) : topics.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">No topics in this category yet.</p>
                                <p className="text-sm">Be the first to start a discussion!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        topics.map(topic => (
                            <Link key={topic.id} href={`/forums/${topic.id}`}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                {topic.is_pinned && <Pin size={16} className="text-teal-600 fill-teal-600" />}
                                                {topic.is_locked && <Lock size={16} className="text-red-500" />}
                                                <CardTitle className="text-lg font-semibold text-teal-700 dark:text-teal-400">
                                                    {topic.title}
                                                </CardTitle>
                                            </div>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {new Date(topic.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <User size={14} />
                                            <span>
                                                Posted by <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    {topic.author?.real_name || topic.author?.kennel_name || "Unknown"}
                                                </span>
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
