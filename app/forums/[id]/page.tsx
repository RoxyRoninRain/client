"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Send, User, Pin, Lock, Pencil, Trash2, X, Save, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

interface Post {
    id: string;
    content: string;
    author_id: string;
    created_at: string;
    image_urls?: string[];
    author?: {
        kennel_name: string;
        real_name: string;
    };
}

interface Topic {
    id: string;
    title: string;
    author_id: string;
    created_at: string;
    category_id: string;
    is_pinned: boolean;
    is_locked: boolean;
    author?: {
        kennel_name: string;
        real_name: string;
    };
}

export default function TopicPage() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [newReply, setNewReply] = useState("");
    const [replyImages, setReplyImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Edit State
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            setLoading(true);

            // Fetch Topic
            const { data: topicData, error: topicError } = await supabase
                .from('forum_topics')
                .select(`*`)
                .eq('id', id)
                .single();

            if (topicError) {
                console.error("Error fetching topic:", JSON.stringify(topicError, null, 2));
            } else {
                // Fetch author details
                if (topicData.author_id) {
                    const { data: authorData } = await supabase
                        .from('profiles')
                        .select('kennel_name, real_name')
                        .eq('id', topicData.author_id)
                        .single();

                    if (authorData) {
                        (topicData as any).author = authorData;
                    }
                }
                setTopic(topicData);
            }

            // Fetch Posts
            const { data: postsData, error: postsError } = await supabase
                .from('forum_posts')
                .select(`*`)
                .eq('topic_id', id)
                .order('created_at', { ascending: true });

            if (postsError) {
                console.error("Error fetching posts:", JSON.stringify(postsError, null, 2));
            } else {
                // Manually fetch authors for posts
                const postsWithAuthors = await Promise.all((postsData || []).map(async (post: any) => {
                    if (post.author_id) {
                        const { data: authorData } = await supabase
                            .from('profiles')
                            .select('kennel_name, real_name')
                            .eq('id', post.author_id)
                            .single();
                        return { ...post, author: authorData };
                    }
                    return post;
                }));
                setPosts(postsWithAuthors);
            }
            setLoading(false);
        }

        loadData();

        // Check user
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        }
        checkUser();
    }, [id]);

    async function handleReply() {
        if ((!newReply.trim() && replyImages.length === 0) || !userId || !id) return;
        setSubmitting(true);

        const { error } = await supabase
            .from('forum_posts')
            .insert({
                topic_id: id,
                author_id: userId,
                content: newReply,
                image_urls: replyImages
            });

        if (error) {
            alert("Failed to post reply: " + error.message);
        } else {
            setNewReply("");
            setReplyImages([]);
            // Refresh posts
            const { data: postsData } = await supabase
                .from('forum_posts')
                .select(`*`)
                .eq('topic_id', id)
                .order('created_at', { ascending: true });

            // Re-fetch authors (could be optimized)
            const postsWithAuthors = await Promise.all((postsData || []).map(async (post) => {
                if (post.author_id) {
                    const { data: authorData } = await supabase
                        .from('profiles')
                        .select('kennel_name, real_name')
                        .eq('id', post.author_id)
                        .single();
                    return { ...post, author: authorData };
                }
                return post;
            }));
            setPosts(postsWithAuthors || []);

            // Handle Mentions
            const mentions = newReply.match(/@(\w+)/g);
            if (mentions) {
                const uniqueMentions = [...new Set(mentions)];
                for (const mention of uniqueMentions) {
                    const username = mention.substring(1); // Remove @
                    // Call RPC to notify
                    // We don't await this to avoid blocking the UI
                    supabase.rpc('notify_mention', {
                        mentioned_username: username,
                        topic_id: id,
                        post_id: null // We don't have the new post ID easily unless we return it from insert. 
                        // Actually, insert returns data if we ask.
                    }).then(({ error }) => {
                        if (error) console.error("Error notifying mention:", error);
                    });
                }
            }
        }
        setSubmitting(false);
    }

    const handleEditClick = (post: Post) => {
        setEditingPostId(post.id);
        setEditContent(post.content);
    };

    const handleCancelEdit = () => {
        setEditingPostId(null);
        setEditContent("");
    };

    const handleUpdatePost = async (postId: string) => {
        if (!editContent.trim()) return;

        const { error } = await supabase
            .from('forum_posts')
            .update({ content: editContent })
            .eq('id', postId);

        if (error) {
            alert("Failed to update post: " + error.message);
        } else {
            setPosts(posts.map(p => p.id === postId ? { ...p, content: editContent } : p));
            setEditingPostId(null);
            setEditContent("");
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        const { error } = await supabase
            .from('forum_posts')
            .delete()
            .eq('id', postId);

        if (error) {
            alert("Failed to delete post: " + error.message);
        } else {
            setPosts(prev => prev.filter(p => p.id !== postId));
        }
    };

    const handleQuote = (post: Post) => {
        const authorName = post.author?.real_name || post.author?.kennel_name || "Unknown";
        const quoteText = `> **${authorName}** wrote:\n> ${post.content}\n\n`;
        setNewReply(prev => prev + quoteText);

        // Scroll to reply box
        const replyBox = document.querySelector('textarea[placeholder="Write your reply here..."]');
        if (replyBox) {
            replyBox.scrollIntoView({ behavior: 'smooth' });
            (replyBox as HTMLTextAreaElement).focus();
        }
    };

    if (loading) return <div className="p-8 text-center">Loading discussion...</div>;

    if (!topic) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Topic not found or invalid ID.</p>
                <Link href="/forums">
                    <Button variant="outline">Back to Forums</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link href={topic.category_id ? `/forums/category/${topic.category_id}` : "/forums"} className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to {topic.category_id ? "Category" : "Forums"}
                </Link>

                <Card className="border-2 border-gray-300 dark:border-gray-600 border-l-4 border-l-teal-500 shadow-md">
                    <CardHeader className="p-3 sm:p-6">
                        <div className="flex items-center gap-2 mb-2">
                            {topic.is_pinned && <Pin size={16} className="text-teal-600 fill-teal-600" />}
                            {topic.is_locked && <Lock size={16} className="text-red-500" />}
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            {topic.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                            <User size={14} />
                            <span>Started by <Link href={topic.author_id ? `/profile/${topic.author_id}` : '#'} className="font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 hover:underline">{topic.author?.real_name || topic.author?.kennel_name}</Link></span>
                            <span className="mx-2">•</span>
                            <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                        </div>
                    </CardHeader>
                </Card>

                <div className="space-y-6">
                    {posts.map((post) => (
                        <Card key={post.id} className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                <Link href={post.author_id ? `/profile/${post.author_id}` : '#'} className="hover:text-teal-600 hover:underline">
                                                    {post.author?.real_name || post.author?.kennel_name}
                                                </Link>
                                            </p>

                                            {editingPostId === post.id ? (
                                                <div className="space-y-4">
                                                    <Textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="min-h-[100px]"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                                            <X size={14} className="mr-1" /> Cancel
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleUpdatePost(post.id)} className="bg-teal-600 hover:bg-teal-700 text-white">
                                                            <Save size={14} className="mr-1" /> Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                                    <p className="whitespace-pre-wrap">{post.content}</p>
                                                    {post.image_urls && post.image_urls.length > 0 && (
                                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                                            {post.image_urls.map((url, idx) => (
                                                                <img key={idx} src={url} alt="Post attachment" className="rounded-lg max-h-64 object-cover" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleQuote(post)} title="Quote this post">
                                            <Quote size={16} className="text-gray-500 hover:text-teal-600" />
                                        </Button>
                                        {userId === post.author_id && (
                                            <>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(post)}>
                                                    <Pencil size={16} className="text-gray-500 hover:text-teal-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                                                    <Trash2 size={16} className="text-gray-500 hover:text-red-600" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center p-8 text-gray-500 italic">
                            No replies yet. Be the first to reply!
                        </div>
                    )}
                </div>

                {/* Reply Box */}
                {!topic.is_locked ? (
                    <Card className="mt-8">
                        <CardHeader className="p-3 sm:p-6">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare size={18} /> Leave a Reply
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6">
                            {userId ? (
                                <div className="space-y-4">
                                    <Textarea
                                        placeholder="Write your reply here..."
                                        value={newReply}
                                        onChange={(e) => setNewReply(e.target.value)}
                                        className="min-h-[120px]"
                                    />

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <ImageUpload
                                                variant="button"
                                                onChange={(url) => setReplyImages(prev => [...prev, url])}
                                                label="Add Image"
                                            />
                                            {replyImages.length > 0 && (
                                                <span className="text-sm text-gray-500 flex items-center">
                                                    {replyImages.length} image(s) attached
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            onClick={handleReply}
                                            disabled={submitting || (!newReply.trim() && replyImages.length === 0)}
                                            className="bg-teal-600 hover:bg-teal-700 text-white"
                                        >
                                            {submitting ? "Posting..." : <><Send size={16} className="mr-2" /> Post Reply</>}
                                        </Button>
                                    </div>

                                    {/* Preview Attached Images */}
                                    {replyImages.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto py-2">
                                            {replyImages.map((url, idx) => (
                                                <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                                                    <img src={url} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                                    <button
                                                        onClick={() => setReplyImages(prev => prev.filter((_, i) => i !== idx))}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">You must be logged in to reply.</p>
                                    <Link href="/login">
                                        <Button variant="outline">Log In</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center flex items-center justify-center gap-2">
                        <Lock size={16} /> This topic is locked.
                    </div>
                )}
            </div>
        </div>
    );
}
