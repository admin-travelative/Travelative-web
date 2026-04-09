import Image from 'next/image';
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Shield, Heart, Award, Users } from 'lucide-react';

export const metadata = { title: 'About Us | Travelative' };

export default function AboutPage() {
    return (
        <div className="pt-28 pb-20 min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
                    Redefining How You <span className="text-orange-600">Travel</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    At Travelative, we deliver memorable experiences tailored to the personal wishes of our valued guests.
                </p>
            </div>

            {/* Main Content & Images */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Text Content */}
                    <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                        <p>
                            Our mission is to provide exceptional service and create dream holidays, often focusing on enriching lives through travel. We want our guests to get safe, secure, and high-quality travel products. Our endeavor will be a continuous effort to meet your expectations and make it easy for you to find and book those trips with us.
                        </p>
                        <p>
                            We design, plan, and customize quality tour packages that will give you unforgettable moments and deep insights that will stay with you for a lifetime.
                        </p>
                        <p>
                            Our company was founded by two friends who shared around <strong>50,000kms of travel</strong>, so we wanted to create a business that would give the same joy and experiences that we had when we traveled. We also focused on establishing a business that would minimize the impact on the environment and support local communities wherever we go.
                        </p>
                        <p>
                            The team at Travelative has two things in abundance: <strong>passion and professionalism</strong>. We have people who possess a good wealth of knowledge and experience in the travel industry. From our expert travel advisors to our friendly customer service team, we all are committed to giving you an incredible experience.
                        </p>
                        <div className="pt-4 pb-2 border-l-4 border-orange-500 pl-6 my-8">
                            <p className="text-xl font-serif italic text-gray-800">
                                "Get ready to start planning your next adventure. Explore our website to find your perfect destinations. You can also contact our team for personalized travel recommendations."
                            </p>
                        </div>
                        <p className="font-bold text-gray-900 text-xl">
                            Travelative – One stop solution for all of your travel queries.
                        </p>
                    </div>

                    {/* Right: Premium Image Grid */}
                    <div className="grid grid-cols-2 gap-4 h-full min-h-[500px]">
                        <div className="space-y-4">
                            <div className="relative rounded-3xl overflow-hidden h-[60%] shadow-lg transition-transform duration-500 hover:scale-[1.02]">
                                <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80" alt="Travel Landscape" className="w-full h-full object-cover" />
                            </div>
                            <div className="relative rounded-3xl overflow-hidden h-[40%] shadow-lg transition-transform duration-500 hover:scale-[1.02]">
                                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80" alt="Beach" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="space-y-4 pt-12">
                            <div className="relative rounded-3xl overflow-hidden h-[45%] shadow-lg transition-transform duration-500 hover:scale-[1.02]">
                                <img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&q=80" alt="Mountain" className="w-full h-full object-cover" />
                            </div>
                            <div className="relative rounded-3xl overflow-hidden h-[55%] shadow-lg transition-transform duration-500 hover:scale-[1.02]">
                                <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80" alt="Road Trip" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="bg-white py-20 border-y border-gray-100 mb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { Icon: Heart, title: 'Passion Driven', desc: 'Crafted by friends with 50,000kms of travel experience.' },
                            { Icon: Shield, title: 'Safe & Secure', desc: 'High-quality travel products focused on your security.' },
                            { Icon: Users, title: 'Local Support', desc: 'Minimizing environmental impact and supporting local communities.' },
                            { Icon: Award, title: 'Professionalism', desc: 'Expert advisors creating custom unforgettable moments.' }
                        ].map(({ Icon, title, desc }, i) => (
                            <div key={i} className="p-6 rounded-3xl text-center bg-gray-50 border border-gray-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300">
                                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Icon className="w-8 h-8 text-orange-600" />
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-gray-900">{title}</h3>
                                <p className="text-gray-500">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Details Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Get In Touch</h2>
                    <p className="text-gray-500 mt-3">We are always here to plan your next adventure.</p>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <MapPin className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Office Location</h4>
                            <p className="text-gray-600">Noida, Uttar Pradesh</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <Phone className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Contact</h4>
                            <a href="tel:+917088221122" className="block text-gray-600 hover:text-orange-600 transition-colors">7088221122</a>
                            <a href="tel:+918373949613" className="block text-gray-600 hover:text-orange-600 transition-colors">8373949613</a>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <Mail className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                            <a href="mailto:traveladvisor@travelative.com" className="text-gray-600 hover:text-orange-600 transition-colors break-all">traveladvisor@travelative.com</a>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <Globe className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Website</h4>
                            <a href="https://www.travelative.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600 transition-colors">www.travelative.com</a>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Facebook className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Facebook</h4>
                            <a href="https://www.facebook.com/61556093471104/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors line-clamp-1">Travelative Page</a>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-pink-50 rounded-xl">
                            <Instagram className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Instagram</h4>
                            <a href="https://instagram.com/TRAVELATIVEUP14" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 transition-colors">@TRAVELATIVEUP14</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
