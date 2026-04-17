export const ITINERARY_BUSINESS_DETAILS = {
    companyName: 'Travelative',
    officeLocation: 'Ghaziabad, Uttar Pradesh',
    contacts: ['7088221122', '8373949613'],
    email: 'traveladvisor@travelative.com',
    website: 'www.travelative.com',
    instagram: '@TRAVELATIVEUP14',
};

export const DEFAULT_INCLUSIONS = [''];
export const DEFAULT_EXCLUSIONS = [''];
export const DEFAULT_IMPORTANT_NOTES = [''];

export function todayForInput() {
    return new Date().toISOString().split('T')[0];
}

export function createEmptyDayPlan(index = 0) {
    return {
        dayLabel: `Day ${index + 1}`,
        title: '',
        date: '',
        location: '',
        planSummary: '',
        stay: '',
        meals: '',
    };
}

export function createEmptyItineraryForm() {
    return {
        itineraryNumber: '',
        issueDate: todayForInput(),
        packageTitle: '',
        destination: '',
        travelerName: '',
        travelerPhone: '',
        travelerEmail: '',
        alternateContact: '',
        travelStartDate: '',
        travelEndDate: '',
        durationLabel: '',
        travelerCount: '',
        pickupPoint: '',
        dropPoint: '',
        hotelSummary: '',
        transportSummary: '',
        overview: '',
        dayPlans: [createEmptyDayPlan()],
        inclusions: [...DEFAULT_INCLUSIONS],
        exclusions: [...DEFAULT_EXCLUSIONS],
        importantNotes: [...DEFAULT_IMPORTANT_NOTES],
        authorizedBy: '',
        customerSupport: '',
    };
}

function normalizeArray(values, fallback = ['']) {
    const cleaned = Array.isArray(values)
        ? values.map((value) => String(value || '').trim())
        : [];

    return cleaned.length ? cleaned : [...fallback];
}

function normalizeDayPlans(values) {
    if (!Array.isArray(values) || !values.length) {
        return [createEmptyDayPlan()];
    }

    return values.map((day, index) => ({
        dayLabel: String(day?.dayLabel || `Day ${index + 1}`).trim(),
        title: String(day?.title || '').trim(),
        date: formatDateForInput(day?.date),
        location: String(day?.location || '').trim(),
        planSummary: String(day?.planSummary || '').trim(),
        stay: String(day?.stay || '').trim(),
        meals: String(day?.meals || '').trim(),
    }));
}

function formatDateForInput(value) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
}

export function itineraryToForm(itinerary) {
    return {
        itineraryNumber: itinerary.itineraryNumber || '',
        issueDate: formatDateForInput(itinerary.issueDate),
        packageTitle: itinerary.packageTitle || '',
        destination: itinerary.destination || '',
        travelerName: itinerary.travelerName || '',
        travelerPhone: itinerary.travelerPhone || '',
        travelerEmail: itinerary.travelerEmail || '',
        alternateContact: itinerary.alternateContact || '',
        travelStartDate: formatDateForInput(itinerary.travelStartDate),
        travelEndDate: formatDateForInput(itinerary.travelEndDate),
        durationLabel: itinerary.durationLabel || '',
        travelerCount: itinerary.travelerCount ?? '',
        pickupPoint: itinerary.pickupPoint || '',
        dropPoint: itinerary.dropPoint || '',
        hotelSummary: itinerary.hotelSummary || '',
        transportSummary: itinerary.transportSummary || '',
        overview: itinerary.overview || '',
        dayPlans: normalizeDayPlans(itinerary.dayPlans),
        inclusions: normalizeArray(itinerary.inclusions, DEFAULT_INCLUSIONS),
        exclusions: normalizeArray(itinerary.exclusions, DEFAULT_EXCLUSIONS),
        importantNotes: normalizeArray(itinerary.importantNotes, DEFAULT_IMPORTANT_NOTES),
        authorizedBy: itinerary.authorizedBy || '',
        customerSupport: itinerary.customerSupport || '',
    };
}

function cleanList(values = []) {
    return values
        .map((value) => String(value || '').trim())
        .filter(Boolean);
}

function cleanDayPlans(days = []) {
    return days
        .map((day, index) => ({
            dayLabel: String(day?.dayLabel || `Day ${index + 1}`).trim(),
            title: String(day?.title || '').trim(),
            date: day?.date || undefined,
            location: String(day?.location || '').trim(),
            planSummary: String(day?.planSummary || '').trim(),
            stay: String(day?.stay || '').trim(),
            meals: String(day?.meals || '').trim(),
        }))
        .filter((day) => day.dayLabel || day.title || day.location || day.planSummary || day.stay || day.meals);
}

function toOptionalNumber(value) {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildItineraryPayload(form) {
    return {
        itineraryNumber: String(form.itineraryNumber || '').trim(),
        issueDate: form.issueDate || todayForInput(),
        packageTitle: String(form.packageTitle || '').trim(),
        destination: String(form.destination || '').trim(),
        travelerName: String(form.travelerName || '').trim(),
        travelerPhone: String(form.travelerPhone || '').trim(),
        travelerEmail: String(form.travelerEmail || '').trim(),
        alternateContact: String(form.alternateContact || '').trim(),
        travelStartDate: form.travelStartDate || undefined,
        travelEndDate: form.travelEndDate || undefined,
        durationLabel: String(form.durationLabel || '').trim(),
        travelerCount: toOptionalNumber(form.travelerCount),
        pickupPoint: String(form.pickupPoint || '').trim(),
        dropPoint: String(form.dropPoint || '').trim(),
        hotelSummary: String(form.hotelSummary || '').trim(),
        transportSummary: String(form.transportSummary || '').trim(),
        overview: String(form.overview || '').trim(),
        dayPlans: cleanDayPlans(form.dayPlans),
        inclusions: cleanList(form.inclusions),
        exclusions: cleanList(form.exclusions),
        importantNotes: cleanList(form.importantNotes),
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
