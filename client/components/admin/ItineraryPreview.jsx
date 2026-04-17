'use client';

import { ITINERARY_BUSINESS_DETAILS, formatDisplayDate } from '@/lib/itineraryDefaults';

function normalizeValue(value, fallback = '-') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    return String(value);
}

function SummaryCard({ label, value, accentClass = 'text-orange-600' }) {
    return (
        <div className="rounded-[24px] border border-[#ead8c7] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <div className={`text-[11px] font-bold uppercase tracking-[0.28em] ${accentClass}`}>{label}</div>
            <div className="mt-3 text-xl font-bold text-slate-900">{normalizeValue(value)}</div>
        </div>
    );
}

function GridSection({ title, fields, columns = 'lg:grid-cols-4' }) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
                <div className="h-px flex-1 bg-[#eadfd2]" />
            </div>
            <div className={`grid gap-px overflow-hidden rounded-[22px] border border-[#ead8c7] bg-[#ead8c7] sm:grid-cols-2 ${columns}`}>
                {fields.map((field) => (
                    <div key={field.label} className="bg-white">
                        <div className="bg-[#fff7ef] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.26em] text-[#8b5e34]">
                            {field.label}
                        </div>
                        <div className="px-4 py-3 text-sm font-semibold text-slate-900">{normalizeValue(field.value)}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ListBlock({ title, values, emptyLabel }) {
    const validValues = Array.isArray(values) ? values.filter((value) => String(value || '').trim()) : [];

    return (
        <div className="rounded-[24px] border border-[#ead8c7] bg-white px-5 py-5">
            <h4 className="text-lg font-bold text-slate-900">{title}</h4>
            {validValues.length ? (
                <ol className="mt-4 space-y-3">
                    {validValues.map((value, index) => (
                        <li key={`${title}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-700">
                            <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600">
                                {index + 1}
                            </span>
                            <span>{value}</span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="mt-4 text-sm text-slate-400">{emptyLabel}</p>
            )}
        </div>
    );
}

export default function ItineraryPreview({ itinerary }) {
    const days = Array.isArray(itinerary.dayPlans) && itinerary.dayPlans.length
        ? itinerary.dayPlans.filter((day) => day.dayLabel || day.title || day.location || day.planSummary || day.stay || day.meals)
        : [];

    return (
        <div className="mx-auto max-w-[1120px] rounded-[36px] border border-[#ecd9c8] bg-[#fffdf9] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-6 lg:p-8">
            <div className="rounded-[30px] border border-[#ead8c7] bg-gradient-to-br from-[#fff4e7] via-[#fff9f2] to-white p-5 sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                        <img src="/Travelative_logo.png" alt="Travelative" className="h-16 w-auto sm:h-20" />
                        <div className="mt-4 text-[12px] font-bold uppercase tracking-[0.34em] text-orange-600">Travel Itinerary</div>
                        <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-[2.4rem]">
                            {normalizeValue(itinerary.packageTitle, 'Travelative Holiday Plan')}
                        </h2>
                        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                            {normalizeValue(
                                itinerary.overview,
                                'A professionally prepared itinerary that keeps your entire travel plan, stay flow, and essential guidance in one place.'
                            )}
                        </p>
                    </div>

                    <div className="w-full max-w-[320px] rounded-[26px] border border-[#ead8c7] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                        <div className="text-sm font-bold uppercase tracking-[0.08em] text-blue-600">{ITINERARY_BUSINESS_DETAILS.companyName}</div>
                        <div className="mt-3 text-xl font-bold text-slate-900">{ITINERARY_BUSINESS_DETAILS.officeLocation}</div>
                        <div className="mt-4 space-y-2 text-base leading-7 text-slate-700">
                            <p><span className="font-semibold text-slate-900">Contact:</span> {ITINERARY_BUSINESS_DETAILS.contacts.join(' | ')}</p>
                            <p><span className="font-semibold text-slate-900">Email:</span> {ITINERARY_BUSINESS_DETAILS.email}</p>
                            <p><span className="font-semibold text-slate-900">Website:</span> {ITINERARY_BUSINESS_DETAILS.website}</p>
                            <p><span className="font-semibold text-slate-900">Instagram:</span> {ITINERARY_BUSINESS_DETAILS.instagram}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Itinerary No." value={itinerary.itineraryNumber} />
                <SummaryCard label="Issue Date" value={formatDisplayDate(itinerary.issueDate)} accentClass="text-blue-600" />
                <SummaryCard label="Destination" value={itinerary.destination} />
                <SummaryCard label="Duration" value={itinerary.durationLabel} accentClass="text-blue-600" />
            </div>

            <div className="mt-8 space-y-8">
                <GridSection
                    title="Traveler Details"
                    fields={[
                        { label: 'Traveler Name', value: itinerary.travelerName },
                        { label: 'Primary Contact', value: itinerary.travelerPhone },
                        { label: 'Email', value: itinerary.travelerEmail },
                        { label: 'Alternate Contact', value: itinerary.alternateContact },
                    ]}
                />

                <GridSection
                    title="Trip Essentials"
                    fields={[
                        { label: 'Start Date', value: formatDisplayDate(itinerary.travelStartDate) },
                        { label: 'End Date', value: formatDisplayDate(itinerary.travelEndDate) },
                        { label: 'Traveler Count', value: itinerary.travelerCount },
                        { label: 'Pickup Point', value: itinerary.pickupPoint },
                        { label: 'Drop Point', value: itinerary.dropPoint },
                        { label: 'Hotel Summary', value: itinerary.hotelSummary },
                        { label: 'Transport', value: itinerary.transportSummary },
                        { label: 'Destination Focus', value: itinerary.destination },
                    ]}
                />

                <section className="space-y-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold text-slate-900">Day Wise Plan</h3>
                        <div className="h-px flex-1 bg-[#eadfd2]" />
                    </div>

                    <div className="space-y-4">
                        {days.length ? (
                            days.map((day, index) => (
                                <div key={`${day.dayLabel}-${index}`} className="rounded-[26px] border border-[#ead8c7] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="text-[12px] font-bold uppercase tracking-[0.3em] text-orange-600">
                                                {normalizeValue(day.dayLabel, `Day ${index + 1}`)}
                                            </div>
                                            <h4 className="mt-2 text-2xl font-bold text-slate-900">{normalizeValue(day.title, 'Plan for the day')}</h4>
                                            <div className="mt-2 text-sm font-medium text-slate-500">
                                                {[formatDisplayDate(day.date), normalizeValue(day.location, '')]
                                                    .filter((value) => value && value !== '-')
                                                    .join(' • ') || 'Date and location can be added here'}
                                            </div>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px]">
                                            <div className="rounded-2xl border border-[#ead8c7] bg-[#fff8f1] px-4 py-3">
                                                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8b5e34]">Stay</div>
                                                <div className="mt-2 text-sm font-semibold text-slate-900">{normalizeValue(day.stay)}</div>
                                            </div>
                                            <div className="rounded-2xl border border-[#ead8c7] bg-[#f7fbff] px-4 py-3">
                                                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">Meals</div>
                                                <div className="mt-2 text-sm font-semibold text-slate-900">{normalizeValue(day.meals)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-[22px] border border-[#f0e3d7] bg-[#fffdf9] px-5 py-4 text-sm leading-7 text-slate-700">
                                        {normalizeValue(day.planSummary, 'Detailed activity flow will be added here.')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-[24px] border border-dashed border-[#ead8c7] bg-white px-6 py-12 text-center text-sm text-slate-400">
                                Start adding day plans to see the itinerary structure here.
                            </div>
                        )}
                    </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-3">
                    <ListBlock title="Inclusions" values={itinerary.inclusions} emptyLabel="No inclusions added." />
                    <ListBlock title="Exclusions" values={itinerary.exclusions} emptyLabel="No exclusions added." />
                    <ListBlock title="Important Notes" values={itinerary.importantNotes} emptyLabel="No important notes added." />
                </div>

                <div className="grid gap-4 rounded-[28px] border border-[#ead8c7] bg-white p-5 md:grid-cols-2">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8b5e34]">Authorized By</div>
                        <div className="mt-3 text-lg font-bold text-slate-900">{normalizeValue(itinerary.authorizedBy)}</div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-600">Customer Support</div>
                        <div className="mt-3 text-lg font-bold text-slate-900">{normalizeValue(itinerary.customerSupport || ITINERARY_BUSINESS_DETAILS.contacts[0])}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
