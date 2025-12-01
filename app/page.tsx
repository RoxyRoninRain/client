"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import AnnouncementsCard from "./components/dashboard/AnnouncementsCard";
import ChampionsFeed from "./components/dashboard/ChampionsFeed";
import CalendarWidget from "./components/dashboard/CalendarWidget";
import CommunityPulse from "./components/dashboard/CommunityPulse";
import QuickActions from "./components/dashboard/QuickActions";
import LandingPage from "./components/LandingPage";
import ProfileGuard from "@/components/ProfileGuard";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setLoading(false);
    }
    getUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
    </div>;
  }

  if (!userId) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-200 font-[family-name:var(--font-geist-sans)]">
      <ProfileGuard>
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold font-serif text-[#0f172a]">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back to Akita Connect</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Top Row: Announcements & Community Pulse (Large) */}
            <div className="md:col-span-4 h-[400px]">
              <AnnouncementsCard />
            </div>

            <div className="md:col-span-8 h-[500px] md:h-[400px]">
              <CommunityPulse />
            </div>

            {/* Middle Row: Champions Feed (List) & Calendar */}
            <div className="md:col-span-6 h-[400px]">
              <ChampionsFeed />
            </div>

            <div className="md:col-span-6 h-[400px]">
              <CalendarWidget />
            </div>

            {/* Bottom Row: Quick Actions */}
            <div className="md:col-span-12">
              <QuickActions />
            </div>

          </div>

          <div className="mt-16 text-center text-gray-500">
            <TestConnection />
          </div>
        </main>
      </ProfileGuard>
    </div>
  );
}

function TestConnection() {
  const [status, setStatus] = useState<string>("");

  const testConnection = async () => {
    setStatus("Testing...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hello`);
      const data = await res.json();
      setStatus("Success: " + JSON.stringify(data));
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("Error: " + String(err));
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
      <button
        onClick={testConnection}
        className="text-xs text-gray-400 hover:text-gray-600 underline"
      >
        Check Server Status
      </button>
      <p className="text-[10px] text-gray-400">API: {process.env.NEXT_PUBLIC_API_URL || "Not Set"}</p>
      {status && <p className="text-xs font-mono bg-gray-100 p-2 rounded">{status}</p>}
    </div>
  );
}

