'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PackageCard from './PackageCard';
import MoodFilter from './MoodFilter';

export default function PackagesGrid({ packages }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [destinationType, setDestinationType] = useState('all'); // all, domestic, international

    // Filter by Destination Type then by Mood Category
    let filtered = [...packages];

    if (destinationType === 'domestic') {
        filtered = filtered.filter((p) => p.country?.toLowerCase() === 'india');
    } else if (destinationType === 'international') {
        filtered = filtered.filter((p) => p.country?.toLowerCase() !== 'india');
    }

    if (activeFilter !== 'all') {
        filtered = filtered.filter((p) => p.category === activeFilter);
    }

    return (
        <section className="py-20 bg-gray-50" id="packages">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full mb-4 tracking-wide uppercase">
                        Our Packages
                    </span>
                    <h2 className="section-title">
                        Find Your Perfect <span className="text-gradient">Escape</span>
                    </h2>
                    <p className="section-subtitle mx-auto">
                        Handpicked destinations and meticulously planned itineraries for every kind of traveler.
                    </p>
                </motion.div>

                {/* Domestic / International Filter & Mood Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mb-10"
                >
                    {/* Destination Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex bg-white shadow-sm border border-gray-100 p-1.5 rounded-full">
                            {['all', 'domestic', 'international'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setDestinationType(type)}
                                    className={`relative px-6 py-2.5 text-sm font-bold rounded-full transition-colors ${destinationType === type ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {destinationType === type && (
                                        <motion.div
                                            layoutId="homeDestTypeTab"
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

                    {/* Mood Filter */}
                    <MoodFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </motion.div>

                {/* Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filtered.length > 0 ? (
                            filtered.map((pkg, i) => (
                                <PackageCard key={pkg._id || pkg.slug} pkg={pkg} index={i} />
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-16 text-gray-400">
                                <p className="text-xl">No packages found for this category.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
