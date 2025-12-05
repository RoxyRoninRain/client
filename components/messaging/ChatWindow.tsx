"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, Image as ImageIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
}

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
}

export default function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        async function loadMessages() {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Error loading messages:", error);
            } else {
                setMessages(data || []);
            }
            setLoading(false);
            scrollToBottom();
        }

        loadMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
                scrollToBottom();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSending(true);

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: currentUserId,
                content: newMessage
            });

        if (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message");
        } else {
            setNewMessage("");
        }
        setSending(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => {
                        const isMe = msg.sender_id === currentUserId;
                        const showDate = index === 0 ||
                            new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

                        return (
                            <div key={msg.id}>
                                {showDate && (
                                    <div className="text-center text-xs text-gray-400 my-4">
                                        {format(new Date(msg.created_at), 'MMMM d, yyyy')}
                                    </div>
                                )}
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-lg p-3 ${isMe
                                            ? 'bg-teal-600 text-white rounded-br-none'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-teal-100' : 'text-gray-400'}`}>
                                            {format(new Date(msg.created_at), 'h:mm a')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-500">
                        <ImageIcon size={20} />
                    </Button>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        size="icon"
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
