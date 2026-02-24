'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import TripPlannerModal from '@/components/TripPlannerModal';

export default function FloatingWhatsApp() {
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [plannerSession, setPlannerSession] = useState(0);

    const openPlanner = () => {
        setPlannerSession((prev) => prev + 1);
        setIsPlannerOpen(true);
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.45 }}
                    className="hidden sm:block absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl p-3 whitespace-nowrap text-sm font-semibold text-gray-700 border border-gray-100"
                >
                    Need help choosing your trip?
                    <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
                </motion.div>

                <motion.button
                    type="button"
                    onClick={openPlanner}
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, type: 'spring', stiffness: 220, damping: 18 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold w-14 h-14 sm:w-auto sm:h-auto px-0 py-0 sm:px-4 sm:py-3 shadow-2xl shadow-emerald-400/35 transition-colors duration-200"
                    aria-label="Open smart trip planner"
                >
                    <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-1.5 rounded-full border border-white/25"
                        animate={{ scale: [1, 1.02, 1], opacity: [0.22, 0.1, 0.22] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Can&apos;t Decide? Let Us Help</span>
                    <span className="sr-only sm:hidden">Can&apos;t Decide? Let Us Help</span>
                </motion.button>
            </div>

            <TripPlannerModal
                key={plannerSession}
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
            />
        </>
    );
}
