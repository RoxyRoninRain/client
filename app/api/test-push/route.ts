import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

// Keys are read here but validated/used inside the handler to prevent build crashes

function initWebPush() {
    if (vapidPublicKey && vapidPrivateKey) {
        try {
            webPush.setVapidDetails(
                'mailto:support@akitaconnect.com',
                vapidPublicKey,
                vapidPrivateKey
            );
        } catch (err) {
            console.error("Failed to set VAPID details:", err);
        }
    }
}

export async function POST(req: Request) {
    initWebPush();
    // 1. Get User Session
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // 2. Get Subscriptions
    const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

    if (!subscriptions || subscriptions.length === 0) {
        return NextResponse.json({ error: 'No subscriptions found for user' }, { status: 404 });
    }

    // 3. Send Test Notification
    const payload = JSON.stringify({
        title: 'Test Notification',
        body: 'If you see this, Push Notifications are working!',
        url: '/settings',
    });

    const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
            try {
                await webPush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: atob(sub.p256dh),
                        auth: atob(sub.auth)
                    }
                }, payload);
                return { success: true, id: sub.id };
            } catch (error: any) {
                console.error("Push Error:", error);
                return { success: false, error: error.toString() };
            }
        })
    );

    return NextResponse.json({ results });
}
