import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseServiceKey) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Get the current user's session to verify identity
        // We need to create a client with the user's cookies to check who they are
        // But actually, we can just check the session from the request cookies using a standard client
        // However, to DELETE from auth.users, we need the admin client.

        // Let's verify the user first
        // We can't use createServerClient here easily without importing it from utils, 
        // but we can just use the access token from the header if we wanted, or just trust the session cookie if we use the standard pattern.

        // Better approach: Use the standard server client to get the user, then use admin client to delete.
        const { createClient: createServerClient } = await import('@/utils/supabase/server');
        const supabaseUser = await createServerClient();

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Now delete the user using admin client
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
            user.id
        );

        if (deleteError) {
            console.error("Error deleting user:", deleteError);
            return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unexpected error in delete-account:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
