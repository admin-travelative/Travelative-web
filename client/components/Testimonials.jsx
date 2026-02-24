'use client';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'Priya & Arjun Sharma',
        location: 'Mumbai',
        trip: 'Maldives Luxury Escape',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        rating: 5,
        text: 'Our honeymoon was absolutely magical! Travelative took care of every single detail — from the seaplane to the private beach dinner. We didn\'t have to worry about a thing. 100% recommend!',
    },
    {
        name: 'Rohan Mehta',
        location: 'Delhi',
        trip: 'Bali Adventure & Temples',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 5,
        text: 'The Mount Batur sunrise trek was life-changing! Our guide was excellent and the entire itinerary was perfectly timed. Travelative\'s attention to detail is unmatched. Already planning our next trip!',
    },
    {
        name: 'The Kapoor Family',
        location: 'Bangalore',
        trip: 'Swiss Alps Family Adventure',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 5,
        text: 'Traveling with kids can be stressful, but Travelative made it effortless. The Swiss Travel Pass was a game-changer and Jungfraujoch was an experience our children will never forget!',
    },
    {
        name: 'Sneha Iyer',
        location: 'Chennai',
        trip: 'Kerala Backwaters Retreat',
        avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100',
        rating: 5,
        text: 'The houseboat experience was absolutely serene. Waking up to the sounds of birds and water, eating freshly made Kerala meals — it was everything I needed to recharge! Simply perfect.',
    },
];

export default function Testimonials() {
    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id="reviews">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-full mb-4 tracking-wide uppercase">
                        Traveler Love
                    </span>
                    <h2 className="section-title">
                        Real Stories,{' '}
                        <span className="text-gradient">Real Joy</span>
                    </h2>
                    <p className="section-subtitle mx-auto">
                        Don't take our word for it — hear from our happy travelers.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-7 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative"
                        >
                            {/* Quote icon */}
                            <Quote className="absolute top-6 right-6 w-10 h-10 text-emerald-100" />

                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.rating)].map((_, j) => (
                                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Review text */}
                            <p className="text-gray-600 leading-relaxed mb-6 text-base italic">"{t.text}"</p>

                            {/* Trip badge */}
                            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-5">
                                ✈️ {t.trip}
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <img
                                    src={t.avatar}
                                    alt={t.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-200"
                                />
                                <div>
                                    <div className="font-bold text-gray-900">{t.name}</div>
                                    <div className="text-sm text-gray-400">{t.location}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
