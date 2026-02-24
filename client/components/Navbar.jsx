'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, Globe, Phone, ChevronDown } from 'lucide-react';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Packages', href: '/packages' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const pathname = usePathname();

    // The navbar should always be solid on non-home pages
    const isHomePage = pathname === '/';
    const forceSolid = !isHomePage;
    const isSolid = isScrolled || forceSolid;

    useMotionValueEvent(scrollY, 'change', (latest) => {
        setIsScrolled(latest > 60);
    });

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isSolid ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-transparent'
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20 md:h-20 py-1 sm:py-2 relative">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group z-10 transition-transform duration-300 hover:scale-105">
                        <img src="/Travelative_logo.png" alt="Travelative" className="h-7 sm:h-8 md:h-9 lg:h-10 w-auto object-contain" />
                    </Link>

                    {/* Desktop Nav - Centered perfectly */}
                    <nav className="hidden md:flex items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2 w-full max-w-lg">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative text-[15px] font-semibold transition-colors duration-300 py-2 group ${isSolid ? 'text-gray-800 hover:text-emerald-600' : 'text-white/95 hover:text-white'
                                    }`}
                            >
                                {link.label}
                                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full ${isSolid ? 'bg-emerald-500' : 'bg-white'}`}></span>
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4 z-10">
                        <a
                            href="https://wa.me/91XXXXXXXXXX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${isSolid ? 'text-gray-700 hover:text-emerald-600' : 'text-white/90 hover:text-white'
                                }`}
                        >
                            <Phone className="w-4 h-4" />
                            <span>Quick Call</span>
                        </a>
                        <Link href="/packages" className="btn-primary text-sm py-2.5 px-6 shadow-lg shadow-emerald-500/20">
                            Explore Packages
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${isSolid ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                            }`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <motion.div
                initial={false}
                animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden bg-white border-t border-gray-100"
            >
                <div className="px-4 py-4 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block py-3 px-4 text-gray-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-2 pb-1">
                        <Link href="/packages" className="btn-primary w-full justify-center" onClick={() => setIsMenuOpen(false)}>
                            Explore Packages
                        </Link>
                    </div>
                </div>
            </motion.div>
        </motion.header>
    );
}
