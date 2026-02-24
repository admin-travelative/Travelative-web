import Image from 'next/image';
import { Globe, Users, Shield, Award } from 'lucide-react';

export const metadata = { title: 'About Us | Travelative' };

export default function AboutPage() {
    return (
        <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
                    Redefining How You <span className="text-emerald-600">Travel</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    At Travelative, we don't just sell tour packages; we craft unforgettable experiences.
                    Founded by passionate travelers, our mission is to make premium global exploration accessible, safe, and breathtaking.
                </p>
            </div>

            {/* Image Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 sm:h-[400px]">
                    <div className="sm:col-span-2 sm:row-span-2 rounded-3xl overflow-hidden relative h-64 sm:h-auto">
                        <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80" alt="Travel" className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-3xl overflow-hidden relative h-52 sm:h-auto">
                        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80" alt="Beach" className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-3xl overflow-hidden relative h-52 sm:h-auto">
                        <img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&q=80" alt="Mountains" className="w-full h-full object-cover" />
                    </div>
                    <div className="sm:col-span-2 rounded-3xl overflow-hidden relative h-52 sm:h-auto">
                        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80" alt="Road Trip" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Why Travelative?</h2>
                </div>
                <div className="grid md:grid-cols-4 gap-8">
                    {[
                        { Icon: Globe, title: 'Global Reach', desc: 'Handpicked destinations across 50+ countries.' },
                        { Icon: Users, title: 'Expert Guides', desc: 'Local experts who know the hidden gems.' },
                        { Icon: Shield, title: 'Secure Travel', desc: 'Your safety is our #1 priority throughout the journey.' },
                        { Icon: Award, title: 'Premium Quality', desc: 'Only 4-star and 5-star accommodations guaranteed.' }
                    ].map(({ Icon, title, desc }, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl text-center shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Icon className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-gray-900">{title}</h3>
                            <p className="text-gray-500">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
