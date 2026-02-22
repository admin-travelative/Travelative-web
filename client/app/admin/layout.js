'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token && pathname !== '/admin/login') {
            router.replace('/admin/login');
        } else {
            setChecking(false);
        }
    }, [pathname]);

    if (pathname === '/admin/login') return <>{children}</>;

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 ml-0 lg:ml-64 min-h-screen p-6 lg:p-8 pt-16 lg:pt-8">
                {children}
            </main>
        </div>
    );
}
