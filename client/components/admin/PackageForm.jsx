'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, X, Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function slugify(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

export default function PackageForm({ initialData = null, packageId = null }) {
    const router = useRouter();
    const isEdit = !!packageId;
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        price: initialData?.price || '',
        originalPrice: initialData?.originalPrice || '',
        duration: initialData?.duration || '',
        description: initialData?.description || '',
        shortDescription: initialData?.shortDescription || '',
        category: initialData?.category || 'Adventure',
        location: initialData?.location || '',
        country: initialData?.country || '',
        rating: initialData?.rating || 4.5,
        reviewCount: initialData?.reviewCount || 0,
        isFeatured: initialData?.isFeatured || false,
        isTrending: initialData?.isTrending || false,
        isLimitedSlots: initialData?.isLimitedSlots || false,
        slotsLeft: initialData?.slotsLeft || '',
        images: initialData?.images || [''],
        inclusions: initialData?.inclusions || [''],
        exclusions: initialData?.exclusions || [''],
        hotels: initialData?.hotels || [{ name: '', stars: 4, location: '', amenities: [''] }],
        itinerary: initialData?.itinerary || [{ day: 1, title: '', description: '', activities: [''] }],
    });

    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
    const setArr = (key, i, val) => { const arr = [...form[key]]; arr[i] = val; set(key, arr); };
    const addArr = (key, empty) => set(key, [...form[key], empty]);
    const removeArr = (key, i) => set(key, form[key].filter((_, idx) => idx !== i));

    const updateHotel = (i, field, val) => {
        const arr = form.hotels.map((h, idx) => idx === i ? { ...h, [field]: val } : h);
        set('hotels', arr);
    };
    const updateHotelAmenity = (hi, ai, val) => {
        const hotels = form.hotels.map((h, idx) => {
            if (idx !== hi) return h;
            const amenities = h.amenities.map((a, i) => i === ai ? val : a);
            return { ...h, amenities };
        });
        set('hotels', hotels);
    };

    const updateItinerary = (i, field, val) => {
        const arr = form.itinerary.map((d, idx) => idx === i ? { ...d, [field]: val } : d);
        set('itinerary', arr);
    };
    const updateActivity = (di, ai, val) => {
        const itinerary = form.itinerary.map((d, i) => {
            if (i !== di) return d;
            const activities = d.activities.map((a, j) => j === ai ? val : a);
            return { ...d, activities };
        });
        set('itinerary', itinerary);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const payload = {
                ...form,
                slug: form.slug || slugify(form.title),
                price: Number(form.price),
                originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
                slotsLeft: form.slotsLeft ? Number(form.slotsLeft) : undefined,
                images: form.images.filter(Boolean),
                inclusions: form.inclusions.filter(Boolean),
                exclusions: form.exclusions.filter(Boolean),
                hotels: form.hotels.map((h) => ({ ...h, stars: Number(h.stars), amenities: h.amenities.filter(Boolean) })),
                itinerary: form.itinerary.map((d, i) => ({ ...d, day: i + 1, activities: d.activities.filter(Boolean) })),
            };
            const url = isEdit ? `${API_URL}/api/admin/packages/${packageId}` : `${API_URL}/api/admin/packages`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || d.message); }
            router.push('/admin/packages');
        } catch (err) {
            setError(err.message || 'Failed to save package. Please check all required fields.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/packages" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">{isEdit ? 'Edit Package' : 'New Package'}</h1>
                    <p className="text-gray-500 text-sm">{isEdit ? 'Update package details' : 'Create a new travel package'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="admin-card space-y-5">
                    <h2 className="font-bold text-gray-900 text-lg">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="form-label">Package Title *</label>
                            <input value={form.title} onChange={(e) => { set('title', e.target.value); set('slug', slugify(e.target.value)); }} required placeholder="e.g. Maldives Luxury Escape" className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Slug (URL)</label>
                            <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="maldives-luxury-escape" className="form-input font-mono text-sm" />
                        </div>
                        <div>
                            <label className="form-label">Category *</label>
                            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="form-input">
                                {['Adventure', 'Relax', 'Honeymoon', 'Family'].map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Price (₹) *</label>
                            <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required placeholder="45000" className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Original Price (₹) – for discount</label>
                            <input type="number" value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} placeholder="55000" className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Duration *</label>
                            <input value={form.duration} onChange={(e) => set('duration', e.target.value)} required placeholder="7 Days / 6 Nights" className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Location</label>
                            <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Bali" className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Country</label>
                            <input value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Indonesia" className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Rating</label>
                            <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)} className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Review Count</label>
                            <input type="number" value={form.reviewCount} onChange={(e) => set('reviewCount', e.target.value)} className="form-input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label">Short Description</label>
                            <input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} placeholder="One-line summary for cards..." className="form-input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label">Full Description *</label>
                            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} required rows={4} placeholder="Detailed package description..." className="form-input resize-none" />
                        </div>
                    </div>

                    {/* Badges/Toggles */}
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
                        {[
                            { key: 'isFeatured', label: '⭐ Featured on Homepage', color: 'yellow' },
                            { key: 'isTrending', label: '🔥 Trending Badge', color: 'orange' },
                            { key: 'isLimitedSlots', label: '🚨 Limited Slots Badge', color: 'red' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                                <span className="text-sm font-semibold text-gray-700">{label}</span>
                            </label>
                        ))}
                        {form.isLimitedSlots && (
                            <div>
                                <input type="number" value={form.slotsLeft} onChange={(e) => set('slotsLeft', e.target.value)} placeholder="Slots remaining" className="form-input py-2 text-sm w-44" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Images */}
                <div className="admin-card space-y-3">
                    <h2 className="font-bold text-gray-900 text-lg">Images</h2>
                    <p className="text-sm text-gray-500">Add image URLs (Unsplash, Cloudinary, etc.). First image is the cover.</p>
                    {form.images.map((img, i) => (
                        <div key={i} className="flex gap-2">
                            <input value={img} onChange={(e) => setArr('images', i, e.target.value)} placeholder={`Image ${i + 1} URL`} className="form-input flex-1 text-sm" />
                            <button type="button" onClick={() => removeArr('images', i)} disabled={form.images.length === 1} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-30">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addArr('images', '')} className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold hover:text-emerald-800">
                        <Plus className="w-4 h-4" /> Add Image
                    </button>
                </div>

                {/* Itinerary */}
                <div className="admin-card space-y-4">
                    <h2 className="font-bold text-gray-900 text-lg">Itinerary (Day-by-Day)</h2>
                    {form.itinerary.map((day, di) => (
                        <div key={di} className="border border-gray-200 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    D{di + 1}
                                </div>
                                <input value={day.title} onChange={(e) => updateItinerary(di, 'title', e.target.value)} placeholder="Day title" className="form-input flex-1 text-sm" />
                                <button type="button" onClick={() => removeArr('itinerary', di)} disabled={form.itinerary.length === 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <textarea value={day.description} onChange={(e) => updateItinerary(di, 'description', e.target.value)} rows={2} placeholder="Day description..." className="form-input text-sm resize-none" />
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Activities</label>
                                {day.activities.map((act, ai) => (
                                    <div key={ai} className="flex gap-2">
                                        <input value={act} onChange={(e) => updateActivity(di, ai, e.target.value)} placeholder="Activity" className="form-input flex-1 text-sm py-2" />
                                        <button type="button" onClick={() => {
                                            const itinerary = form.itinerary.map((d, i) => i === di ? { ...d, activities: d.activities.filter((_, j) => j !== ai) } : d);
                                            set('itinerary', itinerary);
                                        }} disabled={day.activities.length === 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => {
                                    const itinerary = form.itinerary.map((d, i) => i === di ? { ...d, activities: [...d.activities, ''] } : d);
                                    set('itinerary', itinerary);
                                }} className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-800">
                                    <Plus className="w-3 h-3" /> Add Activity
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => addArr('itinerary', { day: form.itinerary.length + 1, title: '', description: '', activities: [''] })}
                        className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold hover:text-emerald-800">
                        <Plus className="w-4 h-4" /> Add Day
                    </button>
                </div>

                {/* Hotels */}
                <div className="admin-card space-y-4">
                    <h2 className="font-bold text-gray-900 text-lg">Hotels</h2>
                    {form.hotels.map((hotel, hi) => (
                        <div key={hi} className="border border-gray-200 rounded-2xl p-4 space-y-3">
                            <div className="flex gap-2 items-center">
                                <input value={hotel.name} onChange={(e) => updateHotel(hi, 'name', e.target.value)} placeholder="Hotel name" className="form-input flex-1 text-sm" />
                                <select value={hotel.stars} onChange={(e) => updateHotel(hi, 'stars', e.target.value)} className="form-input w-28 text-sm">
                                    {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} ⭐</option>)}
                                </select>
                                <button type="button" onClick={() => removeArr('hotels', hi)} disabled={form.hotels.length === 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <input value={hotel.location} onChange={(e) => updateHotel(hi, 'location', e.target.value)} placeholder="Location (e.g. Ubud, Bali)" className="form-input text-sm" />
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Amenities</label>
                                {hotel.amenities.map((a, ai) => (
                                    <div key={ai} className="flex gap-2">
                                        <input value={a} onChange={(e) => updateHotelAmenity(hi, ai, e.target.value)} placeholder="e.g. Infinity Pool" className="form-input flex-1 text-sm py-2" />
                                        <button type="button" onClick={() => {
                                            const hotels = form.hotels.map((h, i) => i === hi ? { ...h, amenities: h.amenities.filter((_, j) => j !== ai) } : h);
                                            set('hotels', hotels);
                                        }} disabled={hotel.amenities.length === 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => {
                                    const hotels = form.hotels.map((h, i) => i === hi ? { ...h, amenities: [...h.amenities, ''] } : h);
                                    set('hotels', hotels);
                                }} className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-800">
                                    <Plus className="w-3 h-3" /> Add Amenity
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => addArr('hotels', { name: '', stars: 4, location: '', amenities: [''] })}
                        className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold hover:text-emerald-800">
                        <Plus className="w-4 h-4" /> Add Hotel
                    </button>
                </div>

                {/* Inclusions & Exclusions */}
                <div className="grid md:grid-cols-2 gap-6">
                    {[{ key: 'inclusions', label: '✅ What\'s Included', placeholder: 'e.g. Return flights' },
                    { key: 'exclusions', label: '❌ What\'s Excluded', placeholder: 'e.g. Personal expenses' }
                    ].map(({ key, label, placeholder }) => (
                        <div key={key} className="admin-card space-y-3">
                            <h2 className="font-bold text-gray-900">{label}</h2>
                            {form[key].map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={item} onChange={(e) => setArr(key, i, e.target.value)} placeholder={placeholder} className="form-input flex-1 text-sm py-2" />
                                    <button type="button" onClick={() => removeArr(key, i)} disabled={form[key].length === 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addArr(key, '')} className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold hover:text-emerald-800">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                    ))}
                </div>

                {/* Submit */}
                {error && <p className="text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">⚠️ {error}</p>}
                <div className="flex items-center gap-4 pb-8">
                    <button type="submit" disabled={saving} className="btn-primary px-8 py-3.5 text-base">
                        {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> {isEdit ? 'Update Package' : 'Create Package'}</>}
                    </button>
                    <Link href="/admin/packages" className="btn-outline py-3.5 px-6">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
