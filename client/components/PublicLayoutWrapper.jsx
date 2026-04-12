'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';

export default function PublicLayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
    const isVoucherRoute = pathname?.startsWith('/voucher');

    if (isAdminRoute || isVoucherRoute) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <FloatingWhatsApp />
        </>
    );
}

