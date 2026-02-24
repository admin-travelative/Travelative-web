'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

export default function PackageCard({ pkg, index = 0 }) {
    const image = pkg.images?.[0] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800';
    const discount = pkg.originalPrice ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link href={`/packages/${pkg.slug}`} className="group block card">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                    <img
                        src={image}
                        alt={pkg.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {pkg.isTrending && (
                            <span className="badge-trending">
                                <TrendingUp className="w-3 h-3" /> Trending
                            </span>
                        )}
                        {pkg.isLimitedSlots && (
                            <span className="badge-limited">
                                <AlertCircle className="w-3 h-3" />
                                {pkg.slotsLeft ? `Only ${pkg.slotsLeft} slots left!` : 'Limited Slots'}
                            </span>
                        )}
                    </div>

                    {/* Discount badge */}
                    {discount && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {discount}% OFF
                        </div>
                    )}

                    {/* Category tag */}
                    <div className="absolute bottom-3 right-3">
                        <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                            {pkg.category}
                        </span>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                    {/* Location */}
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{pkg.location}, {pkg.country}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200 mb-2 leading-tight">
                        {pkg.title}
                    </h3>

                    {/* Short description */}
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {pkg.shortDescription || pkg.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{pkg.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-yellow-600">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{pkg.rating}</span>
                            <span className="text-gray-400">({pkg.reviewCount})</span>
                        </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-emerald-700">{formatPrice(pkg.price)}</span>
                                {pkg.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through">{formatPrice(pkg.originalPrice)}</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400">per person</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-600 group-hover:bg-emerald-700 text-white px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200">
                            Book Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
