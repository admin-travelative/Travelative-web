'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, Mail, TrendingUp, Star, Plus, ArrowRight, Ticket } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

function StatCard({ title, value, icon: Icon, color, subtitle }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card">
            <div className="flex items-start justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value ?? '--'}</p>
                    {subtitle ? <p className="mt-1 text-xs text-gray-400">{subtitle}</p> : null}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-6 w-6" />
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
        const headers = getAuthHeaders();
        Promise.all([
            fetch(`${API_URL}/api/admin/stats`, { headers, credentials: 'include' }).then((response) => response.json()),
            fetch(`${API_URL}/api/admin/enquiries`, { headers, credentials: 'include' }).then((response) => response.json()),
        ])
            .then(([statsData, enquiriesData]) => {
                setStats(statsData);
                setRecentEnquiries(enquiriesData.slice ? enquiriesData.slice(0, 5) : []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        { title: 'Total Packages', value: stats?.totalPackages, icon: Package, color: 'bg-emerald-100 text-emerald-700', subtitle: `${stats?.featuredPackages || 0} featured` },
        { title: 'Total Enquiries', value: stats?.totalEnquiries, icon: Mail, color: 'bg-ocean-100 text-ocean-700', subtitle: 'Lifetime total' },
        { title: 'New Enquiries', value: stats?.newEnquiries, icon: TrendingUp, color: 'bg-orange-100 text-orange-700', subtitle: 'Awaiting response' },
        { title: 'Featured Packages', value: stats?.featuredPackages, icon: Star, color: 'bg-yellow-100 text-yellow-700', subtitle: 'On homepage' },
        { title: 'Travel Vouchers', value: stats?.totalVouchers, icon: Ticket, color: 'bg-slate-100 text-slate-700', subtitle: 'Generated records' },
    ];

    const quickActions = [
        { label: 'Add New Package', href: '/admin/packages/new', Icon: Plus, color: 'bg-emerald-600', desc: 'Create a new travel package' },
        { label: 'View All Packages', href: '/admin/packages', Icon: Package, color: 'bg-ocean-600', desc: `Manage ${stats?.totalPackages || 0} packages` },
        { label: 'View Enquiries', href: '/admin/enquiries', Icon: Mail, color: 'bg-orange-500', desc: `${stats?.newEnquiries || 0} new enquiries pending` },
        { label: 'Travel Vouchers', href: '/admin/vouchers', Icon: Ticket, color: 'bg-slate-700', desc: `${stats?.totalVouchers || 0} saved vouchers` },
        { label: 'View Website', href: '/', Icon: ArrowRight, color: 'bg-gray-700', desc: 'Open your live website' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening.</p>
                </div>
                <Link href="/admin/packages/new" className="btn-primary w-full px-5 py-2.5 text-sm sm:w-auto">
                    <Plus className="h-4 w-4" /> Add Package
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
                {statCards.map((card, index) => (
                    <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                        <StatCard {...card} />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="admin-card">
                    <h2 className="mb-5 text-lg font-bold text-gray-900">Quick Actions</h2>
                    <div className="space-y-3">
                        {quickActions.map(({ label, href, Icon, color, desc }) => (
                            <Link key={href} href={href} target={href === '/' ? '_blank' : undefined} className="group flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50">
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-gray-800">{label}</div>
                                    <div className="text-xs text-gray-400">{desc}</div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gray-500" />
                            </Link>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="admin-card">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Recent Enquiries</h2>
                        <Link href="/admin/enquiries" className="text-sm font-semibold text-emerald-600 hover:underline">View all</Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[...Array(4)].map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
                    ) : recentEnquiries.length === 0 ? (
                        <div className="py-8 text-center text-gray-400">No enquiries yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {recentEnquiries.map((enquiry) => (
                                <div key={enquiry._id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                                        {enquiry.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-semibold text-gray-800">{enquiry.name}</div>
                                        <div className="truncate text-xs text-gray-400">{enquiry.packageTitle || 'General Inquiry'} | {enquiry.phone}</div>
                                    </div>
                                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${enquiry.status === 'new' ? 'bg-orange-100 text-orange-700' : enquiry.status === 'read' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {enquiry.status}
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
