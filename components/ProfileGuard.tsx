"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        async function checkProfile() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in, let middleware handle it or redirect to login
                // But for this guard, we just stop loading if no user (shouldn't happen in protected routes)
                setLoading(false);
                return;
            }

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("real_name, region")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Profile check error:", error);
                // If error fetching profile, maybe safe to let them through or block?
                // Let's assume incomplete if error (e.g. no profile row)
                router.push("/profile?incomplete=true");
                return;
            }

            // Check for required fields
            // We require real_name and region.
            // Also check if they are just the default values "New User" or "My Kennel" if we set those defaults.
            // In our schema defaults are: real_name='New User', kennel_name='My Kennel'.
            // So we should check if they are still the defaults OR empty.

            const isDefaultName = profile.real_name === 'New User';
            const hasRegion = profile.region && profile.region.trim().length > 0;
            const hasName = profile.real_name && profile.real_name.trim().length > 0;

            if (!hasName || isDefaultName || !hasRegion) {
                // Profile incomplete
                // If we are already on the profile page, don't redirect (infinite loop)
                // But this guard is for the dashboard, so we redirect to profile.
                router.push("/profile?incomplete=true");
            } else {
                setIsComplete(true);
            }

            setLoading(false);
        }

        checkProfile();
    }, [router, pathname, supabase]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!isComplete) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
