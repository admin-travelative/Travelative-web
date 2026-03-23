'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, TrendingUp, AlertCircle, ArrowRight, Cloud, CloudRain, Snowflake, Sun, Wind } from 'lucide-react';
import { getCachedWeather } from '@/lib/weather';

function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

function getDisplayVibe(pkg) {
    const tags = Array.isArray(pkg?.tags) ? pkg.tags.map((tag) => String(tag).toLowerCase()) : [];
    const category = String(pkg?.category || '').toLowerCase();

    if (tags.includes('snowfall') || tags.includes('snow') || tags.includes('winter')) return 'Snow Escape';
    if (tags.includes('beaches') || tags.includes('beach') || tags.includes('island')) return 'Island Escape';
    if (tags.includes('heritage') || tags.includes('culture') || tags.includes('history')) return 'Cultural Journey';
    if (tags.includes('wildlife') || tags.includes('nature') || tags.includes('mountains')) return 'Nature Escape';
    if (tags.includes('adventure') || category === 'adventure') return 'Adventure Vibe';
    if (tags.includes('luxury') || tags.includes('relax') || category === 'relax') return 'Premium Getaway';
    if (category === 'honeymoon') return 'Romantic Escape';
    if (category === 'family') return 'Scenic Escape';
    return 'Travel Vibe';
}

export default function PackageCard({ pkg, index = 0 }) {
    const [weatherState, setWeatherState] = useState(null);

    const image = pkg.images?.[0] || '';
    const discount = pkg.originalPrice ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100) : null;
    const displayVibe = getDisplayVibe(pkg);
    const hasLocation = Boolean(pkg?.location || pkg?.country);
    const locationKey = `${pkg?.location || ''}|${pkg?.country || ''}`;

    useEffect(() => {
        let mounted = true;

        if (!hasLocation) {
            return () => {
                mounted = false;
            };
        }

        getCachedWeather(pkg.location, pkg.country)
            .then((data) => {
                if (!mounted) return;
                setWeatherState({ key: locationKey, data: data || null });
            });

        return () => {
            mounted = false;
        };
    }, [hasLocation, locationKey, pkg?.location, pkg?.country]);

    const weather = weatherState?.key === locationKey ? weatherState.data : null;
    const weatherLoading = hasLocation && weatherState?.key !== locationKey;

    const WeatherIcon = weather?.icon === 'sunny'
        ? Sun
        : weather?.icon === 'windy'
            ? Wind
            : weather?.icon === 'snowy'
                ? Snowflake
                : weather?.icon === 'rainy'
                    ? CloudRain
                    : Cloud;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
        >
            <Link href={`/packages/${pkg.slug}`} className="group block card">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden bg-emerald-50 flex items-center justify-center">
                    {image ? (
                        <Image
                            src={image}
                            alt={pkg.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-emerald-200">
                            <MapPin className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm font-semibold opacity-70">No Image provided</span>
                        </div>
                    )}
                    {/* Gradient overlay */}
                    {image && <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {pkg.isTrending && (
                            <span className="badge-trending shadow-md">
                                <TrendingUp className="w-3 h-3" /> Trending
                            </span>
                        )}
                        {pkg.isLimitedSlots && (
                            <span className="badge-limited shadow-md">
                                <AlertCircle className="w-3 h-3" />
                                {pkg.slotsLeft ? `Only ${pkg.slotsLeft} slots left!` : 'Limited Slots'}
                            </span>
                        )}
                    </div>

                    {/* Discount badge */}
                    {discount && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            {discount}% OFF
                        </div>
                    )}

                    {/* Category tag */}
                    <div className="absolute bottom-3 right-3">
                        <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            {displayVibe}
                        </span>
                    </div>

                    {/* Weather badge */}
                    <div className="absolute bottom-3 left-3">
                        {weather ? (
                            <span className="inline-flex items-center gap-1.5 bg-black/55 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 shadow-sm">
                                <span className="relative inline-flex w-2.5 h-2.5">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 animate-pulse" />
                                </span>
                                <WeatherIcon className="w-3.5 h-3.5" />
                                <span>
                                    {weather.condition}
                                    {Number.isFinite(weather.temperature) ? ` ${weather.temperature}\u00B0C` : ''}
                                </span>
                            </span>
                        ) : weatherLoading ? (
                            <span className="inline-flex items-center gap-1.5 bg-black/45 text-white/80 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-sm">
                                <Cloud className="w-3.5 h-3.5 animate-pulse" />
                                <span>Weather...</span>
                            </span>
                        ) : null}
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
