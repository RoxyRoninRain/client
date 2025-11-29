"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InviteGenerator({ userId }: { userId: Promise<string | undefined> | string | undefined }) {
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function generateCode() {
        setLoading(true);
        setError(null);
        setCode(null);

        try {
            // Resolve userId if it's a promise (hacky fix for the prop passing above)
            const resolvedId = await userId;

            if (!resolvedId) {
                setError("User ID missing");
                setLoading(false);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: resolvedId })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate code');
            }

            setCode(data.code);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            {code ? (
                <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md font-mono font-bold flex items-center gap-2 animate-in fade-in">
                    {code}
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(code); alert("Copied!"); }}>
                        📋
                    </Button>
                </div>
            ) : (
                <Button variant="secondary" onClick={generateCode} disabled={loading}>
                    {loading ? "Generating..." : "Generate Invite"}
                </Button>
            )}
            {error && <span className="text-red-500 text-xs max-w-[150px] leading-tight">{error}</span>}
        </div>
    );
}
