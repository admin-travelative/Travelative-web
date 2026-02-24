'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, TrendingUp, AlertCircle, Star, Search, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);

    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

    const fetchPackages = () => {
        fetch(`${API_URL}/api/admin/packages`, { headers: { Authorization: `Bearer ${getToken()}` } })
            .then((r) => r.json())
            .then(setPackages)
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPackages(); }, []);

    const handleDelete = async (id, title) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeleting(id);
        try {
            await fetch(`${API_URL}/api/admin/packages/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
            setPackages((prev) => prev.filter((p) => p._id !== id));
        } catch { }
        setDeleting(null);
    };

    const filtered = packages.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Packages</h1>
                    <p className="text-gray-500 text-sm">{packages.length} total packages</p>
                </div>
                <Link href="/admin/packages/new" className="btn-primary text-sm py-2.5 px-5">
                    <Plus className="w-4 h-4" /> Add Package
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search packages..."
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 font-bold text-gray-700">Package</th>
                                    <th className="text-left px-4 py-4 font-bold text-gray-700">Category</th>
                                    <th className="text-left px-4 py-4 font-bold text-gray-700">Price</th>
                                    <th className="text-left px-4 py-4 font-bold text-gray-700">Duration</th>
                                    <th className="text-left px-4 py-4 font-bold text-gray-700">Status</th>
                                    <th className="text-right px-6 py-4 font-bold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((pkg, i) => (
                                    <motion.tr
                                        key={pkg._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={pkg.images?.[0]} alt={pkg.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                                                <div>
                                                    <div className="font-semibold text-gray-900 line-clamp-1">{pkg.title}</div>
                                                    <div className="text-gray-400 text-xs">{pkg.location}, {pkg.country}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pkg.category === 'Adventure' ? 'bg-orange-100 text-orange-700' :
                                                    pkg.category === 'Honeymoon' ? 'bg-rose-100 text-rose-700' :
                                                        pkg.category === 'Family' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-ocean-100 text-ocean-700'
                                                }`}>{pkg.category}</span>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-emerald-700">{formatPrice(pkg.price)}</td>
                                        <td className="px-4 py-4 text-gray-500">{pkg.duration}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                {pkg.isFeatured && <span className="inline-flex items-center gap-1 text-xs text-yellow-700 font-medium"><Star className="w-3 h-3" /> Featured</span>}
                                                {pkg.isTrending && <span className="inline-flex items-center gap-1 text-xs text-orange-700 font-medium"><TrendingUp className="w-3 h-3" /> Trending</span>}
                                                {pkg.isLimitedSlots && <span className="inline-flex items-center gap-1 text-xs text-red-700 font-medium"><AlertCircle className="w-3 h-3" /> Limited</span>}
                                                {!pkg.isFeatured && !pkg.isTrending && !pkg.isLimitedSlots && <span className="text-gray-400 text-xs">Standard</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/packages/${pkg._id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(pkg._id, pkg.title)}
                                                    disabled={deleting === pkg._id}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleting === pkg._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {filtered.length === 0 && !loading && (
                                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">No packages found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
