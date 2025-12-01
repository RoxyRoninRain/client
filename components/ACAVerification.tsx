"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ACAVerification({ isMember }: { isMember: boolean }) {
    const [memberNumber, setMemberNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    if (isMember) {
        return (
            <Card className="bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800">
                <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 bg-teal-100 dark:bg-teal-800 rounded-full">
                        <ShieldCheck className="text-teal-600 dark:text-teal-300" size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-teal-900 dark:text-teal-100">ACA Member Verified</h3>
                        <p className="text-sm text-teal-700 dark:text-teal-300">Thank you for supporting the breed! You have full Pro access.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleVerify = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/verify-aca', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberNumber }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Verification failed");
            }

            setMessage({ type: 'success', text: data.message });
            setTimeout(() => {
                router.refresh(); // Refresh to show updated status
            }, 2000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-teal-600" /> Verify ACA Membership
                </CardTitle>
                <CardDescription>
                    Enter your Akita Club of America member number to unlock free Pro access.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="memberNumber">Member Number</Label>
                    <div className="flex gap-2">
                        <Input
                            id="memberNumber"
                            placeholder="e.g. 12345"
                            value={memberNumber}
                            onChange={(e) => setMemberNumber(e.target.value)}
                        />
                        <Button onClick={handleVerify} disabled={loading || !memberNumber}>
                            {loading ? <Loader2 className="animate-spin" /> : "Verify"}
                        </Button>
                    </div>
                </div>
                {message && (
                    <div className={`text-sm p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
