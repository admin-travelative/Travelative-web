'use client';

import {
    BUSINESS_DETAILS,
    calculateBalance,
    formatCurrency,
    formatDisplayDate,
} from '@/lib/voucherDefaults';

function displayValue(value, fallback = '-') {
    if (value === '' || value === null || value === undefined) {
        return fallback;
    }

    return value;
}

function SummaryCard({ label, value, accentClass }) {
    return (
        <div className="rounded-[22px] border border-[#eddccf] bg-white px-4 py-4">
            <div className={`text-[11px] font-bold uppercase tracking-[0.24em] ${accentClass}`}>{label}</div>
            <div className="mt-3 text-[1.7rem] font-bold leading-none text-slate-900">
                {displayValue(value)}
            </div>
        </div>
    );
}

function DetailGrid({ title, items }) {
    return (
        <section>
            <div className="mb-3 flex items-center gap-4">
                <h2 className="text-[1.05rem] font-bold text-slate-900">{title}</h2>
                <div className="h-px flex-1 bg-[#ebe5de]" />
            </div>
            <div className="overflow-hidden rounded-[20px] border border-[#eadfd4]">
                <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) => (
                        <div key={item.label} className="border-b border-r border-[#eadfd4] last:border-r-0 lg:[&:nth-child(4n)]:border-r-0">
                            <div className="bg-[#fff4e8] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7b6e5f]">
                                {item.label}
                            </div>
                            <div className="min-h-[52px] px-3 py-3 text-sm font-semibold text-slate-900">
                                {displayValue(item.value)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function NotesBlock({ voucher }) {
    const specialRequests = voucher.specialRequests?.filter(Boolean) || [];
    const inclusions = voucher.inclusions?.filter(Boolean) || [];
    const note = String(voucher.notes || '').trim();

    const groups = [
        specialRequests.length ? { title: 'Special Requests', items: specialRequests } : null,
        inclusions.length ? { title: 'Inclusions / Notes', items: inclusions } : null,
        note ? { title: 'Guest Note', items: [note] } : null,
    ].filter(Boolean);

    if (!groups.length) {
        return null;
    }

    return (
        <section className="rounded-[22px] border border-[#eadfd4] bg-white p-5">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-bold text-slate-900">Special Requests / Notes</h2>
                <div className="h-8 w-1 rounded-full bg-orange-500" />
            </div>

            <div className="mt-5 space-y-5">
                {groups.map((group) => (
                    <div key={group.title}>
                        <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-600">{group.title}</h3>
                        <div className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                            {group.items.map((item, index) => (
                                <div key={`${group.title}-${index}`} className="flex gap-3">
                                    {group.items.length > 1 ? <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" /> : null}
                                    <span className="whitespace-pre-wrap">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function TermsBlock({ voucher }) {
    const terms = voucher.terms?.filter(Boolean) || [];

    return (
        <section className="rounded-[22px] border border-[#eadfd4] bg-white p-5">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-bold text-slate-900">Terms & Conditions</h2>
                <div className="h-8 w-1 rounded-full bg-blue-500" />
            </div>

            <ol className="mt-4 space-y-2.5 text-sm leading-6 text-slate-700">
                {terms.map((term, index) => (
                    <li key={`${term}-${index}`} className="flex gap-3">
                        <span className="min-w-5 font-bold text-orange-600">{index + 1}.</span>
                        <span>{term}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

function QrPlaceholder() {
    return (
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-[#eadfd4] bg-white p-2">
            <div
                className="h-full w-full rounded-lg border border-slate-200"
                style={{
                    backgroundImage: `
                        linear-gradient(90deg, #111827 18%, transparent 18%, transparent 32%, #111827 32%, #111827 48%, transparent 48%, transparent 64%, #111827 64%, #111827 82%, transparent 82%),
                        linear-gradient(#111827 18%, transparent 18%, transparent 32%, #111827 32%, #111827 48%, transparent 48%, transparent 64%, #111827 64%, #111827 82%, transparent 82%)
                    `,
                    backgroundSize: '18px 18px',
                    backgroundPosition: '0 0, 0 0',
                }}
            />
        </div>
    );
}

export default function VoucherPreview({ voucher, previewRef }) {
    const balance = voucher.balanceAmount !== '' && voucher.balanceAmount !== undefined
        ? voucher.balanceAmount
        : calculateBalance(voucher.totalAmount, voucher.paidAmount);

    return (
        <div className="space-y-4">
            <div
                ref={previewRef}
                className="mx-auto w-full max-w-[980px] rounded-[32px] border border-[#eadfd4] bg-[#fffdfa] p-4 shadow-[0_28px_90px_rgba(15,23,42,0.08)] sm:p-6"
            >
                <div className="rounded-[28px] border border-[#eddccf] p-4 sm:p-6">
                    <div className="rounded-[26px] border border-[#ead7c6] bg-[linear-gradient(135deg,#fff6ec_0%,#fff0dc_48%,#fffaf5_100%)] p-6 sm:p-7">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 space-y-3">
                                <img src="/Travelative_logo.png" alt="Travelative" className="h-14 w-auto object-contain" />
                                <div className="text-xs font-bold uppercase tracking-[0.36em] text-orange-600">Travel Voucher</div>
                                <div className="text-[2rem] font-bold leading-[1.05] text-slate-900 sm:text-[2.65rem]">
                                    Travelative Booking Confirmation
                                </div>
                                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                    Standardized booking voucher for customer sharing, hotel check-in coordination, and payment clarity.
                                </p>
                            </div>

                            <div className="w-full max-w-[260px] rounded-[24px] border border-[#e7ddd2] bg-white px-5 py-5">
                                <div className="text-sm font-bold uppercase tracking-[0.08em] text-blue-600">{BUSINESS_DETAILS.companyName}</div>
                                <div className="mt-2 text-[1.05rem] font-bold leading-snug text-slate-900">{BUSINESS_DETAILS.officeLocation}</div>
                                <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                                    <div><span className="font-semibold text-slate-800">Contact:</span> {BUSINESS_DETAILS.contacts.join(' | ')}</div>
                                    <div><span className="font-semibold text-slate-800">Email:</span> {BUSINESS_DETAILS.email}</div>
                                    <div><span className="font-semibold text-slate-800">Website:</span> {BUSINESS_DETAILS.website}</div>
                                    <div><span className="font-semibold text-slate-800">Instagram:</span> {BUSINESS_DETAILS.instagram}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                        <SummaryCard label="Voucher No." value={voucher.voucherNumber} accentClass="text-orange-600" />
                        <SummaryCard label="Date Of Issue" value={formatDisplayDate(voucher.issueDate)} accentClass="text-blue-600" />
                        <SummaryCard label="Package / Tag" value={voucher.packageTitle || voucher.destination} accentClass="text-orange-600" />
                    </div>

                    <div className="mt-7 space-y-6">
                        <DetailGrid
                            title="Guest Details"
                            items={[
                                { label: 'Guest Name', value: voucher.customerName },
                                { label: 'Primary Contact', value: voucher.customerPhone },
                                { label: 'Email', value: voucher.customerEmail },
                                { label: 'Alternate Contact', value: voucher.alternateContact },
                            ]}
                        />

                        <DetailGrid
                            title="Booking Information"
                            items={[
                                { label: 'Hotel / Property', value: voucher.hotelName },
                                { label: 'Destination', value: voucher.destination },
                                { label: 'Check-in', value: formatDisplayDate(voucher.checkInDate) },
                                { label: 'Check-out', value: formatDisplayDate(voucher.checkOutDate) },
                                { label: 'Hotel Address', value: voucher.hotelAddress },
                                { label: 'No. Of Nights', value: voucher.numberOfNights },
                                { label: 'Room Type', value: voucher.roomType },
                                { label: 'Meal Plan', value: voucher.mealPlan },
                                { label: 'No. Of Rooms', value: voucher.numberOfRooms },
                                { label: 'Travellers', value: voucher.travelerCount },
                            ]}
                        />

                        <DetailGrid
                            title="Payment Summary"
                            items={[
                                { label: 'Total Amount', value: formatCurrency(voucher.totalAmount) },
                                { label: 'Payment Status', value: voucher.paymentStatus },
                                { label: 'Paid Amount', value: formatCurrency(voucher.paidAmount) },
                                { label: 'Balance Amount', value: formatCurrency(balance) },
                            ]}
                        />

                        <NotesBlock voucher={voucher} />
                        <TermsBlock voucher={voucher} />
                    </div>

                    <div className="mt-7 rounded-[24px] border border-[#eadfd4] bg-[#fff7f0] px-4 py-4 sm:px-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <QrPlaceholder />
                            <div className="grid flex-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-[#eadfd4] bg-white px-4 py-4">
                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Authorized By</div>
                                    <div className="mt-2 text-sm font-bold text-slate-900">{displayValue(voucher.authorizedBy)}</div>
                                </div>
                                <div className="rounded-2xl border border-[#eadfd4] bg-white px-4 py-4">
                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Customer Support</div>
                                    <div className="mt-2 text-sm font-bold text-slate-900">{displayValue(voucher.customerSupport)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
