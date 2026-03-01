'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, LayoutDashboard, Package, Mail, LogOut, Menu, X, Settings, ChevronRight
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Packages', href: '/admin/packages', icon: Package },
    { label: 'Enquiries', href: '/admin/enquiries', icon: Mail },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <Link href="/admin" className="flex flex-col items-start gap-1 group">
                    <img src="/Travelative_logo.png" alt="Travelative" className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 origin-left" />
                    <span className="text-[11px] text-orange-600 font-bold uppercase tracking-widest ml-1 mt-1 transition-colors group-hover:text-orange-700">Admin Panel</span>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">Navigation</p>
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group ${isActive
                                ? 'bg-orange-50 text-orange-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            {label}
                            {isActive && <ChevronRight className="w-4 h-4 ml-auto text-orange-500" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-gray-100 space-y-1">
                <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
                    <Globe className="w-5 h-5 text-gray-400" /> View Website
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-all"
                >
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md rounded-xl p-2.5 border border-gray-200"
            >
                {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 shadow-sm z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
