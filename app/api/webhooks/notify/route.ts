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
        body: record.message || record.content || 'You have a new notification',
        url: record.link || record.url || '/',
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

    // 3. Email Notification Logic
    // We run this in parallel with Push
    try {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
            const { Resend } = await import('resend');
            const resend = new Resend(resendApiKey);

            // Fetch User Email
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(record.user_id);

            if (user && user.email) {
                // Fetch Notification Preferences
                const { data: prefs } = await supabase
                    .from('notification_preferences')
                    .select('*')
                    .eq('user_id', record.user_id)
                    .single();

                // Determine if we should send email
                // Default to 'email_messages' if type is unknown, or check record.type
                // We assume record.type maps to preference keys: 'announcement', 'reply', 'message', 'mention'
                const type = record.type || 'message';
                let shouldSendEmail = false;

                if (prefs) {
                    if (type === 'announcement' && prefs.email_announcements) shouldSendEmail = true;
                    else if (type === 'reply' && prefs.email_replies) shouldSendEmail = true;
                    else if (type === 'mention' && prefs.email_mentions) shouldSendEmail = true;
                    else if (type === 'message' && prefs.email_messages) shouldSendEmail = true;
                    // Fallback: if type is unknown but some general flag is on? 
                    // For now, strict mapping or default 'message'.
                } else {
                    // Default to true if no prefs set? Or false? 
                    // Usually safer to default to false or true depending on UX. 
                    // Given the settings page defaults to ALL TRUE, we might assume true if no record exists yet.
                    shouldSendEmail = true;
                }

                if (shouldSendEmail) {
                    await resend.emails.send({
                        from: 'Akita Connect <notifications@akitaconnect.com>', // User needs to configure domain
                        to: user.email,
                        subject: record.title || 'New Notification',
                        html: `
                            <div style="font-family: sans-serif; padding: 20px;">
                                <h2>${record.title || 'New Notification'}</h2>
                                <p>${record.message || record.content || 'You have a new notification on Akita Connect.'}</p>
                                <a href="${record.link || record.url || process.env.NEXT_PUBLIC_API_URL}" style="display: inline-block; padding: 10px 20px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 5px;">
                                    View on Akita Connect
                                </a>
                            </div>
                        `
                    });
                    console.log(`Email sent to ${user.email}`);
                }
            }
        } else {
            console.warn("RESEND_API_KEY is missing, skipping email.");
        }
    } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Do not fail the request if email fails, Push might have succeeded
    }

    return NextResponse.json({ success: true, pushResults: results });
}
