import Link from 'next/link';
import { Globe, MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const footerLinks = {
    'Destinations': [
        { label: 'Maldives', href: '/packages/maldives-luxury-escape' },
        { label: 'Bali', href: '/packages/bali-adventure-temples' },
        { label: 'Rajasthan', href: '/packages/rajasthan-royal-heritage' },
        { label: 'Greece', href: '/packages/santorini-greek-islands' },
        { label: 'Kerala', href: '/packages/kerala-backwaters-retreat' },
        { label: 'Switzerland', href: '/packages/swiss-alps-family-adventure' },
    ],
    'Categories': [
        { label: 'Honeymoon Packages', href: '/packages?category=Honeymoon' },
        { label: 'Adventure Tours', href: '/packages?category=Adventure' },
        { label: 'Family Getaways', href: '/packages?category=Family' },
        { label: 'Relax & Unwind', href: '/packages?category=Relax' },
    ],
    'Company': [
        { label: 'About Us', href: '/about' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Terms & Conditions', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Refund Policy', href: '#' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-gray-950 text-gray-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-flex items-center mb-6 p-2 sm:p-2.5 bg-white rounded-2xl shadow-md transition-transform duration-300 hover:scale-105 origin-left">
                            <img src="/Travelative_logo.png" alt="Travelative" className="h-14 sm:h-16 md:h-20 w-auto object-contain" />
                        </Link>
                        <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                            We craft premium travel experiences that turn your dream vacations into unforgettable realities.
                            Don't just dream — Travelative.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a href="tel:+91XXXXXXXXXX" className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors duration-200">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>+91 XXXXX XXXXX</span>
                            </a>
                            <a href="mailto:hello@travelative.com" className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors duration-200">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span>hello@travelative.com</span>
                            </a>
                            <div className="flex items-center gap-3 text-gray-400">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>New Delhi, India</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3 mt-6">
                            {[
                                { Icon: Instagram, label: 'Instagram' },
                                { Icon: Facebook, label: 'Facebook' },
                                { Icon: Twitter, label: 'Twitter' },
                                { Icon: Youtube, label: 'YouTube' },
                            ].map(({ Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors duration-200"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{title}</h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-center sm:text-left">
                        <span>© {new Date().getFullYear()} Travelative. All rights reserved.</span>
                        <Link href="/admin/login" className="hover:text-emerald-500 transition-colors duration-200">
                            Admin Portal
                        </Link>
                    </p>
                    <p className="text-gray-600 text-sm">
                        Crafted with ❤️ for travel lovers worldwide
                    </p>
                </div>
            </div>
        </footer>
    );
}
