'use client';
import Sidebar from '@/components/admin/Sidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    if (pathname === '/admin/login') return <>{children}</>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 ml-0 lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
                {children}
            </main>
        </div>
    );
}
