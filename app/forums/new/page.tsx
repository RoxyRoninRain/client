"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

import { Suspense } from "react";

function NewTopicContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryIdParam = searchParams.get("category");

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [categoryId, setCategoryId] = useState(categoryIdParam || "");
    const [categories, setCategories] = useState<any[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function loadCategories() {
            const { data } = await supabase
                .from('forum_categories')
                .select('*')
                .order('sort_order', { ascending: true });
            if (data) setCategories(data);
        }
        loadCategories();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!categoryId) {
            setError("Please select a category.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("You must be logged in to create a topic.");
                setSubmitting(false);
                return;
            }

            // 1. Create Topic
            const { data: topicData, error: topicError } = await supabase
                .from('forum_topics')
                .insert({
                    title: title,
                    author_id: user.id,
                    category_id: categoryId
                })
                .select()
                .single();

            if (topicError) throw topicError;

            // 2. Create First Post
            const { error: postError } = await supabase
                .from('forum_posts')
                .insert({
                    topic_id: topicData.id,
                    author_id: user.id,
                    content: content,
                    image_urls: images
                });

            if (postError) throw postError;

            // Redirect to the new topic
            router.push(`/forums/${topicData.id}`);

        } catch (err: any) {
            console.error("Error creating topic:", err);
            setError(err.message || "Failed to create topic.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-2xl mx-auto space-y-6">
                <Link href={categoryIdParam ? `/forums/category/${categoryIdParam}` : "/forums"} className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to {categoryIdParam ? "Category" : "Forums"}
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <MessageSquare className="text-teal-600" /> Start a New Discussion
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={categoryId} onValueChange={setCategoryId} disabled={!!categoryIdParam}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Topic Title</Label>
                                <Input
                                    id="title"
                                    placeholder="What's on your mind?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">First Post</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Share your thoughts, questions, or announcements..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[200px]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Images (Optional)</Label>
                                <ImageUpload onChange={(url) => setImages(prev => [...prev, url])} />
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href="/forums">
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={submitting || !title.trim() || !content.trim() || !categoryId}
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    {submitting ? "Creating..." : <><Send size={16} className="mr-2" /> Create Topic</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function NewTopicPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <NewTopicContent />
        </Suspense>
    );
}
