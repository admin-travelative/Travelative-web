export const BUSINESS_DETAILS = {
    companyName: 'Travelative',
    tagLine: 'Premium Travel Experiences',
    officeLocation: 'Ghaziabad, Uttar Pradesh',
    contacts: ['7088221122', '8373949613'],
    email: 'traveladvisor@travelative.com',
    website: 'www.travelative.com',
    facebook: 'facebook.com/61556093471104',
    instagram: '@TRAVELATIVEUP14',
};

export const DEFAULT_TERMS = [
    'This voucher must be presented at the time of check-in.',
    'Any additional services including meals, minibar, laundry and incidentals will be charged directly by the hotel or local operator.',
    'Cancellation and refund policies will apply as per Travelative booking terms shared at the time of confirmation.',
    'Travelative is not responsible for changes in hotel policies, schedule revisions or unforeseen operational circumstances.',
    'Standard property check-in and check-out timings will apply unless specifically mentioned in this voucher.',
    'Any balance amount must be cleared as per the payment commitment shared with the booking team.',
    'Stay extension or upgrade requests are subject to availability and may involve additional charges.',
    'This voucher is issued against negotiated rates and inclusions shared by Travelative for this booking.',
];

export const DEFAULT_SPECIAL_REQUESTS = [''];
export const DEFAULT_INCLUSIONS = [''];

export function createEmptyVoucherForm() {
    return {
        voucherNumber: '',
        issueDate: todayForInput(),
        packageTitle: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        alternateContact: '',
        destination: '',
        hotelName: '',
        hotelAddress: '',
        checkInDate: '',
        checkOutDate: '',
        numberOfNights: '',
        roomType: '',
        mealPlan: '',
        numberOfRooms: '',
        travelerCount: '',
        totalAmount: '',
        paymentStatus: 'Balance Due',
        paidAmount: '',
        balanceAmount: '',
        specialRequests: [...DEFAULT_SPECIAL_REQUESTS],
        inclusions: [...DEFAULT_INCLUSIONS],
        terms: [...DEFAULT_TERMS],
        notes: '',
        authorizedBy: '',
        customerSupport: '',
    };
}

export function todayForInput() {
    return new Date().toISOString().split('T')[0];
}

export function createVoucherNumber() {
    const now = new Date();
    const datePart = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const serial = String(Math.floor(Math.random() * 900) + 100);
    return `TV-${datePart}-${serial}`;
}

export function createNewVoucherForm() {
    return createEmptyVoucherForm();
}

function normalizeArray(values, fallback = ['']) {
    const cleaned = Array.isArray(values)
        ? values.map((value) => String(value || '').trim())
        : [];

    return cleaned.length ? cleaned : [...fallback];
}

function formatDateForInput(value) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
}

export function voucherToForm(voucher) {
    return {
        voucherNumber: voucher.voucherNumber || '',
        issueDate: formatDateForInput(voucher.issueDate),
        packageTitle: voucher.packageTitle || '',
        customerName: voucher.customerName || '',
        customerPhone: voucher.customerPhone || '',
        customerEmail: voucher.customerEmail || '',
        alternateContact: voucher.alternateContact || '',
        destination: voucher.destination || '',
        hotelName: voucher.hotelName || '',
        hotelAddress: voucher.hotelAddress || '',
        checkInDate: formatDateForInput(voucher.checkInDate),
        checkOutDate: formatDateForInput(voucher.checkOutDate),
        numberOfNights: voucher.numberOfNights ?? '',
        roomType: voucher.roomType || '',
        mealPlan: voucher.mealPlan || '',
        numberOfRooms: voucher.numberOfRooms ?? '',
        travelerCount: voucher.travelerCount ?? '',
        totalAmount: voucher.totalAmount ?? '',
        paymentStatus: voucher.paymentStatus || 'Balance Due',
        paidAmount: voucher.paidAmount ?? '',
        balanceAmount: voucher.balanceAmount ?? '',
        specialRequests: normalizeArray(voucher.specialRequests, DEFAULT_SPECIAL_REQUESTS),
        inclusions: normalizeArray(voucher.inclusions, DEFAULT_INCLUSIONS),
        terms: normalizeArray(voucher.terms, DEFAULT_TERMS),
        notes: voucher.notes || '',
        authorizedBy: voucher.authorizedBy || '',
        customerSupport: voucher.customerSupport || '',
    };
}

function cleanList(values = []) {
    return values
        .map((value) => String(value || '').trim())
        .filter(Boolean);
}

function toOptionalNumber(value) {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function calculateBalance(totalAmount, paidAmount) {
    const total = Number(totalAmount || 0);
    const paid = Number(paidAmount || 0);

    if (!Number.isFinite(total) || !Number.isFinite(paid)) {
        return '';
    }

    return Math.max(total - paid, 0);
}

export function buildVoucherPayload(form) {
    const totalAmount = toOptionalNumber(form.totalAmount);
    const paidAmount = toOptionalNumber(form.paidAmount) || 0;
    const calculatedBalance = calculateBalance(totalAmount, paidAmount);
    const explicitBalance = toOptionalNumber(form.balanceAmount);

    return {
        voucherNumber: String(form.voucherNumber || '').trim(),
        issueDate: form.issueDate || todayForInput(),
        packageTitle: String(form.packageTitle || '').trim(),
        customerName: String(form.customerName || '').trim(),
        customerPhone: String(form.customerPhone || '').trim(),
        customerEmail: String(form.customerEmail || '').trim(),
        alternateContact: String(form.alternateContact || '').trim(),
        destination: String(form.destination || '').trim(),
        hotelName: String(form.hotelName || '').trim(),
        hotelAddress: String(form.hotelAddress || '').trim(),
        checkInDate: form.checkInDate || undefined,
        checkOutDate: form.checkOutDate || undefined,
        numberOfNights: toOptionalNumber(form.numberOfNights),
        roomType: String(form.roomType || '').trim(),
        mealPlan: String(form.mealPlan || '').trim(),
        numberOfRooms: toOptionalNumber(form.numberOfRooms),
        travelerCount: toOptionalNumber(form.travelerCount),
        totalAmount,
        paymentStatus: form.paymentStatus || 'Balance Due',
        paidAmount,
        balanceAmount: explicitBalance ?? calculatedBalance,
        specialRequests: cleanList(form.specialRequests),
        inclusions: cleanList(form.inclusions),
        terms: cleanList(form.terms),
        notes: String(form.notes || '').trim(),
        authorizedBy: String(form.authorizedBy || '').trim(),
        customerSupport: String(form.customerSupport || '').trim(),
    };
}

export function formatDisplayDate(value) {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

export function formatCurrency(value) {
    if (value === '' || value === null || value === undefined) return '-';

    const amount = Number(value);
    if (!Number.isFinite(amount)) return '-';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getVoucherPublicUrl(voucherId, origin) {
    return `${origin}/voucher/${voucherId}`;
}

export function buildVoucherShareText(voucher, publicUrl) {
    return [
        `Hello ${voucher.customerName || 'Guest'},`,
        '',
        'Your Travelative voucher is ready.',
        `Voucher No: ${voucher.voucherNumber || '-'}`,
        voucher.hotelName ? `Property: ${voucher.hotelName}` : null,
        voucher.checkInDate ? `Check-in: ${formatDisplayDate(voucher.checkInDate)}` : null,
        voucher.checkOutDate ? `Check-out: ${formatDisplayDate(voucher.checkOutDate)}` : null,
        '',
        `Voucher link: ${publicUrl}`,
        '',
        'Please contact Travelative support if you need any assistance.',
    ]
        .filter(Boolean)
        .join('\n');
}
