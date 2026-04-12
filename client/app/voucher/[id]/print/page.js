'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import VoucherPreview from '@/components/admin/VoucherPreview';
import { getVoucherPublicUrl } from '@/lib/voucherDefaults';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PublicVoucherPrintPage() {
    const params = useParams();
    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        if (!params?.id) {
            return;
        }

        setLoading(true);
        fetch(`${API_URL}/api/vouchers/${params.id}`)
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Voucher not found');
                }
                setVoucher(data);
            })
            .catch((fetchError) => setError(fetchError.message || 'Voucher not found'))
            .finally(() => setLoading(false));
    }, [params?.id]);

    useEffect(() => {
        if (!voucher) {
            return;
        }

        const timeout = window.setTimeout(() => {
            window.print();
        }, 500);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [voucher]);

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
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h1 className="mt-4 text-2xl font-serif font-bold text-gray-900">Print preview unavailable</h1>
                    <p className="mt-3 text-sm leading-6 text-gray-500">{error || 'This voucher could not be loaded for printing.'}</p>
                    <Link href="/" className="btn-primary mt-6 px-5 py-2.5 text-sm">
                        Go To Travelative
                    </Link>
                </div>
            </div>
        );
    }

    const publicUrl = origin && params?.id ? getVoucherPublicUrl(params.id, origin) : '';

    return (
        <div className="voucher-print-page min-h-screen bg-[#fffaf5] p-4 sm:p-6 lg:p-8">
            <div className="voucher-print-shell mx-auto max-w-[920px] space-y-4">
                <div className="voucher-print-toolbar flex items-center justify-between rounded-3xl border border-orange-100 bg-white px-5 py-4 shadow-sm">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.3em] text-orange-600">Voucher Print Preview</div>
                        <h1 className="mt-1 text-xl font-serif font-bold text-gray-900">{voucher.voucherNumber}</h1>
                    </div>
                    <Link href={`/voucher/${params.id}`} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                        Back
                    </Link>
                </div>

                <VoucherPreview voucher={voucher} publicUrl={publicUrl} />
            </div>
        </div>
    );
}
