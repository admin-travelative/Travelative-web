'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, FileDown, Loader2, MessageCircle, XCircle } from 'lucide-react';
import VoucherPreview from '@/components/admin/VoucherPreview';
import { downloadPublicVoucherPdf } from '@/lib/voucherPdf';
import { getVoucherPublicUrl } from '@/lib/voucherDefaults';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PublicVoucherPage() {
    const params = useParams();
    const previewRef = useRef(null);
    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [origin, setOrigin] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!toast || toast.type === 'loading') {
            return undefined;
        }

        const timeout = window.setTimeout(() => setToast(null), 2600);
        return () => window.clearTimeout(timeout);
    }, [toast]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        if (!params?.id) return;

        setLoading(true);
        fetch(`${API_URL}/api/vouchers/${params.id}`)
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Voucher not found');
                setVoucher(data);
            })
            .catch((fetchError) => setError(fetchError.message || 'Voucher not found'))
            .finally(() => setLoading(false));
    }, [params?.id]);

    const publicUrl = origin && params?.id ? getVoucherPublicUrl(params.id, origin) : '';

    const handleDownload = async () => {
        if (!voucher) return;
        setDownloading(true);
        setToast({ type: 'loading', message: 'Preparing your voucher PDF...' });
        try {
            await downloadPublicVoucherPdf(params.id, `${voucher.voucherNumber || 'travelative-voucher'}.pdf`);
            setToast({ type: 'success', message: 'Voucher PDF downloaded successfully.' });
        } catch (downloadError) {
            setToast({ type: 'error', message: downloadError.message || 'Unable to download the voucher PDF.' });
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (error || !voucher) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fffaf5] p-6">
                <div className="max-w-lg rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Voucher unavailable</h1>
                    <p className="mt-3 text-sm leading-6 text-gray-500">{error || 'This voucher link is no longer available.'}</p>
                    <Link href="/" className="btn-primary mt-6 px-5 py-2.5 text-sm">Go To Travelative</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#fffdf8_55%,#f8fafc_100%)] p-4 sm:p-6 lg:p-10">
            {toast ? (
                <div className="fixed right-4 top-4 z-50 max-w-sm rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur sm:right-6 sm:top-6">
                    <div className="flex items-start gap-3">
                        {toast.type === 'loading' ? (
                            <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-orange-500" />
                        ) : toast.type === 'success' ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                        ) : (
                            <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                        )}
                        <div>
                            <div className="text-sm font-semibold text-gray-900">
                                {toast.type === 'loading' ? 'Downloading voucher' : toast.type === 'success' ? 'Download complete' : 'Download failed'}
                            </div>
                            <div className="mt-0.5 text-sm text-gray-600">{toast.message}</div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-600">Travelative</p>
                            <h1 className="mt-2 text-2xl font-serif font-bold text-gray-900">Your Booking Voucher Is Ready</h1>
                            <p className="mt-2 max-w-2xl text-sm text-gray-500">You can view this page, download the PDF, and use it as a reference during hotel check-in.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={handleDownload} className="btn-primary px-4 py-2.5 text-sm" disabled={downloading}>
                                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                                Download PDF
                            </button>
                            <a href={`https://wa.me/?text=${encodeURIComponent(`Travelative voucher: ${publicUrl}`)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600">
                                <MessageCircle className="mr-2 inline h-4 w-4" />
                                Share
                            </a>
                        </div>
                    </div>
                </div>

                <VoucherPreview voucher={voucher} publicUrl={publicUrl} previewRef={previewRef} />
            </div>
        </div>
    );
}
