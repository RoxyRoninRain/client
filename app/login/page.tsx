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

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
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
                    <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your Akita Connect account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="text-sm text-blue-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                <p className="text-sm text-gray-500">
                                Don't have an account?{" "}
                                <Link href="/signup" className="text-blue-600 hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div >
                );
}

                function TestConnection() {
    const [status, setStatus] = useState<string>("");

    const testConnection = async () => {
                        setStatus("Testing...");
                    console.log("Test button clicked");
                    try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hello`);
                    console.log("Fetch response received", res);
                    const data = await res.json();
                    console.log("Data parsed", data);
                    setStatus("Success: " + JSON.stringify(data));
        } catch (err) {
                        console.error("Fetch error:", err);
                    setStatus("Error: " + String(err));
        }
    };

                    return (
                    <div className="mt-4 flex flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={testConnection}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                            Test Local Connection
                        </button>
                        {status && <p className="text-xs font-mono bg-gray-100 p-2 rounded max-w-[300px] break-all">{status}</p>}
                    </div>
                    );
}
