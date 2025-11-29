import { useEffect, useState } from "react";
import { Trophy, Award } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface ChampionWin {
    id: string;
    title: string;
    show_name: string;
    win_date: string;
    image_url?: string;
    dogs: {
        call_name: string;
        owner: {
            real_name: string;
            kennel_name: string;
        } | null;
    } | null;
}

export default function ChampionsFeed() {
    const [wins, setWins] = useState<ChampionWin[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchWins() {
            const { data, error } = await supabase
                .from('dog_wins')
                .select(`
                    id,
                    title,
                    show_name,
                    win_date,
                    image_url,
                    dogs (
                        call_name,
                        owner:profiles (
                            real_name,
                            kennel_name
                        )
                    )
                `)
                .order('win_date', { ascending: false })
                .limit(5);

            if (error) {
                console.error("Error fetching wins:", error);
            } else {
                setWins(data as any || []);
            }
            setLoading(false);
        }

        fetchWins();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                New Champions & Wins
            </h2>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {wins.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No recent wins recorded.</p>
                ) : (
                    wins.map((win) => (
                        <div key={win.id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                {win.image_url ? (
                                    <Image
                                        src={win.image_url}
                                        alt={win.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">🏆</div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-sm">
                                    <Award size={10} />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">
                                        {win.dogs?.call_name || "Unknown Dog"}
                                    </h3>
                                    <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full whitespace-nowrap max-w-[100px] truncate">
                                        {win.title}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-500 mt-0.5">
                                    {win.show_name} • {formatDistanceToNow(new Date(win.win_date), { addSuffix: true })}
                                </p>

                                <div className="mt-2 text-xs text-gray-500">
                                    <span className="block text-[10px] uppercase tracking-wider opacity-70">Owner</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate block">
                                        {win.dogs?.owner?.kennel_name || win.dogs?.owner?.real_name || "Unknown"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
