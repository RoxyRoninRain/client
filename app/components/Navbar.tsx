import Link from "next/link";
import Image from "next/image";
import { Bell, UserCircle, Menu, Search, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        }
        getUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUserId(null);
        router.push("/login");
        router.refresh();
    };

    return (
        <nav className="bg-[#0f172a] border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo / Brand */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/logo.png"
                                    alt="Akita Connect Logo"
                                    fill
                                    className="object-contain rounded-full"
                                />
                            </div>
                            <span className="text-xl font-bold font-serif text-white hidden sm:block">
                                Akita Connect
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex items-center space-x-8">
                        <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/directory" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Directory
                        </Link>
                        <Link href="/kennel" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            My Kennel
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Search (Mobile/Desktop) */}
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                            <Search size={20} />
                        </button>

                        {/* Notifications */}
                        <Link href="/notifications" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
                        </Link>

                        {/* Profile */}
                        <Link href="/profile" className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                                <UserCircle size={24} className="text-gray-300" />
                            </div>
                        </Link>

                        {/* Sign Out (Desktop) */}
                        {userId && (
                            <button
                                onClick={handleSignOut}
                                className="hidden sm:flex p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        )}

                        {/* Mobile Menu Trigger */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="sm:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-[#0f172a] border-t border-gray-800 p-4 space-y-4 shadow-lg absolute w-full left-0">
                    <div className="space-y-2">
                        <Link href="/" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            Dashboard
                        </Link>
                        <Link href="/directory" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            Directory
                        </Link>
                        <Link href="/forums" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            Forums
                        </Link>
                        <Link href="/kennel" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            My Kennel
                        </Link>
                        <Link href="/profile" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            My Profile
                        </Link>
                        {userId && (
                            <button
                                onClick={() => {
                                    handleSignOut();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full text-left block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
                            >
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
