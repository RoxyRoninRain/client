"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        // 1. Validate Invite Code via Backend (RPC)
        try {
            // Trim and uppercase the code to match DB format
            const cleanCode = inviteCode.trim().toUpperCase();

            const { data: ownerId, error: rpcError } = await supabase.rpc('lookup_invite_owner', { p_code: cleanCode });

            if (rpcError) {
                console.error("Validation error:", rpcError);
                setError(rpcError.message || "Invalid invite code.");
                setLoading(false);
                return;
            }

            if (!ownerId) {
                setError("Invalid invite code. Please request one from an ACA member.");
                setLoading(false);
                return;
            }
        } catch (err: any) {
            console.error("Validation error:", err);
            setError(err.message || "Could not validate invite code. Please try again.");
            setLoading(false);
            return;
        }

        // 2. Sign Up
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    invite_code: inviteCode,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Join the Pack</CardTitle>
                    <CardDescription className="text-center">
                        Enter your invite code to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="inviteCode">Invite Code</Label>
                            <Input
                                id="inviteCode"
                                type="text"
                                placeholder="Enter your invite code"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
