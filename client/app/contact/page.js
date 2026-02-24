import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import InquiryForm from '@/components/InquiryForm';

export const metadata = { title: 'Contact Us | Travelative' };

export default function ContactPage() {
    return (
        <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Contact Our Travel Experts</h1>
                    <p className="text-base sm:text-lg text-gray-600">Have questions about a package or want to plan a custom trip? We're here to help 24/7.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                        <div className="space-y-6">
                            {[
                                { Icon: Phone, title: 'Call Us', details: '+91 XXXXX XXXXX', sub: 'Available 24/7 for urgent queries' },
                                { Icon: Mail, title: 'Email', details: 'hello@travelative.com', sub: 'We reply within 2 hours' },
                                { Icon: MapPin, title: 'Office', details: 'Connaught Place, New Delhi', sub: 'India - 110001' },
                                { Icon: Clock, title: 'Business Hours', details: 'Monday - Saturday', sub: '10:00 AM to 7:00 PM' }
                            ].map(({ Icon, title, details, sub }, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{title}</h3>
                                        <p className="text-gray-900 font-medium">{details}</p>
                                        <p className="text-gray-500 text-sm">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-gradient-to-br from-ocean-50 to-emerald-50 rounded-2xl border border-emerald-100">
                            <h3 className="font-bold text-gray-900 mb-2">Want a custom itinerary?</h3>
                            <p className="text-gray-600 text-sm mb-4">Our travel designers can build a unique trip just for you based on your preferences and budget.</p>
                            <a href="https://wa.me/91XXXXXXXXXX?text=Hi! I am looking for a custom travel itinerary." target="_blank" rel="noopener noreferrer" className="btn-primary w-full shadow-md text-sm">
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Contact Form / Embedded Map */}
                    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 h-full min-h-[420px] sm:min-h-[500px] flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                        <InquiryForm isOpen={true} isInline={true} />
                        <div className="mt-auto pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">Alternatively, you can reach us on our social media channels.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
