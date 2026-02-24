'use client';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTABanner() {
    return (
        <section className="py-20 bg-gradient-to-r from-emerald-800 via-emerald-700 to-ocean-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
                <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Sparkles className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">
                        Your Perfect Trip is Waiting
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                        Let our travel experts craft a personalized itinerary just for you. Free consultation, no commitments.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/packages" className="btn-white w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4">
                            Explore All Packages <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href="https://wa.me/9107088221122?text=Hi! I'd like a free travel consultation."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-white/40 hover:border-white/80 text-white font-semibold rounded-full transition-all duration-300"
                        >
                            Free Consultation
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
