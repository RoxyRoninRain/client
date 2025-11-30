"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchNotifications() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error("Error fetching notifications:", error);
            } else {
                setNotifications(data || []);
            }
            setLoading(false);
        }

        fetchNotifications();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-3xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="text-teal-600" /> Notifications
                    </h1>
                </header>

                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : notifications.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                No new notifications.
                            </CardContent>
                        </Card>
                    ) : (
                        notifications.map(notification => (
                            <Card key={notification.id} className={`transition-colors ${notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-semibold">{notification.title}</CardTitle>
                                        <span className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleDateString()}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-300">{notification.message}</p>
                                    {notification.link && (
                                        <a href={notification.link} className="text-sm text-teal-600 hover:underline mt-2 inline-block">
                                            View Details
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
