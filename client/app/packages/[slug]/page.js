'use client';
import React, { useState, useEffect, useRef } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, CheckCircle, XCircle, Hotel, Calendar, Users, ArrowLeft, TrendingUp, AlertCircle, Cloud, CloudRain, Snowflake, Sun, Wind, Loader2, Share2 } from 'lucide-react';
import Link from 'next/link';
import InquiryForm from '@/components/InquiryForm';
import { getCachedWeather } from '@/lib/weather';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

function getImageTags(pkg) {
    const tags = Array.isArray(pkg?.tags) ? pkg.tags : [];
    const blocked = new Set(['domestic', 'international', 'family', 'couple', 'solo', 'friends']);
    return tags
        .filter((tag) => !blocked.has(String(tag).toLowerCase()))
        .slice(0, 2)
        .map((tag) => String(tag).replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
}

export default function PackageDetailPage({ params }) {
    const { slug } = React.use(params);
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [showForm, setShowForm] = useState(false);
    const [weatherState, setWeatherState] = useState(null);
    const [shareStatus, setShareStatus] = useState('');
    const shareStatusTimeoutRef = useRef(null);

    useEffect(() => {
        fetch(`${API_URL}/api/packages/${slug}`)
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then(setPkg)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        if (!pkg?.location && !pkg?.country) return;

        let mounted = true;
        const locationKey = `${pkg.location || ''}|${pkg.country || ''}`;
        getCachedWeather(pkg.location, pkg.country)
            .then((data) => {
                if (!mounted) return;
                setWeatherState({ key: locationKey, data: data || null });
            });

        return () => {
            mounted = false;
        };
    }, [pkg?.location, pkg?.country]);

    useEffect(() => () => {
        if (shareStatusTimeoutRef.current) clearTimeout(shareStatusTimeoutRef.current);
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent" />
        </div>
    );
    if (error || !pkg) return notFound();

    const discount = pkg.originalPrice ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100) : null;
    const locationKey = `${pkg?.location || ''}|${pkg?.country || ''}`;
    const weather = weatherState?.key === locationKey ? weatherState.data : null;
    const weatherLoading = Boolean(pkg?.location || pkg?.country) && weatherState?.key !== locationKey;
    const displayVibe = getDisplayVibe(pkg);
    const imageTags = getImageTags(pkg);
    const WeatherIcon = weather?.icon === 'snowy'
        ? Snowflake
        : weather?.icon === 'rainy'
            ? CloudRain
            : weather?.icon === 'windy'
                ? Wind
                : weather?.icon === 'sunny'
                    ? Sun
                    : Cloud;

    const handleSharePackage = async () => {
        if (typeof window === 'undefined') return;

        const packageUrl = window.location.href;
        const shareData = {
            title: pkg.title,
            text: `Check out this package: ${pkg.title} - ${formatPrice(pkg.price)} per person`,
            url: packageUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (error) {
                if (error?.name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(packageUrl);
            setShareStatus('Link copied');
            if (shareStatusTimeoutRef.current) clearTimeout(shareStatusTimeoutRef.current);
            shareStatusTimeoutRef.current = setTimeout(() => setShareStatus(''), 1800);
        } catch {
            setShareStatus('Unable to share right now');
            if (shareStatusTimeoutRef.current) clearTimeout(shareStatusTimeoutRef.current);
            shareStatusTimeoutRef.current = setTimeout(() => setShareStatus(''), 1800);
        }
    };

    return (
        <>
            <div className="pt-20 bg-gray-50 min-h-screen">
                {/* Back Button */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <Link href="/packages" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-700 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Packages
                    </Link>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* LEFT COLUMN - Main content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Image Gallery */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                <div className="relative h-64 sm:h-80 md:h-[460px] rounded-3xl overflow-hidden shadow-xl">
                                    <img
                                        src={pkg.images?.[activeImage] || pkg.images?.[0]}
                                        alt={pkg.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            {pkg.isTrending && <span className="badge-trending"><TrendingUp className="w-3 h-3" /> Trending</span>}
                                            {pkg.isLimitedSlots && <span className="badge-limited"><AlertCircle className="w-3 h-3" />{pkg.slotsLeft ? `Only ${pkg.slotsLeft} slots!` : 'Limited Slots'}</span>}
                                        </div>
                                        {imageTags.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {imageTags.map((tag) => (
                                                    <span key={tag} className="bg-white/90 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                    {discount && (
                                        <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">{discount}% OFF</div>
                                    )}
                                    <div className="absolute bottom-4 left-4">
                                        {weather ? (
                                            <span className="inline-flex items-center gap-1.5 bg-black/55 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                                                <span className="relative inline-flex w-2.5 h-2.5">
                                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                                                </span>
                                                <WeatherIcon className="w-3.5 h-3.5" />
                                                <span>{weather.condition}{weather.temperature != null ? ` ${weather.temperature}\u00B0C` : ''}</span>
                                            </span>
                                        ) : weatherLoading ? (
                                            <span className="inline-flex items-center gap-1.5 bg-black/45 text-white/80 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Weather...</span>
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="absolute bottom-4 right-4">
                                        <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                                            {displayVibe}
                                        </span>
                                    </div>
                                </div>
                                {pkg.images?.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                                        {pkg.images.map((img, i) => (
                                            <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-emerald-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                                                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* Title + Meta */}
                            <div>
                                <div className="flex flex-wrap items-center gap-2 text-gray-500 text-sm mb-2">
                                    <MapPin className="w-4 h-4" /> {pkg.location}, {pkg.country}
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">{pkg.category}</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">{pkg.title}</h1>
                                <div className="flex flex-wrap items-center gap-5 mb-5">
                                    <div className="flex items-center gap-1.5 text-gray-600"><Clock className="w-4 h-4" /><span className="font-medium">{pkg.duration}</span></div>
                                    <div className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="font-bold">{pkg.rating}</span><span className="text-gray-400">({pkg.reviewCount} reviews)</span></div>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-lg">{pkg.description}</p>
                            </div>

                            {/* Tabs */}
                            <div>
                                <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                                    {['itinerary', 'hotels', 'inclusions'].map((tab) => (
                                        <button key={tab} onClick={() => setActiveTab(tab)}
                                            className={`px-4 sm:px-5 py-3 font-semibold text-xs sm:text-sm whitespace-nowrap capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                                            {tab === 'inclusions' ? 'Inclusions & Exclusions' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Itinerary Tab */}
                                {activeTab === 'itinerary' && (
                                    <div className="space-y-4">
                                        {pkg.itinerary?.map((day, i) => (
                                            <motion.div key={day.day} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all">
                                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">D{day.day}</div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 mb-1">{day.title}</h3>
                                                    <p className="text-gray-500 text-sm leading-relaxed mb-3">{day.description}</p>
                                                    {day.activities?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {day.activities.map((a, j) => (
                                                                <span key={j} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">{a}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Hotels Tab */}
                                {activeTab === 'hotels' && (
                                    <div className="space-y-4">
                                        {pkg.hotels?.map((hotel, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                                className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                                                <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Hotel className="w-6 h-6 text-ocean-700" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                                                        <div className="flex">{[...Array(hotel.stars || 4)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}</div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-2"><MapPin className="w-3.5 h-3.5" />{hotel.location}</div>
                                                    {hotel.amenities?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {hotel.amenities.map((a, j) => <span key={j} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{a}</span>)}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Inclusions Tab */}
                                {activeTab === 'inclusions' && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-600" /> Included</h3>
                                            <ul className="space-y-2.5">
                                                {pkg.inclusions?.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-400" /> Excluded</h3>
                                            <ul className="space-y-2.5">
                                                {pkg.exclusions?.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                                                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />{item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Booking Card */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24">
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-5">
                                        <div className="flex items-baseline gap-3 mb-1">
                                            <span className="text-3xl font-bold text-white">{formatPrice(pkg.price)}</span>
                                            {pkg.originalPrice && <span className="text-emerald-200 line-through text-lg">{formatPrice(pkg.originalPrice)}</span>}
                                        </div>
                                        <p className="text-emerald-100 text-sm">per person | {pkg.duration}</p>
                                        {discount && <div className="mt-2 inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Save {discount}%</div>}
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <button onClick={() => setShowForm(true)} className="btn-primary w-full justify-center py-3.5 text-base">
                                            Book Now – {formatPrice(pkg.price)}
                                        </button>
                                        <a
                                            href={`https://wa.me/9107088221122?text=${encodeURIComponent(`Hi! I'm interested in the ${pkg.title} package (${pkg.duration}) at ${formatPrice(pkg.price)}/person. Please share more details.`)}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 hover:border-green-400 rounded-xl font-semibold text-gray-700 hover:text-green-600 transition-all text-sm"
                                        >
                                            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                            Ask on WhatsApp
                                        </a>
                                        <button
                                            type="button"
                                            onClick={handleSharePackage}
                                            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 hover:border-emerald-400 rounded-xl font-semibold text-gray-700 hover:text-emerald-700 transition-all text-sm"
                                        >
                                            <Share2 className="w-5 h-5 text-emerald-600" />
                                            {shareStatus || 'Share with Friends & Family'}
                                        </button>
                                        <div className="space-y-2.5 pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar className="w-4 h-4 text-emerald-500" />{pkg.duration}</div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500"><Users className="w-4 h-4 text-emerald-500" />Group &amp; Private available</div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500"><Star className="w-4 h-4 text-emerald-500" />Rated {pkg.rating}/5 ({pkg.reviewCount} reviews)</div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                {weatherLoading ? <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" /> : <WeatherIcon className="w-4 h-4 text-emerald-500" />}
                                                {weatherLoading
                                                    ? 'Checking live weather...'
                                                    : weather
                                                        ? `${weather.condition}${weather.temperature != null ? ` - ${weather.temperature}\u00B0C` : ''}`
                                                        : 'Live weather unavailable right now.'}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <InquiryForm isOpen={showForm} onClose={() => setShowForm(false)} defaultPackage={pkg.title} />
        </>
    );
}
