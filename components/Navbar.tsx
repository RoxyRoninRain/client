"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, UserCircle, Menu, LogOut, Shield } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

import { User } from "@supabase/supabase-js";

export default function Navbar({ user }: { user: User | null }) {
    const [userId, setUserId] = useState<string | null>(user?.id || null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const supabase = createClient();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        async function fetchUserRole() {
            if (!user) {
                setUserRole(null);
                setUserId(null);
                return;
            }

            setUserId(user.id);
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data?.role) {
                setUserRole(data.role);
            }
        }

        fetchUserRole();

        // Fetch unread notifications count
        async function fetchNotifications() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (count !== null) setUnreadCount(count);

            // Subscribe to new notifications
            const channel = supabase
                .channel('realtime:notifications')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, () => {
                    setUnreadCount(prev => prev + 1);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
        fetchNotifications();
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUserId(null);
        setUserRole(null);
        router.push("/login");
        router.refresh();
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="bg-[#0f172a] border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* ... (Logo) ... */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/logo.png"
                                    alt="Akita Connect Logo"
                                    fill
                                    sizes="40px"
                                    className="object-contain rounded-full"
                                />
                            </div>
                            <span className="text-xl font-bold font-serif text-white hidden sm:block">
                                Akita Connect
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex items-center space-x-4">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/forums"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/forums') || pathname.startsWith('/forums') ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        >
                            Forums
                        </Link>
                        <Link
                            href="/directory"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/directory') ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        >
                            Directory
                        </Link>
                        <Link
                            href="/marketplace"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/marketplace') ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        >
                            Marketplace
                        </Link>
                        <Link
                            href="/messages"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/messages') ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                        >
                            Messages
                        </Link>

                        {/* Admin Link */}
                        {userRole === 'admin' && (
                            <Link
                                href="/admin"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${isActive('/admin') ? 'text-red-500 bg-gray-800' : 'text-red-400 hover:text-red-300 hover:bg-gray-800'}`}
                            >
                                <Shield size={16} /> Admin
                            </Link>
                        )}

                        <Link href="/notifications" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors relative">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white border-2 border-[#0f172a]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>

                        {/* Profile */}
                        <Link href={userId ? `/profile` : "/login"} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                                <UserCircle size={24} className="text-gray-300" />
                            </div>
                        </Link>

                        {/* Logout Button (Desktop) */}
                        {userId && (
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        )}

                    </div>

                    {/* Mobile Actions & Menu Trigger */}
                    <div className="flex items-center gap-3 sm:hidden ml-auto">
                        <Link href="/notifications" className="p-2 text-white hover:bg-gray-800 rounded-full transition-colors relative">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white border-2 border-[#0f172a]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>

                        <Link href={userId ? `/profile` : "/login"} className="p-1 text-white hover:bg-gray-800 rounded-full transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                                <UserCircle size={24} className="text-gray-300" />
                            </div>
                        </Link>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-white hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-[#0f172a] border-t border-gray-800 p-4 space-y-4 shadow-lg absolute w-full left-0 z-50">
                    <div className="space-y-2">
                        <Link href="/" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            Dashboard
                        </Link>
                        <Link href="/forums" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            Forums
                        </Link>
                        <Link href="/directory" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            Directory
                        </Link>
                        <Link href="/marketplace" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            Marketplace
                        </Link>
                        <Link href="/messages" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            Messages
                        </Link>
                        <Link href="/settings" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            Settings
                        </Link>
                        {userRole === 'admin' && (
                            <Link href="/admin" className="block px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                                <Shield size={16} /> Admin Dashboard
                            </Link>
                        )}
                        <Link href="/profile" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                            My Profile
                        </Link>
                        {userId && (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg"
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
