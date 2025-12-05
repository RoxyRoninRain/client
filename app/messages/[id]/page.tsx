"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ConversationPage() {
    const { id } = useParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login?next=/messages/" + id);
                return;
            }
            setUserId(user.id);
            setLoading(false);
        }
        checkUser();
    }, [id, router]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (!userId) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-6xl mx-auto p-2 sm:p-6 h-[calc(100vh-64px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                    {/* Sidebar: Hidden on mobile when viewing chat */}
                    <div className="hidden md:flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-teal-600" /> Messages
                            </h1>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <ConversationList currentUserId={userId} />
                        </div>
                    </div>

                    {/* Main Area: Chat Window */}
                    <div className="col-span-1 md:col-span-2 flex flex-col h-full">
                        <div className="md:hidden mb-2">
                            <Link href="/messages">
                                <Button variant="ghost" size="sm" className="-ml-2 text-gray-500">
                                    <ArrowLeft size={16} className="mr-1" /> Back to Messages
                                </Button>
                            </Link>
                        </div>
                        <ChatWindow conversationId={id as string} currentUserId={userId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
