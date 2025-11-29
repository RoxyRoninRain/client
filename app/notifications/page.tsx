"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    const notifications = [
        { id: 1, title: "Welcome to Akita Connect!", message: "We're glad you're here. Complete your profile to get started.", date: "Just now", read: false },
        // Placeholder data
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-3xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="text-teal-600" /> Notifications
                    </h1>
                </header>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
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
                                        <span className="text-xs text-gray-500">{notification.date}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-300">{notification.message}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
