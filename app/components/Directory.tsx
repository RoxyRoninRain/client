"use client";

import { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";

// Mock Data
const MOCK_BREEDERS = [
    { id: 1, name: "Royal Akitas", location: "New York, NY", lat: 40.7128, lng: -74.0060, verified: true },
    { id: 2, name: "Golden Sun Kennels", location: "Los Angeles, CA", lat: 34.0522, lng: -118.2437, verified: true },
    { id: 3, name: "Mountain Peak Akitas", location: "Denver, CO", lat: 39.7392, lng: -104.9903, verified: false },
    { id: 4, name: "Lone Star Akitas", location: "Austin, TX", lat: 30.2672, lng: -97.7431, verified: true },
    { id: 5, name: "Windy City Akitas", location: "Chicago, IL", lat: 41.8781, lng: -87.6298, verified: true },
];

// Haversine Formula Helper
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

// Mock Zip Code to Lat/Lng conversion (In a real app, use a geocoding API)
const MOCK_ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
    "10001": { lat: 40.7128, lng: -74.0060 }, // NYC
    "90001": { lat: 34.0522, lng: -118.2437 }, // LA
    "60601": { lat: 41.8781, lng: -87.6298 }, // Chicago
    // Default fallback for demo
    "default": { lat: 39.8283, lng: -98.5795 } // Center of US
};

export default function Directory() {
    const [searchQuery, setSearchQuery] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [maxDistance, setMaxDistance] = useState<number | "">("");

    const filteredBreeders = useMemo(() => {
        let filtered = MOCK_BREEDERS;

        // Filter by Name
        if (searchQuery) {
            filtered = filtered.filter(b =>
                b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by Distance
        if (zipCode && maxDistance) {
            const userCoords = MOCK_ZIP_COORDS[zipCode] || MOCK_ZIP_COORDS["default"];
            filtered = filtered.filter(b => {
                const distance = getDistanceFromLatLonInKm(userCoords.lat, userCoords.lng, b.lat, b.lng);
                // Convert km to miles roughly for the UI
                const distanceInMiles = distance * 0.621371;
                return distanceInMiles <= Number(maxDistance);
            });
        }

        return filtered;
    }, [searchQuery, zipCode, maxDistance]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Breeder Directory</h2>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or location..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Zip Code (e.g. 10001)"
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                        />
                    </div>

                    <select
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(e.target.value ? Number(e.target.value) : "")}
                    >
                        <option value="">Any Distance</option>
                        <option value="50">Within 50 miles</option>
                        <option value="100">Within 100 miles</option>
                        <option value="500">Within 500 miles</option>
                    </select>
                </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBreeders.map(breeder => (
                    <div key={breeder.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {breeder.name}
                                    {breeder.verified && (
                                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Verified</span>
                                    )}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <MapPin size={16} />
                                    {breeder.location}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredBreeders.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No breeders found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
}
