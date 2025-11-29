"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Search, Bell, Heart, Award, BookOpen, Activity } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <div className="relative w-28 h-28 mb-8 rounded-full overflow-hidden border-4 border-slate-700 shadow-2xl ring-4 ring-slate-900/50">
                        <Image
                            src="/logo.png"
                            alt="Akita Connect Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-bold font-serif tracking-tight mb-6 text-white">
                        Akita Connect
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mb-10 font-light leading-relaxed">
                        The premier professional network dedicated to the preservation, health, and future of the Akita breed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-white text-slate-900 hover:bg-slate-100 font-semibold transition-all hover:scale-105">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/signup" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white font-semibold transition-all hover:scale-105">
                                Join the Pack
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* About / Mission Section */}
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm">Our Mission</span>
                        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-serif">
                            More Than Just a Social Network
                        </h2>
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Akita Connect is a purpose-built platform designed to elevate the standard of Akita ownership and breeding. We provide a space free from the noise of general social media, focusing on what matters most: the dogs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
                                <Activity className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Health Focused</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Access verified health testing data, share veterinary insights, and track lineage health history to make informed breeding decisions.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Verified Community</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Every member is verified via invite code, ensuring a safe environment of dedicated owners, ethical breeders, and professionals.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-600 dark:text-amber-400">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Expert Knowledge</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Learn from the masters. Our forums and articles are curated by long-time breeders and judges with decades of experience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-slate-500 font-semibold tracking-wider uppercase text-sm">Platform Features</span>
                        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-serif">
                            Everything You Need
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-blue-500" />}
                            title="Community Forums"
                            description="Engage in meaningful, threaded discussions. Categorized by Health, Training, Breeding, and Show News."
                        />
                        <FeatureCard
                            icon={<Search className="w-6 h-6 text-emerald-500" />}
                            title="Breeder Directory"
                            description="Find reputable breeders by region. View their dogs, health testing practices, and upcoming litters."
                        />
                        <FeatureCard
                            icon={<Bell className="w-6 h-6 text-amber-500" />}
                            title="Smart Alerts"
                            description="Never miss a show entry deadline or a major health announcement. Customize your notification preferences."
                        />
                        <FeatureCard
                            icon={<Award className="w-6 h-6 text-purple-500" />}
                            title="Show Results"
                            description="Real-time updates from dog shows around the country. Track points and rankings for your favorite dogs."
                        />
                        <FeatureCard
                            icon={<Heart className="w-6 h-6 text-red-500" />}
                            title="Health Database"
                            description="A collaborative database of health records to help the community track and improve breed health."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-slate-500" />}
                            title="Member Profiles"
                            description="Showcase your kennel and dogs. customizable profiles with photo galleries and pedigrees."
                        />
                    </div>
                </div>
            </section>

            {/* Invite Only / CTA Section */}
            <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                        <div className="p-12 md:w-3/5 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-8 h-8 text-blue-400" />
                                <span className="text-blue-400 font-bold tracking-wide uppercase text-sm">Exclusive Access</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-6 font-serif">
                                Why Invite Only?
                            </h2>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                To ensure the quality and safety of our community, Akita Connect is currently invite-only. This helps us prevent spam, scams, and ensures that every member is here for the right reasons.
                            </p>

                            <div className="space-y-6">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    How to get an invite code:
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-400 text-sm font-bold">1</span>
                                        </div>
                                        <p className="text-slate-300 text-sm">
                                            <strong className="text-white">Ask your breeder.</strong> Most ethical breeders are already members and can invite their puppy buyers.
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-400 text-sm font-bold">2</span>
                                        </div>
                                        <p className="text-slate-300 text-sm">
                                            <strong className="text-white">Contact an ACA Member.</strong> Reach out to a member of the Akita Club of America in your region.
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-400 text-sm font-bold">3</span>
                                        </div>
                                        <p className="text-slate-300 text-sm">
                                            <strong className="text-white">Akita Club of America.</strong> Members of the Akita Club of America get an invite and pro for free.
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-slate-800 md:w-2/5 p-12 flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-slate-700">
                            <h3 className="text-2xl font-bold text-white mb-4">Have a Code?</h3>
                            <p className="text-slate-400 mb-8">
                                If you already have your invite code, you're just a few steps away from joining the pack.
                            </p>
                            <Link href="/signup" className="w-full">
                                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg shadow-lg shadow-blue-900/20">
                                    Enter Invite Code
                                </Button>
                            </Link>
                            <p className="mt-6 text-sm text-slate-500">
                                Already a member? <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline">Sign in here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700">
                            <Image
                                src="/logo.png"
                                alt="Akita Connect Logo"
                                width={32}
                                height={32}
                                className="object-cover"
                            />
                        </div>
                        <span className="font-serif text-slate-200 font-bold">Akita Connect</span>
                    </div>
                    <p className="text-sm">&copy; {new Date().getFullYear()} Akita Connect. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 group">
            <CardHeader>
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
