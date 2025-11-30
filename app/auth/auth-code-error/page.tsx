import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage({
    searchParams,
}: {
    searchParams: { error?: string; description?: string };
}) {
    const error = searchParams?.error || "Unknown Error";
    const description = searchParams?.description || "There was a problem verifying your identity.";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-red-600">Authentication Error</CardTitle>
                    <CardDescription className="text-center">
                        {error}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-gray-600">
                        {description}
                    </p>
                    <div className="flex justify-center">
                        <Link href="/forgot-password">
                            <Button>Try Again</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
