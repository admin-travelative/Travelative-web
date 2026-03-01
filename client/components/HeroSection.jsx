'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';

const stats = [
    { end: 500, suffix: '+', decimals: 0, label: 'Happy Travelers' },
    { end: 27, suffix: '+', decimals: 0, label: 'Destinations' },
    { end: 4.4, suffix: '★', decimals: 1, label: 'Average Rating' },
    { end: 9, suffix: '+', decimals: 0, label: 'Years Experience' },
];

function AnimatedStatValue({ end, suffix = '', decimals = 0, duration = 3200 }) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let frameId;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 0.5 - Math.cos(Math.PI * progress) / 2;
            const nextValue = decimals > 0
                ? Number((end * eased).toFixed(decimals))
                : Math.round(end * eased);

            setValue((prev) => (prev === nextValue ? prev : nextValue));

            if (progress < 1) frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [end, decimals, duration]);

    return <>{value.toFixed(decimals)}{suffix}</>;
}

function WhatsAppIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

export default function HeroSection() {
    const WHATSAPP_NUMBER = '9107088221122';
    const WHATSAPP_MESSAGE = "Hi Travelative! I'm interested in your travel packages. Can you please help me?";

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <motion.div
                className="absolute inset-0 h-full w-full"
                initial={{ scale: 1 }}
                animate={{ scale: 1.12 }}
                transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
                aria-hidden="true"
            >
                <Image
                    src="/hero_image_travelative.avif"
                    alt="Luxury Travel Background"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                    style={{ willChange: 'transform' }}
                />
            </motion.div>
            {/* Dark Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            {/* Animated orange gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/30 via-transparent to-amber-900/20" />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pt-24 pb-10 sm:pt-28">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex justify-center mb-6"
                >
                    <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                        <span>India&apos;s #1 Premium Travel Agency</span>
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6"
                >
                    Don&apos;t just dream,{' '}
                    <span className="italic text-orange-300">Travelative.</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-base sm:text-lg md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
                >
                    Handcrafted luxury travel experiences — from Maldives honeymoons to Himalayan adventures.
                    Your dream trip is one click away.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
                >
                    <Link href="/packages" className="btn-primary w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 shadow-2xl shadow-orange-500/30">
                        Explore All Packages
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-white w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4"
                    >
                        <WhatsAppIcon className="w-5 h-5 text-orange-600" />
                        Chat on WhatsApp
                    </a>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                >
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4">
                            <div className="text-2xl md:text-3xl font-bold font-serif text-orange-300">
                                <AnimatedStatValue
                                    end={stat.end}
                                    suffix={stat.suffix}
                                    decimals={stat.decimals}
                                />
                            </div>
                            <div className="text-sm text-white/70 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

        </section>
    );
}

