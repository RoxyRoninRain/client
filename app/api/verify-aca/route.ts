import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const { memberNumber } = await request.json();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!memberNumber) {
            return NextResponse.json({ error: "Member number is required" }, { status: 400 });
        }

        // 1. Check ACA Whitelist
        // We check if the member number exists and matches the user's email
        // OR just check if the member number exists if we trust the user claiming it (less secure)
        // The PRD implies checking against uploaded CSV.
        // Let's match on member_number AND email for security.

        const { data: whitelistEntry, error: whitelistError } = await supabase
            .from('aca_whitelist')
            .select('*')
            .eq('member_number', memberNumber)
            .ilike('email', user.email || '') // Case-insensitive match on email
            .single();

        if (whitelistError || !whitelistEntry) {
            return NextResponse.json({
                error: "Verification failed. No match found for this member number and your email address."
            }, { status: 404 });
        }

        // 2. Update User Profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                is_aca_member: true,
                subscription_tier: 'pro'
            })
            .eq('id', user.id);

        if (updateError) {
            console.error("Profile update error:", updateError);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Verified! You have been upgraded to Pro." });

    } catch (err) {
        console.error("Verification error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
