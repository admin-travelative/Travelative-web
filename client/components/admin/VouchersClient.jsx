'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Copy,
    Eye,
    FileDown,
    Link2,
    Loader2,
    MessageCircle,
    Plus,
    Save,
    Search,
    Ticket,
    Trash2,
} from 'lucide-react';
import VoucherPreview from '@/components/admin/VoucherPreview';
import { downloadAdminVoucherPdf } from '@/lib/voucherPdf';
import {
    buildVoucherPayload,
    buildVoucherShareText,
    calculateBalance,
    createEmptyVoucherForm,
    formatCurrency,
    formatDisplayDate,
    getVoucherPublicUrl,
    voucherToForm,
} from '@/lib/voucherDefaults';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function Field({ label, children, helper }) {
    return (
        <div>
            <label className="form-label">{label}</label>
            {children}
            {helper ? <p className="mt-2 text-xs text-gray-400">{helper}</p> : null}
        </div>
    );
}

function SectionCard({ title, description, children }) {
    return (
        <section className="admin-card rounded-[28px] p-6 sm:p-7">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
            </div>
            {children}
        </section>
    );
}

function ModeButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                active
                    ? 'border-slate-900 bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
        >
            {children}
        </button>
    );
}

function ListEditor({ label, values, onChange, helper }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <label className="form-label mb-0">{label}</label>
                    {helper ? <p className="mt-1 text-xs text-gray-400">{helper}</p> : null}
                </div>
                <button
                    type="button"
                    onClick={() => onChange([...(values || []), ''])}
                    className="rounded-full border border-orange-200 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-50"
                >
                    Add line
                </button>
            </div>
            <div className="space-y-2">
                {(values || []).map((value, index) => (
                    <div key={`${label}-${index}`} className="flex items-start gap-2">
                        <textarea
                            rows={2}
                            value={value}
                            onChange={(event) => {
                                const next = [...values];
                                next[index] = event.target.value;
                                onChange(next);
                            }}
                            className="form-input min-h-[74px] resize-y"
                        />
                        <button
                            type="button"
                            disabled={values.length === 1}
                            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
                            className="mt-2 rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function VouchersClient() {
    const [mode, setMode] = useState('editor');
    const [form, setForm] = useState(createEmptyVoucherForm);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [activeVoucherId, setActiveVoucherId] = useState(null);
    const [search, setSearch] = useState('');
    const [origin, setOrigin] = useState('');
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
        fetchVouchers();
    }, []);

    async function fetchVouchers() {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/vouchers`, {
                headers: getAuthHeaders(),
                credentials: 'include',
            });
            const data = await response.json();
            setVouchers(Array.isArray(data) ? data : []);
        } catch {
            setError('Unable to load saved vouchers.');
        } finally {
            setLoading(false);
        }
    }

    const activeVoucher = vouchers.find((voucher) => voucher._id === activeVoucherId);
    const previewVoucher = useMemo(() => ({
        ...form,
        balanceAmount: form.balanceAmount === '' ? calculateBalance(form.totalAmount, form.paidAmount) : form.balanceAmount,
    }), [form]);

    const filteredVouchers = useMemo(() => {
        const query = search.toLowerCase();

        return vouchers.filter((voucher) => {
            return [voucher.voucherNumber, voucher.customerName, voucher.customerPhone, voucher.hotelName, voucher.destination]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [search, vouchers]);

    function updateField(key, value) {
        setForm((current) => {
            const next = { ...current, [key]: value };

            if (key === 'totalAmount' || key === 'paidAmount') {
                next.balanceAmount = calculateBalance(
                    key === 'totalAmount' ? value : current.totalAmount,
                    key === 'paidAmount' ? value : current.paidAmount
                );
            }

            return next;
        });
    }

    function handleNewVoucher() {
        setActiveVoucherId(null);
        setForm(createEmptyVoucherForm());
        setMode('editor');
        setError('');
        setNotice('A blank voucher form is ready.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleLoadVoucher(voucher) {
        setActiveVoucherId(voucher._id);
        setForm(voucherToForm(voucher));
        setMode('editor');
        setError('');
        setNotice(`Voucher ${voucher.voucherNumber} is now open in the generator.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError('');
        setNotice('');

        const payload = buildVoucherPayload(form);
        if (!payload.customerName || !payload.customerPhone) {
            setSaving(false);
            setError('Customer name and primary contact are required.');
            return;
        }

        try {
            const response = await fetch(
                activeVoucherId ? `${API_URL}/api/admin/vouchers/${activeVoucherId}` : `${API_URL}/api/admin/vouchers`,
                {
                    method: activeVoucherId ? 'PUT' : 'POST',
                    headers: getAuthHeaders(),
                    credentials: 'include',
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to save the voucher.');

            setActiveVoucherId(data._id);
            setForm(voucherToForm(data));
            await fetchVouchers();
            setNotice(activeVoucherId ? 'Voucher updated successfully.' : 'Voucher generated successfully.');
        } catch (saveError) {
            setError(saveError.message || 'Unable to save the voucher.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(voucher) {
        if (!window.confirm(`Delete voucher "${voucher.voucherNumber}"?`)) return;
        setDeletingId(voucher._id);

        try {
            const response = await fetch(`${API_URL}/api/admin/vouchers/${voucher._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                credentials: 'include',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to delete the voucher.');

            if (activeVoucherId === voucher._id) {
                handleNewVoucher();
            }

            await fetchVouchers();
            setNotice('Voucher deleted successfully.');
        } catch (deleteError) {
            setError(deleteError.message || 'Unable to delete the voucher.');
        } finally {
            setDeletingId(null);
        }
    }

    async function handleDownload() {
        setDownloading(true);
        setError('');

        try {
            const payload = buildVoucherPayload(previewVoucher);
            await downloadAdminVoucherPdf(payload, `${payload.voucherNumber || 'travelative-voucher'}.pdf`);
            setNotice('The voucher PDF has been downloaded.');
        } catch (downloadError) {
            setError(downloadError.message || 'Unable to download the voucher PDF.');
        } finally {
            setDownloading(false);
        }
    }

    async function copyPublicLink(voucher = activeVoucher) {
        const voucherId = voucher?._id || activeVoucherId;
        if (!voucherId || !origin) {
            setError('Save the voucher before copying its public link.');
            return;
        }

        try {
            await navigator.clipboard.writeText(getVoucherPublicUrl(voucherId, origin));
            setNotice('Voucher link copied to the clipboard.');
        } catch {
            setError('Unable to copy the link.');
        }
    }

    function shareOnWhatsApp(voucher = activeVoucher) {
        const voucherId = voucher?._id || activeVoucherId;
        const phone = String(voucher?.customerPhone || form.customerPhone || '').replace(/\D/g, '');

        if (!voucherId || !origin) {
            setError('Save the voucher before sharing it on WhatsApp.');
            return;
        }

        if (!phone) {
            setError('A customer phone number is required for WhatsApp sharing.');
            return;
        }

        const link = getVoucherPublicUrl(voucherId, origin);
        const text = buildVoucherShareText(voucher || previewVoucher, link);
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }

    return (
        <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.34em] text-orange-600">Admin Voucher Studio</p>
                        <h1 className="mt-3 text-3xl font-bold text-slate-900">Travel Voucher Generator</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                            Create vouchers in a full-page workflow, review a live document preview below the form, and open history whenever you need older records.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <ModeButton active={mode === 'editor'} onClick={() => setMode('editor')}>
                            <Plus className="h-4 w-4" /> New Voucher
                        </ModeButton>
                        <ModeButton active={mode === 'history'} onClick={() => setMode('history')}>
                            <Ticket className="h-4 w-4" /> History
                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${mode === 'history' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {vouchers.length}
                            </span>
                        </ModeButton>
                    </div>
                </div>
            </div>

            {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</div> : null}
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}

            {mode === 'history' ? (
                <SectionCard
                    title="Generated Voucher History"
                    description="Search all saved vouchers, reopen any record in the generator, and manage existing links."
                >
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-slate-500">{vouchers.length} voucher records available</div>
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search voucher, guest, destination, hotel..."
                                className="form-input pl-10"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    ) : filteredVouchers.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center text-sm text-slate-400">
                            No voucher records matched your search.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredVouchers.map((voucher) => (
                                <div key={voucher._id} className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5">
                                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                                                    <Ticket className="h-3.5 w-3.5" />
                                                    {voucher.voucherNumber}
                                                </span>
                                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                    {formatDisplayDate(voucher.issueDate)}
                                                </span>
                                            </div>
                                            <h3 className="mt-3 text-lg font-bold text-slate-900">{voucher.customerName || 'Unnamed guest'}</h3>
                                            <div className="mt-1 text-sm text-slate-500">
                                                {(voucher.hotelName || 'Hotel pending')}
                                                {voucher.destination ? `, ${voucher.destination}` : ''}
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                                                <span>Contact: {voucher.customerPhone || '-'}</span>
                                                <span>Amount: {formatCurrency(voucher.totalAmount)}</span>
                                                <span>Status: {voucher.paymentStatus || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleLoadVoucher(voucher)}
                                                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300"
                                            >
                                                <Eye className="mr-1.5 inline h-3.5 w-3.5" /> Open In Generator
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => copyPublicLink(voucher)}
                                                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300"
                                            >
                                                <Link2 className="mr-1.5 inline h-3.5 w-3.5" /> Copy Link
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => shareOnWhatsApp(voucher)}
                                                className="rounded-full bg-green-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-600"
                                            >
                                                <MessageCircle className="mr-1.5 inline h-3.5 w-3.5" /> Share
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingId === voucher._id}
                                                onClick={() => handleDelete(voucher)}
                                                className="rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {deletingId === voucher._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Trash2 className="mr-1.5 inline h-3.5 w-3.5" /> Delete</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            ) : (
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <SectionCard
                            title={activeVoucherId ? 'Edit Voucher Details' : 'Voucher Details'}
                            description="No fields are prefilled now. Fill only the data you want in the voucher, and leave anything blank if it should not appear."
                        >
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Field label="Voucher Number" helper="Leave blank if you want the system to assign it on save.">
                                    <input
                                        value={form.voucherNumber}
                                        onChange={(event) => updateField('voucherNumber', event.target.value)}
                                        className="form-input"
                                        placeholder="TV-260412-001"
                                    />
                                </Field>
                                <Field label="Date Of Issue">
                                    <input
                                        type="date"
                                        value={form.issueDate}
                                        onChange={(event) => updateField('issueDate', event.target.value)}
                                        className="form-input"
                                    />
                                </Field>
                                <Field label="Package / Booking Tag">
                                    <input
                                        value={form.packageTitle}
                                        onChange={(event) => updateField('packageTitle', event.target.value)}
                                        className="form-input"
                                        placeholder="Rishikesh Weekend Escape"
                                    />
                                </Field>
                                <Field label="Destination">
                                    <input
                                        value={form.destination}
                                        onChange={(event) => updateField('destination', event.target.value)}
                                        className="form-input"
                                        placeholder="Rishikesh, Uttarakhand"
                                    />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Guest Details"
                            description="These details are shown directly on the voucher that reaches the customer."
                        >
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Field label="Customer Name">
                                    <input value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} className="form-input" placeholder="Utkarsh Patel" required />
                                </Field>
                                <Field label="Primary Contact">
                                    <input value={form.customerPhone} onChange={(event) => updateField('customerPhone', event.target.value)} className="form-input" placeholder="9876543210" required />
                                </Field>
                                <Field label="Email">
                                    <input value={form.customerEmail} onChange={(event) => updateField('customerEmail', event.target.value)} className="form-input" placeholder="guest@example.com" />
                                </Field>
                                <Field label="Alternate Contact">
                                    <input value={form.alternateContact} onChange={(event) => updateField('alternateContact', event.target.value)} className="form-input" placeholder="Optional alternate number" />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Booking Details"
                            description="Add the stay, room, and traveler information exactly as it should appear on the final voucher."
                        >
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Field label="Hotel / Property Name">
                                    <input value={form.hotelName} onChange={(event) => updateField('hotelName', event.target.value)} className="form-input" placeholder="Nimaya Resort" />
                                </Field>
                                <Field label="Hotel Address">
                                    <input value={form.hotelAddress} onChange={(event) => updateField('hotelAddress', event.target.value)} className="form-input" placeholder="Shivpuri, Rishikesh" />
                                </Field>
                                <Field label="Check-in Date">
                                    <input type="date" value={form.checkInDate} onChange={(event) => updateField('checkInDate', event.target.value)} className="form-input" />
                                </Field>
                                <Field label="Check-out Date">
                                    <input type="date" value={form.checkOutDate} onChange={(event) => updateField('checkOutDate', event.target.value)} className="form-input" />
                                </Field>
                                <Field label="No. Of Nights">
                                    <input type="number" min="0" value={form.numberOfNights} onChange={(event) => updateField('numberOfNights', event.target.value)} className="form-input" placeholder="2" />
                                </Field>
                                <Field label="No. Of Rooms">
                                    <input type="number" min="1" value={form.numberOfRooms} onChange={(event) => updateField('numberOfRooms', event.target.value)} className="form-input" placeholder="1" />
                                </Field>
                                <Field label="Room Type">
                                    <input value={form.roomType} onChange={(event) => updateField('roomType', event.target.value)} className="form-input" placeholder="Deluxe Double" />
                                </Field>
                                <Field label="Meal Plan">
                                    <input value={form.mealPlan} onChange={(event) => updateField('mealPlan', event.target.value)} className="form-input" placeholder="Breakfast + Dinner" />
                                </Field>
                                <Field label="Traveller Count">
                                    <input type="number" min="1" value={form.travelerCount} onChange={(event) => updateField('travelerCount', event.target.value)} className="form-input" placeholder="4" />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Payment Details"
                            description="Balance still updates automatically while typing, but you can override it if a booking needs manual adjustment."
                        >
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Field label="Total Amount">
                                    <input type="number" min="0" value={form.totalAmount} onChange={(event) => updateField('totalAmount', event.target.value)} className="form-input" placeholder="7500" />
                                </Field>
                                <Field label="Payment Status">
                                    <select value={form.paymentStatus} onChange={(event) => updateField('paymentStatus', event.target.value)} className="form-input">
                                        <option>Paid</option>
                                        <option>Partially Paid</option>
                                        <option>Balance Due</option>
                                        <option>Unpaid</option>
                                    </select>
                                </Field>
                                <Field label="Paid Amount">
                                    <input type="number" min="0" value={form.paidAmount} onChange={(event) => updateField('paidAmount', event.target.value)} className="form-input" placeholder="3000" />
                                </Field>
                                <Field label="Balance Amount">
                                    <input type="number" min="0" value={form.balanceAmount} onChange={(event) => updateField('balanceAmount', event.target.value)} className="form-input" placeholder="4500" />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Voucher Notes & Support"
                            description="Keep requests, notes, and terms editable here. If a notes block stays empty, the downloadable voucher will hide it automatically."
                        >
                            <div className="space-y-6">
                                <ListEditor
                                    label="Special Requests"
                                    values={form.specialRequests}
                                    onChange={(values) => updateField('specialRequests', values)}
                                    helper="Examples: early check-in, room decor, parking request, floor preference."
                                />

                                <ListEditor
                                    label="Inclusions / Important Notes"
                                    values={form.inclusions}
                                    onChange={(values) => updateField('inclusions', values)}
                                    helper="Use this for meal details, package inclusions, reporting notes, or transport notes."
                                />

                                <ListEditor
                                    label="Terms & Conditions"
                                    values={form.terms}
                                    onChange={(values) => updateField('terms', values)}
                                    helper="These remain prefilled, but you can still edit them booking by booking."
                                />

                                <Field label="Guest Note">
                                    <textarea
                                        rows={4}
                                        value={form.notes}
                                        onChange={(event) => updateField('notes', event.target.value)}
                                        className="form-input min-h-[120px] resize-y"
                                        placeholder="Any extra guest-facing instruction or note"
                                    />
                                </Field>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Authorized By">
                                        <input value={form.authorizedBy} onChange={(event) => updateField('authorizedBy', event.target.value)} className="form-input" placeholder="Authorized person name" />
                                    </Field>
                                    <Field label="Customer Support">
                                        <input value={form.customerSupport} onChange={(event) => updateField('customerSupport', event.target.value)} className="form-input" placeholder="Support number" />
                                    </Field>
                                </div>

                                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">Voucher Actions</div>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Save the voucher first to unlock a working public link for WhatsApp sharing.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-70">
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                {activeVoucherId ? 'Save Changes' : 'Save Voucher'}
                                            </button>
                                            <button type="button" onClick={handleDownload} disabled={downloading} className="btn-outline px-5 py-2.5 text-sm disabled:opacity-70">
                                                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                                                Download PDF
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => shareOnWhatsApp()}
                                                disabled={!activeVoucherId}
                                                title="Share on WhatsApp"
                                                aria-label="Share on WhatsApp"
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <MessageCircle className="h-5 w-5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => copyPublicLink()}
                                                disabled={!activeVoucherId}
                                                title="Copy public link"
                                                aria-label="Copy public link"
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </form>

                    <SectionCard
                        title="Voucher Preview"
                        description={activeVoucherId
                            ? 'This preview reflects the saved voucher direction and stays visually close to the downloadable document.'
                            : 'This preview updates live while you type and stays close to the downloadable document style.'}
                    >
                        <VoucherPreview voucher={previewVoucher} />
                    </SectionCard>
                </div>
            )}
        </div>
    );
}
