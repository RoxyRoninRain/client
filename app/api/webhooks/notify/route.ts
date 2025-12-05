import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Need Service Role for querying subs
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const webhookSecret = process.env.WEBHOOK_SECRET;

if (vapidPublicKey && vapidPrivateKey) {
    webPush.setVapidDetails(
        'mailto:support@akitaconnect.com',
        vapidPublicKey,
        vapidPrivateKey
    );
}

export async function POST(req: Request) {
    const signature = req.headers.get('x-webhook-secret');
    if (webhookSecret && signature !== webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const record = body.record; // Supabase Webhook payload

    if (!record || !record.user_id) {
        return NextResponse.json({ message: 'No user_id in record' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get User's Push Subscriptions
    const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', record.user_id);

    if (!subscriptions || subscriptions.length === 0) {
        return NextResponse.json({ message: 'No subscriptions found' });
    }

    // 2. Prepare Payload
    const payload = JSON.stringify({
        title: record.title || 'Akita Connect',
        body: record.content || 'You have a new notification',
        url: record.url || '/',
    });

    // 3. Send Notifications
    const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: atob(sub.p256dh), // Decode from Base64
                    auth: atob(sub.auth)
                }
            };
            try {
                await webPush.sendNotification(pushSub, payload);
            } catch (error: any) {
                if (error.statusCode === 410) {
                    // Subscription gone, delete it
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                }
                throw error;
            }
        })
    );

    return NextResponse.json({ success: true, results });
}
