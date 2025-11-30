
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Star } from "lucide-react";

export default function ProUpgradeCard() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full grid md:grid-cols-2 gap-0 overflow-hidden shadow-xl">
                {/* Monthly Option */}
                <div className="p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Monthly Access</h3>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">$4.99<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                    <p className="text-gray-500 text-center mb-8">
                        Get full access to all Pro features including Directory, Litter Logging, and Unlimited Dogs.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                        <a href="mailto:support@akitaconnect.com?subject=Subscribe to Monthly Pro Plan">Subscribe Monthly</a>
                    </Button>
                    <p className="text-xs text-gray-400 mt-4">$59.88 / year</p>
                </div>

                {/* ACA Membership Option (Highlighted) */}
                <div className="p-8 flex flex-col justify-center items-center bg-teal-50 dark:bg-teal-900/20 relative">
                    <div className="absolute top-0 right-0 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        BEST VALUE
                    </div>
                    <div className="mb-4 p-3 bg-teal-100 dark:bg-teal-800 rounded-full">
                        <ShieldCheck size={32} className="text-teal-600 dark:text-teal-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-100 mb-2">ACA Membership</h3>
                    <div className="text-4xl font-bold text-teal-700 dark:text-teal-300 mb-4">$35<span className="text-lg text-teal-600/70 font-normal">/yr</span></div>
                    <p className="text-teal-700/80 dark:text-teal-300/80 text-center mb-6">
                        Join the Akita Club of America. Support the breed, get voting rights, and enjoy all Pro features.
                    </p>

                    <ul className="space-y-2 mb-8 text-left w-full max-w-xs">
                        <li className="flex items-center gap-2 text-sm text-teal-800 dark:text-teal-200">
                            <Star size={16} className="fill-teal-600 text-teal-600" /> Save over 40% vs Monthly
                        </li>
                        <li className="flex items-center gap-2 text-sm text-teal-800 dark:text-teal-200">
                            <Star size={16} className="fill-teal-600 text-teal-600" /> Support Breed Preservation
                        </li>
                        <li className="flex items-center gap-2 text-sm text-teal-800 dark:text-teal-200">
                            <Star size={16} className="fill-teal-600 text-teal-600" /> Official ACA Member Status
                        </li>
                    </ul>

                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg" asChild>
                        <a href="mailto:support@akitaconnect.com?subject=Join ACA Membership">Join ACA Today</a>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
