"use client";

import { useState } from "react";
import { Dog, Search } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Akita Connect</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Preservationist Akita Breeders</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Link href="/kennel" className="block w-full">
          <QuickActionButton
            icon={<Dog size={48} />}
            label="My Kennel"
            description="Manage your dogs and litters"
          />
        </Link>
        <Link href="/directory" className="block w-full">
          <QuickActionButton
            icon={<Search size={48} />}
            label="Find Stud"
            description="Search the directory"
          />
        </Link>
      </div>

      <div className="mt-16 text-center text-gray-500">
        <p>Select an action to get started.</p>
        <TestConnection />
      </div>
    </main>
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
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Local Connection
      </button>
      {status && <p className="text-sm font-mono bg-gray-100 p-2 rounded">{status}</p>}
    </div>
  );
}

function QuickActionButton({ icon, label, description }: { icon: React.ReactNode, label: string, description: string }) {
  return (
    <button className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 w-full aspect-square group cursor-pointer">
      <div className="mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h2 className="text-2xl font-bold mb-2">{label}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-center">{description}</p>
    </button>
  );
}
