'use client';
import { motion } from 'framer-motion';
import { Award, Clock, HeadphonesIcon, Wallet, Map, Users } from 'lucide-react';

const features = [
    {
        icon: Award,
        title: 'Expert Curated Packages',
        description: 'Every package is handcrafted by our travel experts with years of on-ground experience.',
        color: 'bg-emerald-100 text-emerald-700',
    },
    {
        icon: HeadphonesIcon,
        title: '24/7 Support',
        description: 'Our dedicated support team is available round the clock before, during, and after your trip.',
        color: 'bg-ocean-100 text-ocean-700',
    },
    {
        icon: Wallet,
        title: 'Best Price Guarantee',
        description: 'We promise the best value for your money. Find it cheaper — we\'ll match it.',
        color: 'bg-purple-100 text-purple-700',
    },
    {
        icon: Map,
        title: 'Detailed Itineraries',
        description: 'Day-by-day planning so you know exactly what to expect — no surprises, only joy.',
        color: 'bg-orange-100 text-orange-700',
    },
    {
        icon: Users,
        title: 'Personalized Experience',
        description: 'Every trip tailored to your preferences — from dietary needs to activity levels.',
        color: 'bg-rose-100 text-rose-700',
    },
    {
        icon: Clock,
        title: 'Zero Hassle Booking',
        description: 'Book in minutes. We handle all visa, hotels, transfers, and logistics for you.',
        color: 'bg-teal-100 text-teal-700',
    },
];

export default function WhyChooseUs() {
    return (
        <section className="py-20 bg-white" id="why-us">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <span className="inline-block px-4 py-1.5 bg-ocean-100 text-ocean-700 text-sm font-bold rounded-full mb-4 tracking-wide uppercase">
                        Why Travelative?
                    </span>
                    <h2 className="section-title">
                        Travel Smarter,{' '}
                        <span className="text-gradient">Live Better</span>
                    </h2>
                    <p className="section-subtitle mx-auto">
                        We don't just book trips. We craft memories that last a lifetime.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">{f.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{f.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
