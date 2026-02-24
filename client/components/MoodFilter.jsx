'use client';
import { motion } from 'framer-motion';
import { Mountain, Waves, Heart, Users } from 'lucide-react';

const moods = [
    { id: 'all', label: 'All Packages', icon: null, color: 'bg-gray-900 text-white' },
    { id: 'Adventure', label: 'Adventure', icon: Mountain, color: 'bg-orange-500 text-white', activeClass: 'bg-orange-500' },
    { id: 'Relax', label: 'Relax & Unwind', icon: Waves, color: 'bg-ocean-600 text-white', activeClass: 'bg-ocean-600' },
    { id: 'Honeymoon', label: 'Honeymoon', icon: Heart, color: 'bg-rose-500 text-white', activeClass: 'bg-rose-500' },
    { id: 'Family', label: 'Family Fun', icon: Users, color: 'bg-emerald-600 text-white', activeClass: 'bg-emerald-600' },
];

export default function MoodFilter({ activeFilter, onFilterChange }) {
    return (
        <div className="flex items-center sm:justify-center gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible scrollbar-hide py-1">
            {moods.map((mood) => {
                const Icon = mood.icon;
                const isActive = activeFilter === mood.id;
                return (
                    <motion.button
                        key={mood.id}
                        onClick={() => onFilterChange(mood.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 flex-shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 border-2 ${isActive
                                ? `${mood.color} border-transparent shadow-lg`
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        {mood.label}
                    </motion.button>
                );
            })}
        </div>
    );
}
