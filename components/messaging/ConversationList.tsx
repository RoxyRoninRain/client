"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { User } from "lucide-react";

interface Conversation {
    id: string;
    updated_at: string;
    participants: {
        user: {
            id: string;
            real_name: string;
            kennel_name: string;
            avatar_url: string;
        }
    }[];
    last_message?: {
        content: string;
        is_read: boolean;
        sender_id: string;
        created_at: string;
    };
}

export default function ConversationList({ currentUserId }: { currentUserId: string }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function loadConversations() {
            // 1. Fetch conversations user is part of
            const { data: participationData, error } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', currentUserId);

            if (error || !participationData) {
                console.error("Error fetching conversations:", error);
                setLoading(false);
                return;
            }

            const conversationIds = participationData.map(p => p.conversation_id);

            if (conversationIds.length === 0) {
                setLoading(false);
                return;
            }

            // 2. Fetch conversation details, participants, and last message
            // Note: This is a bit complex with Supabase JS, might need multiple queries or a view.
            // For now, we'll do it in a loop or optimized query.

            const { data: convs, error: convsError } = await supabase
                .from('conversations')
                .select(`
                    id, 
                    updated_at,
                    conversation_participants (
                        user:profiles (id, real_name, kennel_name, avatar_url)
                    )
                `)
                .in('id', conversationIds)
                .order('updated_at', { ascending: false });

            if (convsError) {
                console.error("Error fetching conversation details:", convsError);
            } else {
                // Fetch last message for each conversation
                const conversationsWithMessages = await Promise.all(convs.map(async (conv: any) => {
                    const { data: msg } = await supabase
                        .from('messages')
                        .select('content, is_read, sender_id, created_at')
                        .eq('conversation_id', conv.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    return {
                        ...conv,
                        participants: conv.conversation_participants, // Flatten structure if needed
                        last_message: msg
                    };
                }));

                setConversations(conversationsWithMessages);
            }
            setLoading(false);
        }

        loadConversations();

        // Realtime subscription for new messages (to update list order/preview)
        const channel = supabase
            .channel('public:conversations')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                // Ideally, we'd check if the message belongs to one of our conversations
                // For simplicity, we just reload for now or optimistically update.
                loadConversations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading chats...</div>;

    if (conversations.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No messages yet.</p>
                <p className="text-sm">Visit a profile to start a conversation.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {conversations.map(conv => {
                // Find the "other" participant
                const otherParticipant = conv.participants.find((p: any) => p.user.id !== currentUserId)?.user;
                const lastMsg = conv.last_message;
                const isUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_id !== currentUserId;

                if (!otherParticipant) return null; // Should not happen for 1:1 chats

                return (
                    <Link key={conv.id} href={`/messages/${conv.id}`} className="block">
                        <Card className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isUnread ? 'border-l-4 border-l-teal-500' : ''}`}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={otherParticipant.avatar_url} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold truncate">{otherParticipant.real_name || otherParticipant.kennel_name}</h3>
                                        {lastMsg && (
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                {formatDistanceToNow(new Date(lastMsg.created_at), { addSuffix: true })}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                        {lastMsg?.sender_id === currentUserId ? 'You: ' : ''}{lastMsg?.content || 'No messages'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
