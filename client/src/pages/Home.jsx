import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';

export default function MainLayout() {
    const navigate = useNavigate();
    const { user, setShowLoginModal } = useAuth();
    const { feedItems, isLoading } = useFeed();

    const [activeFilter, setActiveFilter] = useState(null);

    const displayedItems = activeFilter
        ? feedItems.filter(item => item.locationId?.name === activeFilter)
        : feedItems;

    return (
        <div className="min-h-screen w-full">
            {/* Top Navbar (Mobile only, hidden on desktop for a cleaner app feel) */}
            <nav className="md:hidden bg-primary text-white p-4 sticky top-0 z-50">
                <h1 className="font-extrabold text-xl tracking-tight">Campus Found.</h1>
            </nav>

            {/* Main Container - strictly constrained to max-w-7xl per design system */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 sticky top-8">

                {/* 12-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* LEFT SIDEBAR (Navigation) - Takes up 3 columns */}
                    <div className="hidden md:block md:col-span-3">
                        <div className="sticky top-8">

                            {/* Placeholder for Navigation Links */}
                            <div className="flex flex-col space-y-2">
                                <div className="flex flex-col space-y-2">
                                    <button onClick={() => navigate('/')} className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-md transition-all duration-200 hover:scale-105 text-center">
                                        Latest Feed
                                    </button>
                                    <button
                                        onClick={() => user ? navigate('/report') : setShowLoginModal(true)}
                                        className="w-full bg-transparent text-foreground font-semibold py-3 px-4 rounded-md transition-all duration-200 hover:bg-white hover:scale-105 text-center"
                                    >
                                        Report Lost Item
                                    </button>
                                    <button
                                        onClick={() => user ? navigate('/report') : setShowLoginModal(true)}
                                        className="w-full bg-transparent text-foreground font-semibold py-3 px-4 rounded-md transition-all duration-200 hover:bg-white hover:scale-105 text-center"
                                    >
                                        I Found Something
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER COLUMN (The Feed) - Takes up 6 columns */}
                    {/* CENTER COLUMN (The Feed) */}
                    <div className="md:col-span-6 space-y-6">

                        <div className="bg-white p-6 rounded-lg mb-6">
                            <h2 className="font-extrabold text-2xl mb-2">Happening Now</h2>
                            <p className="text-gray-600 font-medium">Scroll to see recently lost or found items around campus.</p>
                        </div>

                        {/* NEW: Handle Loading State */}
                        {isLoading ? (
                            <div className="bg-muted border-4 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-gray-500">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                <h3 className="font-bold text-lg">Fetching latest items...</h3>
                            </div>
                        ) : feedItems.length === 0 ? (
                            <div className="bg-white rounded-lg p-12 text-center">
                                <h3 className="font-extrabold text-2xl mb-2">It's quiet out here.</h3>
                                <p className="text-gray-600 font-medium">No items have been reported yet.</p>
                            </div>
                        ) : displayedItems.length === 0 ? (
                            <div className="bg-white rounded-lg p-12 text-center">
                                <h3 className="font-extrabold text-2xl mb-2">It's quiet out here.</h3>
                                <p className="text-gray-600 font-medium">
                                    {activeFilter ? `No items found at ${activeFilter}.` : 'No items have been reported yet.'}
                                </p>
                                {/* Add a reset button if they are stuck in an empty filter */}
                                {activeFilter && (
                                    <button
                                        onClick={() => setActiveFilter(null)}
                                        className="mt-6 font-bold text-primary hover:underline"
                                    >
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                        ) : (
                            // NEW: Use displayedItems instead of feedItems
                            displayedItems.map(item => (
                                <PostCard key={item._id} item={item} />
                            ))
                        )}
                    </div>

                    {/* RIGHT SIDEBAR (Filters/Stats) - Takes up 3 columns */}
                    <div className="hidden md:block md:col-span-3">
                        <div className="sticky top-8 space-y-6">

                            {/* Quick Filters */}
                            <div className="bg-accent p-6 rounded-lg text-white transition-all duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-extrabold text-xl">Hot Zones</h3>
                                    {/* Show a "Clear" button if a filter is active */}
                                    {activeFilter && (
                                        <button
                                            onClick={() => setActiveFilter(null)}
                                            className="text-xs font-bold bg-white/20 px-2 py-1 rounded hover:bg-white/40 transition-colors"
                                        >
                                            CLEAR
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-2">
                                    {['Teston Hall', 'Creegan Hall', 'Doherty Hall', 'Gymnasium'].map(location => (
                                        <button
                                            key={location}
                                            onClick={() => setActiveFilter(activeFilter === location ? null : location)}
                                            className={`text-left font-bold py-2 px-3 rounded-md transition-all duration-200 ${activeFilter === location
                                                    ? 'bg-white text-accent scale-[1.02]' // Active state: Pure white block
                                                    : 'bg-transparent text-white hover:bg-white/20' // Inactive state
                                                }`}
                                        >
                                            # {location}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}