'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Save, ArrowLeft, Wand2, Copy, Check } from 'lucide-react';
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

    // Autofill Modal State
    const [showAutoFill, setShowAutoFill] = useState(false);
    const [autoFillJson, setAutoFillJson] = useState('');
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [autoFillError, setAutoFillError] = useState('');

    const initNights = initialData?.duration ? (initialData.duration.match(/(\d+)\s*night/i)?.[1] || '') : '';
    const initDays = initialData?.durationDays || (initialData?.duration ? (initialData.duration.match(/(\d+)\s*day/i)?.[1] || '') : '');

    const [form, setForm] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        price: initialData?.price || '',
        originalPrice: initialData?.originalPrice || '',
        days: initDays,
        nights: initNights,
        description: initialData?.description || '',
        shortDescription: initialData?.shortDescription || '',
        category: initialData?.category || 'Adventure',
        tagsText: Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : '',
        travelerTypes: initialData?.travelerTypes || [],
        locationType: initialData?.locationType || '',
        location: initialData?.location || '',
        country: initialData?.country || '',
        durationDays: initialData?.durationDays || '',
        rating: initialData?.rating || 4.5,
        reviewCount: initialData?.reviewCount || 0,
        isFeatured: initialData?.isFeatured || false,
        isTrending: initialData?.isTrending || false,
        isLimitedSlots: initialData?.isLimitedSlots || false,
        slotsLeft: initialData?.slotsLeft || '',
        images: initialData?.images || [],
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setSaving(true);
            const res = await fetch(`${API_URL}/api/admin/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to upload image');
            const data = await res.json();

            // Append new image URL
            const newImages = form.images.filter(img => img !== ''); // remove any empty string placeholders
            set('images', [...newImages, data.url]);
        } catch (err) {
            setError(err.message || 'Image upload failed');
        } finally {
            setSaving(false);
            e.target.value = ''; // Reset input
        }
    };

    const aiPromptText = `Extract package details from the provided image and format them EXACTLY as a JSON object below. Follow these rules strictly:
1. ONLY fill fields explicitly mentioned or logically inferred from the image content. Do NOT make up info.
2. DO NOT include image URLs or fake data for images.
3. Only include 'price', 'days' (Number), and 'nights' (Number) if they are present on the card.
4. Set 'locationType' to exactly "domestic" (if in India) or "international".
5. Generate 'tags' (array) for SEO based on the image vibe.
6. Generate 'category' (choose exactly one: Adventure, Relax, Honeymoon, Family).
7. Generate a 'shortDescription' (1 line) and a 'description' (detailed, SEO friendly, based on the tour).
8. List 'travelerTypes' (array: subset of ["couple", "family", "solo", "friends"]) based on what the tour suits best.
9. Set 'rating' (e.g., 4.5).
10. Output ONLY valid JSON, no markdown blocks, no extra text.

JSON Format:
{
  "title": "String",
  "price": Number,
  "days": Number,
  "nights": Number,
  "locationType": "domestic",
  "location": "String (e.g. Haridwar, Kedarnath, Badrinath)",
  "country": "String",
  "category": "String",
  "tags": ["tag1", "tag2"],
  "travelerTypes": ["family", "couple"],
  "rating": 4.5,
  "shortDescription": "String",
  "description": "String"
}`;

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(aiPromptText);
            setCopiedPrompt(true);
            setTimeout(() => setCopiedPrompt(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const applyAutoFill = () => {
        try {
            setAutoFillError('');
            if (!autoFillJson.trim()) {
                setAutoFillError('Please paste the JSON first.');
                return;
            }

            // Handle markdown code blocks if AI wrapped it
            let cleanJson = autoFillJson.trim();
            if (cleanJson.startsWith('\`\`\`json')) cleanJson = cleanJson.substring(7);
            if (cleanJson.startsWith('\`\`\`')) cleanJson = cleanJson.substring(3);
            if (cleanJson.endsWith('\`\`\`')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);

            const parsed = JSON.parse(cleanJson.trim());

            setForm(prev => ({
                ...prev,
                title: parsed.title || prev.title,
                slug: parsed.title ? slugify(parsed.title) : prev.slug,
                price: parsed.price || prev.price,
                days: parsed.days || prev.days,
                nights: parsed.nights || prev.nights,
                locationType: parsed.locationType || prev.locationType,
                location: parsed.location || prev.location,
                country: parsed.country || prev.country,
                category: parsed.category || prev.category,
                tagsText: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : prev.tagsText,
                travelerTypes: Array.isArray(parsed.travelerTypes) ? parsed.travelerTypes : prev.travelerTypes,
                rating: parsed.rating || prev.rating,
                shortDescription: parsed.shortDescription || prev.shortDescription,
                description: parsed.description || prev.description,
            }));

            setShowAutoFill(false);
            setAutoFillJson('');
        } catch (err) {
            setAutoFillError('Invalid JSON format. Please ensure you copied exactly what the AI returned.');
        }
    };

    const toggleTravelerType = (type) => {
        const current = Array.isArray(form.travelerTypes) ? form.travelerTypes : [];
        const next = current.includes(type)
            ? current.filter((item) => item !== type)
            : [...current, type];
        set('travelerTypes', next);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const parsedTags = (form.tagsText || '')
                .split(',')
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean);

            if (!form.locationType) throw new Error('Please select location type (domestic/international).');
            if (!form.days || !form.nights) throw new Error('Please enter both days and nights.');
            if (parsedTags.length === 0) throw new Error('Please add at least one tag.');
            if (!Array.isArray(form.travelerTypes) || form.travelerTypes.length === 0) {
                throw new Error('Please select at least one traveler type.');
            }

            const payload = {
                ...form,
                duration: `${form.nights} Nights / ${form.days} Days`,
                durationDays: Number(form.days),
                slug: form.slug || slugify(form.title),
                price: Number(form.price),
                originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
                slotsLeft: form.slotsLeft ? Number(form.slotsLeft) : undefined,
                tags: parsedTags,
                travelerTypes: Array.isArray(form.travelerTypes) ? form.travelerTypes : [],
                images: form.images.filter(Boolean),
                inclusions: form.inclusions.filter(Boolean),
                exclusions: form.exclusions.filter(Boolean),
                hotels: form.hotels
                    .filter(h => h.name && h.name.trim() !== '')
                    .map((h) => ({ ...h, stars: Number(h.stars), amenities: h.amenities.filter(Boolean) })),
                itinerary: form.itinerary
                    .filter(d => d.title && d.title.trim() !== '')
                    .map((d, i) => ({ ...d, day: i + 1, activities: d.activities.filter(Boolean) })),
            };
            delete payload.tagsText;
            delete payload.days;
            delete payload.nights;
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
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="font-bold text-gray-900 text-lg">Basic Information</h2>
                        <button type="button" onClick={() => setShowAutoFill(true)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95">
                            <Wand2 className="w-4 h-4" /> Autofill with AI (JSON)
                        </button>
                    </div>
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
                            <label className="form-label">Location Type *</label>
                            <select value={form.locationType} onChange={(e) => set('locationType', e.target.value)} className="form-input" required>
                                <option value="">Select type</option>
                                <option value="domestic">Domestic (India)</option>
                                <option value="international">International</option>
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
                            <label className="form-label">Days *</label>
                            <input type="number" min="1" value={form.days} onChange={(e) => set('days', e.target.value)} required placeholder="e.g. 11" className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Nights *</label>
                            <input type="number" min="0" value={form.nights} onChange={(e) => set('nights', e.target.value)} required placeholder="e.g. 10" className="form-input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label">Tags * (comma separated)</label>
                            <input value={form.tagsText} onChange={(e) => set('tagsText', e.target.value)} required placeholder="mountains, snowfall, luxury, adventure" className="form-input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label">Traveler Type *</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {['couple', 'family', 'solo', 'friends'].map((type) => (
                                    <label key={type} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.travelerTypes.includes(type)}
                                            onChange={() => toggleTravelerType(type)}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                        <span className="text-sm capitalize text-gray-700">{type}</span>
                                    </label>
                                ))}
                            </div>
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
                <div className="admin-card space-y-4">
                    <h2 className="font-bold text-gray-900 text-lg">Images</h2>
                    <p className="text-sm text-gray-500">Upload package images. The first image will be used as the cover.</p>

                    <div className="flex flex-wrap gap-4 mb-4">
                        {form.images.filter(Boolean).map((img, i) => (
                            <div key={i} className="relative group w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                                <img src={img.startsWith('http') ? img : `${API_URL}${img}`} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeArr('images', form.images.indexOf(img))}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 hover:bg-red-500 hover:text-white rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100">
                                    <X className="w-4 h-4" />
                                </button>
                                {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-white text-[10px] uppercase font-bold text-center py-1">Cover</span>}
                            </div>
                        ))}

                        <label className="w-32 h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all text-gray-500 hover:text-emerald-600">
                            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                            <span className="text-xs font-semibold">{saving ? 'Uploading...' : 'Add Image'}</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={saving} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* Itinerary */}
                <div className="admin-card space-y-4">
                    <h2 className="font-bold text-gray-900 text-lg">Itinerary (Day-by-Day)</h2>
                    {form.itinerary.map((day, di) => (
                        <div key={di} className="border border-gray-200 rounded-2xl p-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                <input value={hotel.name} onChange={(e) => updateHotel(hi, 'name', e.target.value)} placeholder="Hotel name" className="form-input flex-1 text-sm" />
                                <select value={hotel.stars} onChange={(e) => updateHotel(hi, 'stars', e.target.value)} className="form-input w-full sm:w-28 text-sm">
                                    {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} ⭐</option>)}
                                </select>
                                <button type="button" onClick={() => removeArr('hotels', hi)} disabled={form.hotels.length === 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 self-end sm:self-auto">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-8">
                    <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base">
                        {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> {isEdit ? 'Update Package' : 'Create Package'}</>}
                    </button>
                    <Link href="/admin/packages" className="btn-outline w-full sm:w-auto py-3.5 px-6 text-center">Cancel</Link>
                </div>
            </form>

            {/* AI Autofill Modal */}
            <AnimatePresence>
                {showAutoFill && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAutoFill(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Wand2 className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Autofill from AI</h3>
                                        <p className="text-sm text-gray-500">Paste JSON generated from ChatGPT/Gemini</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAutoFill(false)} className="p-2 text-gray-400 hover:bg-white hover:text-gray-900 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="p-5 overflow-y-auto space-y-5">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-700">1. Copy this strictly formatted Prompt</label>
                                        <button onClick={handleCopyPrompt} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1.5 rounded-lg transition-colors">
                                            {copiedPrompt ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>}
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs md:text-sm text-gray-600 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                                        {aiPromptText}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Paste this prompt along with your package image into Gemini or ChatGPT.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">2. Paste AI Output (JSON) Here</label>
                                    <textarea
                                        value={autoFillJson}
                                        onChange={(e) => setAutoFillJson(e.target.value)}
                                        placeholder="{\n  &quot;title&quot;: &quot;Char Dham Yatra&quot;,\n  &quot;price&quot;: 9999,\n  ...\n}"
                                        className="w-full form-input font-mono text-xs md:text-sm resize-none h-48 focus:border-indigo-500 focus:ring-indigo-500/20"
                                    />
                                </div>

                                {autoFillError && (
                                    <div className="text-red-600 bg-red-50 text-sm font-semibold p-3 rounded-xl border border-red-100 flex items-start gap-2">
                                        <X className="w-4 h-4 mt-0.5 flex-shrink-0" /> {autoFillError}
                                    </div>
                                )}
                            </div>

                            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAutoFill(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-all text-sm">Cancel</button>
                                <button type="button" onClick={applyAutoFill} className="px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all text-sm flex items-center gap-2">
                                    <Wand2 className="w-4 h-4" /> Apply Autofill
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
