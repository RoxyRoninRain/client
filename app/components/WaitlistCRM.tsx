"use client";

import { ShieldPlus } from "lucide-react";

export default function WaitlistCRM() {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Waitlist Management</h3>

            {/* Existing Waitlist Entries would go here */}
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center text-gray-500">
                No active waitlist entries.
            </div>

            {/* Affiliate Integration */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Buyer Benefits</h4>
                <button
                    className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group cursor-pointer"
                    onClick={() => alert("Trupanion Offer Sent! (Mock Action)")}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg text-green-600 dark:text-green-300">
                            <ShieldPlus size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-green-900 dark:text-green-100">Send Insurance Offer</p>
                            <p className="text-sm text-green-700 dark:text-green-300">30 Days Free with Trupanion</p>
                        </div>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-1 transition-transform">
                        Send &rarr;
                    </span>
                </button>
            </div>
        </div>
    );
}
