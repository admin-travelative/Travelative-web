'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    BellRing,
    Clock3,
    Cloud,
    CloudRain,
    IndianRupee,
    Loader2,
    MapPin,
    Share2,
    Snowflake,
    Sparkles,
    Wind,
    X,
} from 'lucide-react';
import { recommendPackages } from '@/lib/recommendPackages';
import { getCachedWeather } from '@/lib/weather';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const WHATSAPP_NUMBER = '91XXXXXXXXXX';
const HUGE_NUMBER = Number.MAX_SAFE_INTEGER;
const DURATION_RANGES = {
    short: { min: 1, max: 3 },
    week: { min: 4, max: 7 },
    ten_days: { min: 8, max: 10 },
    long: { min: 10, max: 60 },
};

let packagesCache = null;

const INITIAL_ANSWERS = {
    travelerType: '',
    vibe: '',
    destination: '',
    availability: '',
    budget: '',
};

const BASE_STEPS = [
    { key: 'travelerType', title: 'Who are you traveling with?', options: ['couple', 'family', 'solo', 'friends'] },
    { key: 'vibe', title: 'What kind of trip vibe do you want?', options: ['mountains', 'beaches', 'snowfall', 'heritage', 'wildlife', 'adventure'] },
    { key: 'destination', title: 'India or Abroad?', options: ['india', 'abroad'] },
    { key: 'availability', title: 'How many days are you available?', options: ['short', 'week', 'ten_days', 'long'] },
];

function formatLabel(value) {
    return String(value).replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

function parseDurationDays(pkg) {
    const direct = Number(pkg?.durationDays);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const text = String(pkg?.duration || '');
    const dayMatch = text.match(/(\d+)\s*day/i);
    if (dayMatch) return Number(dayMatch[1]);
    const numberMatch = text.match(/(\d+)/);
    return numberMatch ? Number(numberMatch[1]) : null;
}

function resolveBudgetRange(raw) {
    const [minRaw, maxRaw] = String(raw || '').split('-');
    const min = Number(minRaw);
    const max = Number(maxRaw);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min, max };
}

function buildBudgetOptions(packages) {
    const prices = (packages || [])
        .map((pkg) => Number(pkg?.price))
        .filter((price) => Number.isFinite(price) && price > 0)
        .sort((a, b) => a - b);
    const anchors = [5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000];
    if (prices.length === 0) return [{ value: `0-${HUGE_NUMBER}`, label: 'Any Budget' }];

    const maxPrice = prices[prices.length - 1];
    const options = [];
    let prev = 0;
    anchors.forEach((anchor, idx) => {
        if (anchor > maxPrice) return;
        const min = prev === 0 ? 0 : prev + 1;
        const hasAny = prices.some((price) => price >= min && price <= anchor);
        if (hasAny) {
            const label = idx === 0
                ? `Under INR ${anchor.toLocaleString('en-IN')}`
                : `INR ${min.toLocaleString('en-IN')} to INR ${anchor.toLocaleString('en-IN')}`;
            options.push({ value: `${min}-${anchor}`, label });
        }
        prev = anchor;
    });
    if (maxPrice > prev) options.push({ value: `${prev + 1}-${HUGE_NUMBER}`, label: `INR ${(prev + 1).toLocaleString('en-IN')}+` });
    return options.length > 0 ? options : [{ value: `0-${HUGE_NUMBER}`, label: 'Any Budget' }];
}

function luckyPick(packages, answers) {
    const budget = resolveBudgetRange(answers?.budget);
    const duration = DURATION_RANGES[answers?.availability];
    const pool = (packages || []).filter((pkg) => {
        const price = Number(pkg?.price);
        const days = parseDurationDays(pkg);
        const budgetOk = !budget || (price >= budget.min && price <= budget.max);
        const durationOk = !duration || (days && days >= duration.min && days <= duration.max);
        return budgetOk && durationOk;
    });
    const sorted = (pool.length > 0 ? pool : packages || []).slice().sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    if (sorted.length === 0) return null;
    const top = sorted.slice(0, Math.min(6, sorted.length));
    return top[Math.floor(Math.random() * top.length)];
}

