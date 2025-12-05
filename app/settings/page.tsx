"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, AtSign } from "lucide-react";
import { toast } from "sonner";
import { usePushSubscription } from "@/hooks/usePushSubscription";

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
    const { isSupported, permission, subscription, subscribe, unsubscribe } = usePushSubscription();
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
                            <Bell className="text-teal-600" /> Push Notifications
                        </CardTitle>
                        <CardDescription>
                            Enable push notifications to stay updated on new messages and activity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!isSupported ? (
                            <div className="text-red-500">
                                Push notifications are not supported in this browser.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <Label htmlFor="push-notifications" className="font-medium">
                                            Enable Push Notifications
                                        </Label>
                                        <span className="text-sm text-gray-500">
                                            {subscription ? "You are currently subscribed." : "Receive notifications on this device."}
                                        </span>
                                    </div>
                                    <Switch
                                        id="push-notifications"
                                        checked={!!subscription}
                                        onCheckedChange={(checked) => {
                                            if (checked) subscribe();
                                            else unsubscribe();
                                        }}
                                    />
                                </div>
                                {permission === 'denied' && (
                                    <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                        Notifications are blocked by your browser depending settings. You need to manually enable them in your browser settings (click the lock icon in the address bar).
                                    </p>
                                )}

                                {/* Test Button */}
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            const { data: { user } } = await supabase.auth.getUser();
                                            if (!user) return;
                                            toast.info("Sending test notification...");
                                            const res = await fetch('/api/test-push', {
                                                method: 'POST',
                                                body: JSON.stringify({ userId: user.id })
                                            });
                                            const result = await res.json();
                                            console.log("Test Result:", result);
                                            if (res.ok) toast.success("Test sent! Check your notifications.");
                                            else toast.error("Test failed. Check console.");
                                        }}
                                    >
                                        Send Test Notification
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="text-teal-600" /> Email Preferences
                        </CardTitle>
                        <CardDescription>
                            Manage which emails you want to receive.
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
