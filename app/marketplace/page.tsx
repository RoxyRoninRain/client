"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Plus, Search, Tag, Mail, Phone, User } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import Link from "next/link";

interface Listing {
    id: string;
    title: string;
    description: string;
    price: number | null;
    category: string;
    image_urls: string[];
    contact_info: string;
    author_id: string;
    created_at: string;
    author?: {
        kennel_name: string;
        real_name: string;
    };
}

export default function MarketplacePage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [user, setUser] = useState<any>(null);

    // New Listing State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newListing, setNewListing] = useState({
        title: "",
        description: "",
        price: "",
        category: "General",
        contact_info: "",
        image_urls: [] as string[]
    });
    const [submitting, setSubmitting] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchListings();
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    }

    async function fetchListings() {
        setLoading(true);
        const { data, error } = await supabase
            .from('marketplace_listings')
            .select(`
                *,
                author:profiles(kennel_name, real_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching listings:", error);
        } else {
            setListings(data as any || []);
        }
        setLoading(false);
    }

    async function handleCreateListing() {
        if (!user) return;
        setSubmitting(true);

        const { error } = await supabase
            .from('marketplace_listings')
            .insert({
                title: newListing.title,
                description: newListing.description,
                price: newListing.price ? parseFloat(newListing.price) : null,
                category: newListing.category,
                contact_info: newListing.contact_info,
                image_urls: newListing.image_urls,
                author_id: user.id
            });

        if (error) {
            alert("Failed to create listing: " + error.message);
        } else {
            setIsDialogOpen(false);
            setNewListing({
                title: "",
                description: "",
                price: "",
                category: "General",
                contact_info: "",
                image_urls: []
            });
            fetchListings();
        }
        setSubmitting(false);
    }

    const filteredListings = listings.filter(l => {
        const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || l.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ["General", "Puppies", "Adults", "Equipment", "Merchandise", "Services"];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag className="text-teal-600" /> Marketplace
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">Buy, sell, and trade Akita-related items and dogs.</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                                <Plus size={16} className="mr-2" /> Post Listing
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Listing</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Title *</Label>
                                    <Input
                                        value={newListing.title}
                                        onChange={e => setNewListing({ ...newListing, title: e.target.value })}
                                        placeholder="e.g. Show Lead, Puppy Pen"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Price ($)</Label>
                                        <Input
                                            type="number"
                                            value={newListing.price}
                                            onChange={e => setNewListing({ ...newListing, price: e.target.value })}
                                            placeholder="Leave empty for 'Contact'"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select
                                            value={newListing.category}
                                            onValueChange={val => setNewListing({ ...newListing, category: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description *</Label>
                                    <Textarea
                                        value={newListing.description}
                                        onChange={e => setNewListing({ ...newListing, description: e.target.value })}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Contact Info *</Label>
                                    <Input
                                        value={newListing.contact_info}
                                        onChange={e => setNewListing({ ...newListing, contact_info: e.target.value })}
                                        placeholder="Email or Phone Number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Images</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {newListing.image_urls.map((url, idx) => (
                                            <div key={idx} className="relative w-20 h-20">
                                                <img src={url} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                                <button
                                                    onClick={() => setNewListing(prev => ({ ...prev, image_urls: prev.image_urls.filter((_, i) => i !== idx) }))}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <ImageUpload
                                            variant="button"
                                            onChange={url => setNewListing(prev => ({ ...prev, image_urls: [...prev.image_urls, url] }))}
                                            label="Add Photo"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCreateListing}
                                    disabled={submitting || !newListing.title || !newListing.description || !newListing.contact_info}
                                    className="w-full bg-teal-600 hover:bg-teal-700"
                                >
                                    {submitting ? "Posting..." : "Create Listing"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search listings..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading marketplace...</div>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed">
                        No listings found. Be the first to post!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredListings.map(listing => (
                            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 flex flex-col">
                                <div className="h-48 bg-gray-100 dark:bg-gray-800 relative">
                                    {listing.image_urls && listing.image_urls.length > 0 ? (
                                        <img src={listing.image_urls[0]} alt={listing.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ShoppingBag size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                        {listing.category}
                                    </div>
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-lg line-clamp-1" title={listing.title}>{listing.title}</CardTitle>
                                        <span className="font-bold text-teal-600 whitespace-nowrap">
                                            {listing.price ? `$${listing.price}` : "Contact"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <User size={12} />
                                        <span className="truncate">{listing.author?.kennel_name || listing.author?.real_name}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 flex-grow">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                        {listing.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 mt-auto bg-gray-50 dark:bg-gray-800/50">
                                    <div className="w-full pt-3 space-y-2">
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                            {listing.contact_info.includes('@') ? <Mail size={14} /> : <Phone size={14} />}
                                            <span className="truncate select-all">{listing.contact_info}</span>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
