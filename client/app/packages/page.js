'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PackageCard from '@/components/PackageCard';
import MoodFilter from '@/components/MoodFilter';
import { Search, SlidersHorizontal } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PackagesPage() {
    const [packages, setPackages] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [destinationType, setDestinationType] = useState('all'); // all, domestic, international
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/packages`)
            .then((r) => r.json())
            .then((data) => { setPackages(data); setFiltered(data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...packages];

        // Filter by Destination Type (Domestic = India)
        if (destinationType === 'domestic') result = result.filter((p) => p.country?.toLowerCase() === 'india');
        else if (destinationType === 'international') result = result.filter((p) => p.country?.toLowerCase() !== 'india');

        if (activeFilter !== 'all') result = result.filter((p) => p.category === activeFilter);
        if (search) result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()) || p.country.toLowerCase().includes(search.toLowerCase()));
        if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
        setFiltered(result);
    }, [packages, activeFilter, destinationType, search, sortBy]);

    return (
        <>
            {/* Hero Banner */}
            <section
                className="relative pt-28 pb-16 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1600&q=80')` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
                <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-serif font-bold mb-4"
                    >
                        All Travel <span className="italic text-emerald-300">Packages</span>
                    </motion.h1>
                    <p className="text-xl text-white/80">Discover handcrafted journeys to the world's most breathtaking destinations.</p>
                </div>
            </section>

            {/* Filters + Search Bar (Compact & Scrollable with page) */}
            <div className="bg-white border-b border-gray-200 shadow-sm py-3 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Domestic / International Toggle (Main Filter) */}
                    <div className="flex justify-center mb-3">
                        <div className="inline-flex bg-gray-100 p-1.5 rounded-full">
                            {['all', 'domestic', 'international'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setDestinationType(type)}
                                    className={`relative px-6 py-2 text-sm font-bold rounded-full transition-colors ${destinationType === type ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {destinationType === type && (
                                        <motion.div
                                            layoutId="destTypeTab"
                                            className="absolute inset-0 bg-emerald-600 rounded-full shadow-md"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 capitalize">{type === 'all' ? 'All Destinations' : type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Single Row Horizontal Scroll for Filters */}
                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {/* Search */}
                        <div className="relative flex-shrink-0 w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search destinations..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                            />
                        </div>
                        {/* Mood Filter */}
                        <div className="flex-shrink-0">
                            <MoodFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                        </div>
                        {/* Sort */}
                        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                            <SlidersHorizontal className="w-4 h-4 text-gray-500 hidden sm:block" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 font-medium cursor-pointer"
                            >
                                <option value="default">Sort: Default</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating">Best Rated</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Packages Grid */}
            <section className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100">
                                    <div className="h-56 bg-gray-200" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded w-full" />
                                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <>
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {destinationType === 'domestic' ? 'Explore India' : destinationType === 'international' ? 'Global Getaways' : 'All Packages'}
                                </h2>
                                <p className="text-gray-500 text-sm font-medium">{filtered.length} package{filtered.length !== 1 ? 's' : ''} found</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filtered.map((pkg, i) => <PackageCard key={pkg._id || pkg.slug} pkg={pkg} index={i} />)}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-2xl mb-2">No packages found</p>
                            <p className="text-sm">Try adjusting your filters or search term.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
