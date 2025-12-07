"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from "@/utils/supabase/client";

// Hardcoded for debugging to rule out Env Var issues


function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushSubscription() {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const supabase = createClient();

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);

            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(sub => {
                    setSubscription(sub);
                });
            });
        }
    }, []);

    const subscribe = async () => {
        if (!isSupported) {
            console.error("Push notifications not supported");
            toast.error("Push notifications are not supported on this device.");
            return;
        }
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
            console.error("Missing VAPID_PUBLIC_KEY");
            toast.error("Configuration Error: VAPID Key is missing.");
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready; // Wait for active

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            });

            // Save to Database
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const p256dh = sub.getKey('p256dh');
                const auth = sub.getKey('auth');

                if (p256dh && auth) {
                    await supabase.from('push_subscriptions').upsert({
                        user_id: user.id,
                        endpoint: sub.endpoint,
                        p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh)))),
                        auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth)))),
                    }, { onConflict: 'user_id, endpoint' });
                }
            }

            setSubscription(sub);
            setPermission(Notification.permission);
            toast.success("Notifications enabled!");
            return true;
        } catch (error: any) {
            console.error('Failed to subscribe to Push', error);
            toast.error(`Subscription failed: ${error.message || 'Unknown error'}`);
            return false;
        }
    };

    const unsubscribe = async () => {
        if (subscription) {
            await subscription.unsubscribe();

            // Ideally remove from DB too, but key rotation handles cleanup usually
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('push_subscriptions')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('endpoint', subscription.endpoint);
            }

            setSubscription(null);
        }
    };

    return { isSupported, permission, subscription, subscribe, unsubscribe };
}