export default function TripPlannerModal({ isOpen, onClose }) {
    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState(INITIAL_ANSWERS);
    const [packages, setPackages] = useState(() => packagesCache || []);
    const [data, setData] = useState({ results: [], isFallback: false, fallbackMessage: '' });
    const [weatherBySlug, setWeatherBySlug] = useState({});
    const [lucky, setLucky] = useState(null);
    const [revealing, setRevealing] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [activeAlert, setActiveAlert] = useState('');
    const [drafts, setDrafts] = useState({});
    const [alertStatus, setAlertStatus] = useState({});
    const [alertLoading, setAlertLoading] = useState('');
    const [error, setError] = useState('');

    const budgetStep = useMemo(() => ({ key: 'budget', title: 'Budget per person?', options: buildBudgetOptions(packages), dynamic: true }), [packages]);
    const steps = useMemo(() => [...BASE_STEPS, budgetStep], [budgetStep]);
    const isResult = stepIndex >= steps.length;
    const current = steps[stepIndex];
    const selected = current ? answers[current.key] : '';
    const canContinue = Boolean(selected);
    const progress = Math.min(((stepIndex + 1) / (steps.length + 1)) * 100, 100);

    const recs = useMemo(() => (data.results || []).filter((pkg) => pkg?.slug).slice(0, 3), [data]);

    useEffect(() => {
        if (!isOpen || packages.length > 0) return;
        fetch(`${API_URL}/api/packages`)
            .then((r) => (r.ok ? r.json() : []))
            .then((list) => {
                const next = Array.isArray(list) ? list : [];
                packagesCache = next;
                setPackages(next);
            })
            .catch(() => setError('Could not load packages right now. Please try again.'));
    }, [isOpen, packages.length]);

    useEffect(() => {
        if (!revealing) return;
        const t = setTimeout(() => setRevealed(true), 700);
        return () => clearTimeout(t);
    }, [revealing]);

    useEffect(() => {
        const pending = recs.filter((pkg) => weatherBySlug[pkg.slug] === undefined);
        if (pending.length === 0) return;
        pending.forEach((pkg) => {
            getCachedWeather(pkg.location, pkg.country).then((weather) => {
                setWeatherBySlug((prev) => {
                    if (prev[pkg.slug] !== undefined) return prev;
                    if (!weather) {
                        return {
                            ...prev,
                            [pkg.slug]: { text: 'Live weather unavailable right now.', snow: false, icon: 'cloudy' },
                        };
                    }
                    return {
                        ...prev,
                        [pkg.slug]: {
                            text: weather.temperature != null
                                ? `${weather.condition} - ${weather.temperature}\u00B0C`
                                : weather.condition,
                            snow: weather.icon === 'snowy',
                            icon: weather.icon,
                        },
                    };
                });
            });
        });
    }, [recs, weatherBySlug]);

    const shareLink = useMemo(() => {
        if (recs.length === 0) return '#';
        const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const lines = ['Please review this Travelative shortlist:', '', ...recs.map((pkg, i) => `${i + 1}. ${pkg.title} - ${formatPrice(pkg.price)} - ${base}/packages/${pkg.slug}`)];
        return `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
    }, [recs]);

    const submitAlert = async (pkg) => {
        const draft = drafts[pkg.slug] || { email: '', phone: '' };
        if (!draft.email && !draft.phone) {
            setAlertStatus((prev) => ({ ...prev, [pkg.slug]: { type: 'error', text: 'Enter email or phone.' } }));
            return;
        }
        try {
            setAlertLoading(pkg.slug);
            const res = await fetch(`${API_URL}/api/alerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId: pkg._id, email: draft.email, phone: draft.phone, budgetSelection: answers.budget, answers }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Failed to enable alert.');
            setAlertStatus((prev) => ({ ...prev, [pkg.slug]: { type: 'success', text: json.message || 'Price alert enabled.' } }));
        } catch (e) {
            setAlertStatus((prev) => ({ ...prev, [pkg.slug]: { type: 'error', text: e.message || 'Failed to enable alert.' } }));
        } finally {
            setAlertLoading('');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
                    <motion.div initial={{ y: 16, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0 }} className="w-full max-w-3xl rounded-3xl overflow-hidden bg-white shadow-2xl">
                        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-ocean-700 px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                                <div><p className="text-emerald-100 text-xs font-semibold uppercase">Smart Trip Planner</p><h2 className="text-white text-2xl font-serif font-bold">Can&apos;t Decide? Let Us Help</h2></div>
                                <button type="button" onClick={onClose} className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="mt-4 h-1.5 rounded-full bg-white/20 overflow-hidden"><motion.div className="h-full bg-white" animate={{ width: `${progress}%` }} /></div>
                        </div>

                        <div className="px-6 py-6 max-h-[78vh] overflow-y-auto">
                            {error ? <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div> : null}
                            {!error && packages.length === 0 ? <div className="py-12 flex items-center justify-center gap-3 text-gray-600"><Loader2 className="w-5 h-5 animate-spin text-emerald-600" />Loading package inventory...</div> : null}

                            {!error && packages.length > 0 && !isResult ? (
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-gray-900">{current.title}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                                        {(current.dynamic ? current.options : current.options.map((v) => ({ value: v, label: formatLabel(v) }))).map((option) => {
                                            const active = selected === option.value;
                                            return (
                                                <button key={option.value} type="button" onClick={() => setAnswers((prev) => ({ ...prev, [current.key]: option.value }))} className={`text-left rounded-2xl border px-4 py-3.5 transition-all ${active ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'}`}>
                                                    <span className={`font-semibold ${active ? 'text-emerald-800' : 'text-gray-800'}`}>{option.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}

                            {!error && packages.length > 0 && isResult ? (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div><h3 className="text-2xl font-serif font-bold text-gray-900">Your Best Matches</h3><p className="text-gray-500 text-sm">Top 3 packages selected for your preferences.</p></div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => { const pick = luckyPick(packages, answers); if (pick) { setLucky(pick); setRevealing(false); setRevealed(false); } }} className="btn-primary text-sm px-4 py-2.5"><Sparkles className="w-4 h-4" />I&apos;m Feeling Lucky</button>
                                            {recs.length > 0 ? <a href={shareLink} target="_blank" rel="noopener noreferrer" className="btn-white text-sm px-4 py-2.5"><Share2 className="w-4 h-4" />Share this Shortlist</a> : null}
                                        </div>
                                    </div>

                                    {data.isFallback ? <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">{data.fallbackMessage}</div> : null}

                                    {lucky ? (
                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 relative overflow-hidden">
                                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Lucky Pick</p>
                                            <h4 className="text-lg font-bold text-gray-900 mt-1">{lucky.title}</h4>
                                            <p className="text-sm text-gray-600">{lucky.location}, {lucky.country} - {formatPrice(lucky.price)}</p>
                                            {!revealed ? (
                                                <motion.div initial={{ x: '0%' }} animate={{ x: revealing ? '100%' : '0%' }} transition={{ duration: 0.7, ease: 'easeInOut' }} className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
                                                    <button type="button" onClick={() => setRevealing(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-semibold">{revealing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{revealing ? 'Revealing...' : 'Reveal Destination'}</button>
                                                </motion.div>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    {recs.map((pkg) => {
                                        const weather = weatherBySlug[pkg.slug];
                                        const WeatherIcon = weather?.icon === 'snowy'
                                            ? Snowflake
                                            : weather?.icon === 'rainy'
                                                ? CloudRain
                                                : weather?.icon === 'windy'
                                                    ? Wind
                                                    : Cloud;
                                        const draft = drafts[pkg.slug] || { email: '', phone: '' };
                                        const status = alertStatus[pkg.slug];
                                        return (
                                            <div key={pkg._id || pkg.slug} className="rounded-2xl border border-gray-200 bg-white p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg">{pkg.title}</h4>
                                                        <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                                                            <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{pkg.location}, {pkg.country}</span>
                                                            <span className="inline-flex items-center gap-1"><Clock3 className="w-4 h-4" />{pkg.duration}</span>
                                                            <span className="inline-flex items-center gap-1"><IndianRupee className="w-4 h-4" />{formatPrice(pkg.price)}</span>
                                                        </div>
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold"><Sparkles className="w-3.5 h-3.5" />Match {Math.round(pkg.matchScore)}</span>
                                                </div>

                                                <div className="mt-3 text-sm">
                                                    {weather ? <span className="inline-flex items-center gap-2 text-ocean-700 bg-ocean-50 border border-ocean-100 rounded-full px-3 py-1.5"><WeatherIcon className="w-4 h-4" />{weather.text}</span> : <span className="inline-flex items-center gap-2 text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5"><Loader2 className="w-4 h-4 animate-spin" />Checking live weather...</span>}
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <Link href={`/packages/${pkg.slug}`} onClick={onClose} className="btn-primary text-sm px-4 py-2.5">Book Now<ArrowRight className="w-4 h-4" /></Link>
                                                    <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi Travelative! I would like details for ${pkg.title}.`)}`} target="_blank" rel="noopener noreferrer" className="btn-white text-sm px-4 py-2.5">Enquire on WhatsApp</a>
                                                    <button type="button" onClick={() => setActiveAlert((prev) => prev === pkg.slug ? '' : pkg.slug)} className="btn-outline text-sm px-4 py-2.5"><BellRing className="w-4 h-4" />Track Price for this Trip</button>
                                                </div>

                                                {activeAlert === pkg.slug ? (
                                                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                                                        <p className="text-xs text-gray-600 mb-2">Get notified when this package gets a new offer.</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <input value={draft.email} onChange={(e) => setDrafts((prev) => ({ ...prev, [pkg.slug]: { email: e.target.value, phone: prev[pkg.slug]?.phone || '' } }))} type="email" placeholder="Email address" className="form-input text-sm" />
                                                            <input value={draft.phone} onChange={(e) => setDrafts((prev) => ({ ...prev, [pkg.slug]: { email: prev[pkg.slug]?.email || '', phone: e.target.value } }))} type="text" placeholder="Phone number" className="form-input text-sm" />
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <button type="button" onClick={() => submitAlert(pkg)} disabled={alertLoading === pkg.slug} className="btn-primary text-xs px-3 py-2">{alertLoading === pkg.slug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}Enable Price Alerts</button>
                                                            {status ? <span className={`text-xs ${status.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>{status.text}</span> : null}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>

                        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                            <button type="button" onClick={() => (isResult ? setStepIndex(steps.length - 1) : stepIndex === 0 ? onClose() : setStepIndex((p) => p - 1))} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" />{stepIndex === 0 ? 'Close' : 'Back'}</button>
                            {isResult ? (
                                <button type="button" onClick={() => { setStepIndex(0); setAnswers(INITIAL_ANSWERS); setData({ results: [], isFallback: false, fallbackMessage: '' }); setLucky(null); setRevealed(false); setRevealing(false); setActiveAlert(''); setAlertStatus({}); }} className="btn-outline text-sm py-2.5 px-4">Start Again</button>
                            ) : (
                                <button type="button" onClick={() => { if (!canContinue) return; if (stepIndex === steps.length - 1) { setData(recommendPackages(packages, answers, 3)); setStepIndex(steps.length); } else { setStepIndex((p) => p + 1); } }} disabled={!canContinue} className="btn-primary text-sm py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed">Continue<ArrowRight className="w-4 h-4" /></button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
