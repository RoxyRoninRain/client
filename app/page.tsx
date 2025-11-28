import { Dog, Search } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Akita Connect</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Preservationist Akita Breeders</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <QuickActionButton
          icon={<Dog size={48} />}
          label="My Kennel"
          description="Manage your dogs and litters"
        />
        <QuickActionButton
          icon={<Search size={48} />}
          label="Find Stud"
          description="Search the directory"
        />
      </div>

      {/* Placeholder for future sections */}
      <div className="mt-16 text-center text-gray-500">
        <p>Select an action to get started.</p>
      </div>
    </main>
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
