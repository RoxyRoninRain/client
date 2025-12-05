"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, AtSign } from "lucide-react";
import { toast } from "sonner";

interface Preferences {
    email_announcements: boolean;
    email_replies: boolean;
    email_messages: boolean;
    email_mentions: boolean;
}

export default function SettingsPage() {
    const [preferences, setPreferences] = useState<Preferences>({
        email_announcements: true,
        email_replies: true,
        email_messages: true,
        email_mentions: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function loadPreferences() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setPreferences({
                    email_announcements: data.email_announcements,
                    email_replies: data.email_replies,
                    email_messages: data.email_messages,
                    email_mentions: data.email_mentions,
                });
            } else if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error("Error loading preferences:", error);
            }
            setLoading(false);
        }
        loadPreferences();
    }, []);

    const handleToggle = (key: keyof Preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('notification_preferences')
            .upsert({
                user_id: user.id,
                ...preferences,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Error saving preferences:", error);
            toast.error("Failed to save settings");
        } else {
            toast.success("Settings saved successfully");
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="text-teal-600" /> Notification Preferences
                        </CardTitle>
                        <CardDescription>
                            Manage how you want to be notified about activity on Akita Connect.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="announcements" className="font-medium flex items-center gap-2">
                                    <Mail size={16} /> System Announcements
                                </Label>
                                <span className="text-sm text-gray-500">Receive emails about major updates and community news.</span>
                            </div>
                            <Switch
                                id="announcements"
                                checked={preferences.email_announcements}
                                onCheckedChange={() => handleToggle('email_announcements')}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="replies" className="font-medium flex items-center gap-2">
                                    <MessageSquare size={16} /> Forum Replies
                                </Label>
                                <span className="text-sm text-gray-500">Get notified when someone replies to your topics.</span>
                            </div>
                            <Switch
                                id="replies"
                                checked={preferences.email_replies}
                                onCheckedChange={() => handleToggle('email_replies')}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="messages" className="font-medium flex items-center gap-2">
                                    <MessageSquare size={16} /> Direct Messages
                                </Label>
                                <span className="text-sm text-gray-500">Receive an email when you get a new private message.</span>
                            </div>
                            <Switch
                                id="messages"
                                checked={preferences.email_messages}
                                onCheckedChange={() => handleToggle('email_messages')}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="mentions" className="font-medium flex items-center gap-2">
                                    <AtSign size={16} /> Mentions
                                </Label>
                                <span className="text-sm text-gray-500">Get notified when someone tags you (@username) in a post.</span>
                            </div>
                            <Switch
                                id="mentions"
                                checked={preferences.email_mentions}
                                onCheckedChange={() => handleToggle('email_mentions')}
                            />
                        </div>

                        <div className="pt-4">
                            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
