import { Scale, PlusCircle, FileText, Search } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
    const actions = [
        {
            label: "Log Litter Weight",
            icon: <Scale size={20} />,
            href: "/kennel/log-litter",
            color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
        },
        {
            label: "Add New Dog",
            icon: <PlusCircle size={20} />,
            href: "/kennel/add-dog",
            color: "bg-teal-50 text-teal-600 hover:bg-teal-100",
        },

        {
            label: "Search Directory",
            icon: <Search size={20} />,
            href: "/directory",
            color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
        },
        {
            label: "Generate Invite",
            icon: <FileText size={20} />,
            href: "/kennel", // Redirects to kennel where invite gen is
            color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col justify-center">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
                {actions.map((action) => (
                    <Link key={action.label} href={action.href} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${action.color}`}>
                        <div className="flex-shrink-0">
                            {action.icon}
                        </div>
                        <span className="text-sm font-semibold">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
