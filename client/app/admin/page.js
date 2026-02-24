'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, Mail, TrendingUp, Star, Plus, ArrowRight, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </motion.div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentEnquiries, setRecentEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API_URL}/api/admin/stats`, { headers }).then((r) => r.json()),
            fetch(`${API_URL}/api/admin/enquiries`, { headers }).then((r) => r.json()),
        ])
            .then(([statsData, enquiriesData]) => {
                setStats(statsData);
                setRecentEnquiries(enquiriesData.slice(0, 5));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        { title: 'Total Packages', value: stats?.totalPackages, icon: Package, color: 'bg-emerald-100 text-emerald-700', subtitle: `${stats?.featuredPackages || 0} featured` },
        { title: 'Total Enquiries', value: stats?.totalEnquiries, icon: Mail, color: 'bg-ocean-100 text-ocean-700', subtitle: 'Lifetime total' },
        { title: 'New Enquiries', value: stats?.newEnquiries, icon: TrendingUp, color: 'bg-orange-100 text-orange-700', subtitle: 'Awaiting response' },
        { title: 'Featured Packages', value: stats?.featuredPackages, icon: Star, color: 'bg-yellow-100 text-yellow-700', subtitle: 'On homepage' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
                </div>
                <Link href="/admin/packages/new" className="btn-primary w-full sm:w-auto text-sm py-2.5 px-5">
                    <Plus className="w-4 h-4" /> Add Package
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <StatCard {...card} />
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions + Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="admin-card">
                    <h2 className="font-bold text-gray-900 mb-5 text-lg">Quick Actions</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Add New Package', href: '/admin/packages/new', Icon: Plus, color: 'bg-emerald-600', desc: 'Create a new travel package' },
                            { label: 'View All Packages', href: '/admin/packages', Icon: Package, color: 'bg-ocean-600', desc: `Manage ${stats?.totalPackages || 0} packages` },
                            { label: 'View Enquiries', href: '/admin/enquiries', Icon: Mail, color: 'bg-orange-500', desc: `${stats?.newEnquiries || 0} new enquiries pending` },
                            { label: 'View Website', href: '/', Icon: ArrowRight, color: 'bg-gray-700', desc: 'Open your live website' },
                        ].map(({ label, href, Icon, color, desc }) => (
                            <Link key={href} href={href} target={href === '/' ? '_blank' : undefined}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all group">
                                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-800 text-sm">{label}</div>
                                    <div className="text-gray-400 text-xs">{desc}</div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Enquiries */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="admin-card">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold text-gray-900 text-lg">Recent Enquiries</h2>
                        <Link href="/admin/enquiries" className="text-emerald-600 text-sm font-semibold hover:underline">View all</Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                    ) : recentEnquiries.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">No enquiries yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {recentEnquiries.map((e) => (
                                <div key={e._id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-700 font-bold text-sm">
                                        {e.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-800 text-sm truncate">{e.name}</div>
                                        <div className="text-gray-400 text-xs truncate">{e.packageTitle || 'General Inquiry'} · {e.phone}</div>
                                    </div>
                                    <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded-full ${e.status === 'new' ? 'bg-orange-100 text-orange-700' :
                                            e.status === 'read' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {e.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
