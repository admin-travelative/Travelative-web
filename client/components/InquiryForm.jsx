'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const WHATSAPP_NUMBER = '91XXXXXXXXXX'; // Replace with actual number

export default function InquiryForm({ isOpen, onClose, defaultPackage = '', isInline = false }) {
    const [form, setForm] = useState({
        name: '', email: '', phone: '',
        packageTitle: defaultPackage, travelDate: '', travelers: 1, message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/enquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Submission failed');
            setSuccess(true);
            // Redirect to WhatsApp with pre-filled message
            const msg = encodeURIComponent(
                `Hi Travelative! 🌏\n\nI'm interested in booking:\n*Package:* ${form.packageTitle || 'General Inquiry'}\n*Name:* ${form.name}\n*Travel Date:* ${form.travelDate || 'Flexible'}\n*Travelers:* ${form.travelers}\n*Phone:* ${form.phone}\n\n${form.message ? `Message: ${form.message}` : 'Please send me more details.'}`
            );
            setTimeout(() => {
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
                onClose();
                setSuccess(false);
                setForm({ name: '', email: '', phone: '', packageTitle: defaultPackage, travelDate: '', travelers: 1, message: '' });
            }, 1500);
        } catch (err) {
            setError('Something went wrong. Please try again or call us directly.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={isInline ? "" : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"}
                    onClick={(e) => {
                        if (!isInline && e.target === e.currentTarget && onClose) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        initial={isInline ? false : { scale: 0.9, opacity: 0, y: 20 }}
                        animate={isInline ? false : { scale: 1, opacity: 1, y: 0 }}
                        exit={isInline ? false : { scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        className={`bg-white rounded-3xl w-full max-w-lg overflow-hidden ${isInline ? '' : 'shadow-2xl'}`}
                    >
                        {/* Header */}
                        {!isInline && (
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-serif font-bold text-white">Book Your Dream Trip</h2>
                                        <p className="text-emerald-100 text-sm mt-1">We'll contact you within 2 hours!</p>
                                    </div>
                                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Body */}
                        <div className={isInline ? "" : "p-6"}>
                            {success ? (
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h3>
                                    <p className="text-gray-500">Redirecting you to WhatsApp to connect instantly...</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Your Name *</label>
                                            <input name="name" value={form.name} onChange={handleChange} required placeholder="Rahul Sharma" className="form-input" />
                                        </div>
                                        <div>
                                            <label className="form-label">Phone *</label>
                                            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" className="form-input" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Email *</label>
                                        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" className="form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">Interested Package</label>
                                        <input name="packageTitle" value={form.packageTitle} onChange={handleChange} placeholder="e.g. Maldives Luxury Escape" className="form-input" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Travel Date</label>
                                            <input name="travelDate" type="date" value={form.travelDate} onChange={handleChange} className="form-input" min={new Date().toISOString().split('T')[0]} />
                                        </div>
                                        <div>
                                            <label className="form-label">No. of Travelers</label>
                                            <input name="travelers" type="number" value={form.travelers} onChange={handleChange} min="1" max="50" className="form-input" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Message (Optional)</label>
                                        <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Tell us about your preferences..." className="form-input resize-none" />
                                    </div>
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
                                        {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>) : (<><Send className="w-5 h-5" /> Submit & Chat on WhatsApp</>)}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
