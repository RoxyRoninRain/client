"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KennelDashboard() {
    const router = useRouter();

    useEffect(() => {
        router.push("/profile");
    }, [router]);

    return (
        <div className="p-8 text-center">
            <p>Redirecting to your profile...</p>
        </div>
    );
}
