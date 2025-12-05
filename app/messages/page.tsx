"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ConversationList from "@/components/messaging/ConversationList";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MessagesPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
            setLoading(false);
        }
        checkUser();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (!userId) {
        return (
            <div className="p-8 text-center">
                <p className="mb-4">You must be logged in to view messages.</p>
                <Link href="/login"><Button>Log In</Button></Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 h-[calc(100vh-64px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                    {/* Sidebar: Conversation List */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-teal-600" /> Messages
                            </h1>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <ConversationList currentUserId={userId} />
                        </div>
                    </div>

                    {/* Main Area: Placeholder for Desktop */}
                    <div className="hidden md:flex col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 items-center justify-center text-gray-400 flex-col gap-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <MessageSquare size={32} />
                        </div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
