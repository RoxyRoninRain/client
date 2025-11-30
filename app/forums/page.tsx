"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { HeartPulse, Brain, Trophy, Baby, MessageSquare } from "lucide-react"; export default function ForumsPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setLoading(true);
        const { data, error } = await supabase
            .from('forum_categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error("Error fetching categories:", error);
        } else {
            setCategories(data || []);
        }
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-5xl mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <MessageSquare className="text-teal-600" /> Community Forums
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Join the discussion with other Akita enthusiasts.</p>
                    </div>
                </header>

                <div className="grid gap-4">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading categories...</p>
                    ) : categories.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">No categories found.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        categories.map(category => (
                            <Link key={category.id} href={`/forums/category/${category.id}`}>
                                <Card className="border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                            {getIcon(category.icon)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {category.title}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {category.description}
                                            </p>
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
