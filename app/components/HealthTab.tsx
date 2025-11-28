"use client";

import { Dna } from "lucide-react";

export default function HealthTab() {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Health Records</h3>

            {/* Existing Health Records List would go here */}
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center text-gray-500">
                No health records found.
            </div>

            {/* Affiliate Integration */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recommended Actions</h4>
                <a
                    href="https://embarkvet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg text-blue-600 dark:text-blue-300">
                            <Dna size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-blue-900 dark:text-blue-100">Order DNA Kit</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">Verify health with Embark</p>
                        </div>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                        Go &rarr;
                    </span>
                </a>
            </div>
        </div>
    );
}
