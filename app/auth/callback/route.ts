import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();

        // DEBUG: Log details for PKCE investigation
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        console.log("--- AUTH CALLBACK DEBUG ---");
        console.log("Request URL:", request.url);
        console.log("Origin:", origin);
        console.log("Code Present:", !!code);
        console.log("Cookies Received:", allCookies.map(c => c.name).join(", "));
        const verifierCookie = allCookies.find(c => c.name.includes("code-verifier"));
        if (verifierCookie) {
            console.log("Verifier Cookie Found:", verifierCookie.name, "Value (truncated):", verifierCookie.value.substring(0, 10) + "...");
        } else {
            console.log("CRITICAL: No code-verifier cookie found!");
        }
        console.log("---------------------------");

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === "development";
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        } else {
            console.error("Auth error:", error);
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error.code}&description=${encodeURIComponent(error.message)}`);
        }
    }

    // return the user to an error page with instructions
    const errorCode = "AuthExchangeError";
    const errorDescription = "No code provided.";
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${errorCode}&description=${encodeURIComponent(errorDescription)}`);
}
