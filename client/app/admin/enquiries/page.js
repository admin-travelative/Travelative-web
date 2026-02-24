'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, CheckCircle, Clock, MessageSquare, Loader2, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const statusColors = {
    new: 'bg-orange-100 text-orange-700',
    read: 'bg-blue-100 text-blue-700',
    handled: 'bg-green-100 text-green-700',
};

export default function AdminEnquiriesPage() {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updating, setUpdating] = useState(null);

    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

    const fetchEnquiries = () => {
        setLoading(true);
        fetch(`${API_URL}/api/admin/enquiries`, { headers: { Authorization: `Bearer ${getToken()}` } })
            .then((r) => r.json())
            .then(setEnquiries)
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchEnquiries(); }, []);

    const updateStatus = async (id, status) => {
        setUpdating(id);
        try {
            const res = await fetch(`${API_URL}/api/admin/enquiries/${id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setEnquiries((prev) => prev.map((e) => e._id === id ? { ...e, status } : e));
            }
        } catch { }
        setUpdating(null);
    };

    const filtered = filter === 'all' ? enquiries : enquiries.filter((e) => e.status === filter);
    const counts = { all: enquiries.length, new: enquiries.filter((e) => e.status === 'new').length, read: enquiries.filter((e) => e.status === 'read').length, handled: enquiries.filter((e) => e.status === 'handled').length };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Enquiries</h1>
                    <p className="text-gray-500 text-sm">{counts.new} new enquiries awaiting response</p>
                </div>
                <button onClick={fetchEnquiries} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all" title="Refresh">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'new', label: '🔴 New' },
                    { key: 'read', label: '🔵 Read' },
                    { key: 'handled', label: '✅ Handled' },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === key ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {label} <span className="ml-1 opacity-70">({counts[key]})</span>
                    </button>
                ))}
            </div>

            {/* Enquiries List */}
            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No enquiries to show.</p>
                        </div>
                    ) : (
                        filtered.map((e, i) => (
                            <motion.div
                                key={e._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-emerald-700 font-bold text-lg">
                                        {e.name?.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-start gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900 text-lg">{e.name}</h3>
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${statusColors[e.status]}`}>{e.status}</span>
                                            {e.packageTitle && (
                                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">✈️ {e.packageTitle}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                            <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                                                <Phone className="w-3.5 h-3.5" />{e.phone}
                                            </a>
                                            <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                                                <Mail className="w-3.5 h-3.5" />{e.email}
                                            </a>
                                            {e.travelDate && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Travel: {e.travelDate}</div>}
                                            {e.travelers && <div className="flex items-center gap-1.5">👥 {e.travelers} traveler{e.travelers > 1 ? 's' : ''}</div>}
                                        </div>
                                        {e.message && (
                                            <div className="flex items-start gap-2 text-gray-600 text-sm bg-gray-50 rounded-xl p-3">
                                                <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                                                <p>{e.message}</p>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2">
                                            Received: {new Date(e.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        {e.status === 'new' && (
                                            <button onClick={() => updateStatus(e._id, 'read')} disabled={updating === e._id}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50">
                                                {updating === e._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Mark Read
                                            </button>
                                        )}
                                        {e.status !== 'handled' && (
                                            <button onClick={() => updateStatus(e._id, 'handled')} disabled={updating === e._id}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50">
                                                <CheckCircle className="w-3.5 h-3.5" /> Mark Done
                                            </button>
                                        )}
                                        <a href={`https://wa.me/${e.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${e.name}! Thank you for your interest in ${e.packageTitle || 'our packages'}. 😊`)}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors">
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                            WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
