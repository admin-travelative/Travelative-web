'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileDown, Loader2, Map, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import ItineraryPreview from '@/components/admin/ItineraryPreview';
import { createEmptyDayPlan, createEmptyItineraryForm, buildItineraryPayload, formatDisplayDate, itineraryToForm } from '@/lib/itineraryDefaults';
import { downloadAdminItineraryPdf, downloadSavedItineraryPdf } from '@/lib/itineraryPdf';

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

function ListEditor({ label, values, onChange, helper, buttonLabel = 'Add line' }) {
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
                    {buttonLabel}
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

function DayPlanEditor({ day, index, onChange, onRemove, disableRemove }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-600">{day.dayLabel || `Day ${index + 1}`}</div>
                    <div className="mt-1 text-sm text-slate-500">Plan the full flow for this day, including movement, stay, and meals.</div>
                </div>
                <button
                    type="button"
                    disabled={disableRemove}
                    onClick={onRemove}
                    className="rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                >
                    <Trash2 className="mr-1.5 inline h-3.5 w-3.5" />
                    Remove day
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Day Label">
                    <input value={day.dayLabel} onChange={(event) => onChange({ ...day, dayLabel: event.target.value })} className="form-input" placeholder={`Day ${index + 1}`} />
                </Field>
                <Field label="Day Title">
                    <input value={day.title} onChange={(event) => onChange({ ...day, title: event.target.value })} className="form-input" placeholder="Arrival and local exploration" />
                </Field>
                <Field label="Date">
                    <input type="date" value={day.date} onChange={(event) => onChange({ ...day, date: event.target.value })} className="form-input" />
                </Field>
                <Field label="Location">
                    <input value={day.location} onChange={(event) => onChange({ ...day, location: event.target.value })} className="form-input" placeholder="Shimla" />
                </Field>
                <Field label="Stay">
                    <input value={day.stay} onChange={(event) => onChange({ ...day, stay: event.target.value })} className="form-input" placeholder="Overnight in Shimla" />
                </Field>
                <Field label="Meals">
                    <input value={day.meals} onChange={(event) => onChange({ ...day, meals: event.target.value })} className="form-input" placeholder="Breakfast, Dinner" />
                </Field>
            </div>

            <div className="mt-4">
                <Field label="Plan Summary">
                    <textarea
                        rows={4}
                        value={day.planSummary}
                        onChange={(event) => onChange({ ...day, planSummary: event.target.value })}
                        className="form-input min-h-[140px] resize-y"
                        placeholder="Write the full day flow here: pickup timing, sightseeing order, check-in plan, meal break, and anything the guest should know."
                    />
                </Field>
            </div>
        </div>
    );
}

export default function ItinerariesClient() {
    const [mode, setMode] = useState('editor');
    const [form, setForm] = useState(createEmptyItineraryForm);
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [activeItineraryId, setActiveItineraryId] = useState(null);
    const [search, setSearch] = useState('');
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchItineraries();
    }, []);

    async function fetchItineraries() {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/itineraries`, {
                headers: getAuthHeaders(),
                credentials: 'include',
            });
            const data = await response.json();
            setItineraries(Array.isArray(data) ? data : []);
        } catch {
            setError('Unable to load saved itineraries.');
        } finally {
            setLoading(false);
        }
    }

    const filteredItineraries = useMemo(() => {
        const query = search.toLowerCase();

        return itineraries.filter((itinerary) =>
            [itinerary.itineraryNumber, itinerary.packageTitle, itinerary.travelerName, itinerary.travelerPhone, itinerary.destination]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        );
    }, [search, itineraries]);

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function updateDayPlan(index, nextDay) {
        setForm((current) => ({
            ...current,
            dayPlans: current.dayPlans.map((day, itemIndex) => (itemIndex === index ? nextDay : day)),
        }));
    }

    function addDayPlan() {
        setForm((current) => ({
            ...current,
            dayPlans: [...current.dayPlans, createEmptyDayPlan(current.dayPlans.length)],
        }));
    }

    function removeDayPlan(index) {
        setForm((current) => ({
            ...current,
            dayPlans: current.dayPlans.filter((_, itemIndex) => itemIndex !== index),
        }));
    }

    function handleNewItinerary() {
        setActiveItineraryId(null);
        setForm(createEmptyItineraryForm());
        setMode('editor');
        setError('');
        setNotice('A fresh itinerary draft is ready.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleLoadItinerary(itinerary) {
        setActiveItineraryId(itinerary._id);
        setForm(itineraryToForm(itinerary));
        setMode('editor');
        setError('');
        setNotice(`Itinerary ${itinerary.itineraryNumber} is now open in the editor.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError('');
        setNotice('');

        const payload = buildItineraryPayload(form);
        if (!payload.packageTitle || !payload.travelerName || !payload.travelerPhone) {
            setSaving(false);
            setError('Package title, traveler name, and primary contact are required.');
            return;
        }

        try {
            const response = await fetch(
                activeItineraryId ? `${API_URL}/api/admin/itineraries/${activeItineraryId}` : `${API_URL}/api/admin/itineraries`,
                {
                    method: activeItineraryId ? 'PUT' : 'POST',
                    headers: getAuthHeaders(),
                    credentials: 'include',
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to save the itinerary.');

            setActiveItineraryId(data._id);
            setForm(itineraryToForm(data));
            await fetchItineraries();
            setNotice(activeItineraryId ? 'Itinerary updated successfully.' : 'Itinerary created successfully.');
        } catch (saveError) {
            setError(saveError.message || 'Unable to save the itinerary.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(itinerary) {
        if (!window.confirm(`Delete itinerary "${itinerary.itineraryNumber}"?`)) return;
        setDeletingId(itinerary._id);

        try {
            const response = await fetch(`${API_URL}/api/admin/itineraries/${itinerary._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                credentials: 'include',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to delete the itinerary.');

            if (activeItineraryId === itinerary._id) {
                handleNewItinerary();
            }

            await fetchItineraries();
            setNotice('Itinerary deleted successfully.');
        } catch (deleteError) {
            setError(deleteError.message || 'Unable to delete the itinerary.');
        } finally {
            setDeletingId(null);
        }
    }

    async function handleDownloadDraft() {
        setDownloading(true);
        setError('');

        try {
            const payload = buildItineraryPayload(form);
            await downloadAdminItineraryPdf(payload, `${payload.itineraryNumber || 'travelative-itinerary'}.pdf`);
            setNotice('The itinerary PDF has been downloaded.');
        } catch (downloadError) {
            setError(downloadError.message || 'Unable to download the itinerary PDF.');
        } finally {
            setDownloading(false);
        }
    }

    async function handleDownloadSaved(itinerary) {
        setDownloadingId(itinerary._id);
        setError('');

        try {
            await downloadSavedItineraryPdf(itinerary._id, `${itinerary.itineraryNumber || 'travelative-itinerary'}.pdf`);
            setNotice('The saved itinerary PDF has been downloaded.');
        } catch (downloadError) {
            setError(downloadError.message || 'Unable to download the itinerary PDF.');
        } finally {
            setDownloadingId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.34em] text-orange-600">Admin Itinerary Studio</p>
                        <h1 className="mt-3 text-3xl font-bold text-slate-900">Travel Itinerary Creator</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                            Build professional day-wise itineraries, maintain a searchable history, and download polished PDFs without creating any public sharing link.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <ModeButton active={mode === 'editor'} onClick={() => setMode('editor')}>
                            <Plus className="h-4 w-4" /> New Itinerary
                        </ModeButton>
                        <ModeButton active={mode === 'history'} onClick={() => setMode('history')}>
                            <Map className="h-4 w-4" /> History
                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${mode === 'history' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {itineraries.length}
                            </span>
                        </ModeButton>
                    </div>
                </div>
            </div>

            {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</div> : null}
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}

            {mode === 'history' ? (
                <SectionCard
                    title="Generated Itinerary History"
                    description="Search previously saved itineraries, reopen them in the editor, or download a ready PDF anytime."
                >
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-slate-500">{itineraries.length} itinerary records available</div>
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search itinerary, traveler, destination..."
                                className="form-input pl-10"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    ) : filteredItineraries.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center text-sm text-slate-400">
                            No itinerary records matched your search.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredItineraries.map((itinerary) => (
                                <div key={itinerary._id} className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5">
                                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                                                    <Map className="h-3.5 w-3.5" />
                                                    {itinerary.itineraryNumber}
                                                </span>
                                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                                    {formatDisplayDate(itinerary.issueDate)}
                                                </span>
                                            </div>
                                            <h3 className="mt-3 text-lg font-bold text-slate-900">{itinerary.packageTitle || 'Untitled itinerary'}</h3>
                                            <div className="mt-1 text-sm text-slate-500">
                                                {itinerary.destination || 'Destination pending'}
                                                {itinerary.durationLabel ? ` • ${itinerary.durationLabel}` : ''}
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                                                <span>Traveler: {itinerary.travelerName || '-'}</span>
                                                <span>Contact: {itinerary.travelerPhone || '-'}</span>
                                                <span>Days: {Array.isArray(itinerary.dayPlans) ? itinerary.dayPlans.length : 0}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleLoadItinerary(itinerary)}
                                                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300"
                                            >
                                                <Pencil className="mr-1.5 inline h-3.5 w-3.5" /> Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDownloadSaved(itinerary)}
                                                disabled={downloadingId === itinerary._id}
                                                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 disabled:opacity-50"
                                            >
                                                {downloadingId === itinerary._id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <FileDown className="mr-1.5 inline h-3.5 w-3.5" /> Download
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingId === itinerary._id}
                                                onClick={() => handleDelete(itinerary)}
                                                className="rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {deletingId === itinerary._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Trash2 className="mr-1.5 inline h-3.5 w-3.5" /> Delete</>}
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
                            title={activeItineraryId ? 'Edit Itinerary Details' : 'Create New Itinerary'}
                            description="Use this builder for polished internal itineraries. Saved entries stay inside admin, and downloads always come from a fixed professional PDF format."
                        >
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Field label="Itinerary Number" helper="Leave blank if you want the system to assign it on save.">
                                    <input value={form.itineraryNumber} onChange={(event) => updateField('itineraryNumber', event.target.value)} className="form-input" placeholder="TI-260413-001" />
                                </Field>
                                <Field label="Issue Date">
                                    <input type="date" value={form.issueDate} onChange={(event) => updateField('issueDate', event.target.value)} className="form-input" />
                                </Field>
                                <Field label="Package / Itinerary Title">
                                    <input value={form.packageTitle} onChange={(event) => updateField('packageTitle', event.target.value)} className="form-input" placeholder="Shimla Manali Family Escape" required />
                                </Field>
                                <Field label="Destination">
                                    <input value={form.destination} onChange={(event) => updateField('destination', event.target.value)} className="form-input" placeholder="Himachal Pradesh" />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Traveler Details"
                            description="Add the primary traveler profile exactly as it should appear on the downloadable itinerary."
                        >
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Field label="Traveler Name">
                                    <input value={form.travelerName} onChange={(event) => updateField('travelerName', event.target.value)} className="form-input" placeholder="Utkarsh Patel" required />
                                </Field>
                                <Field label="Primary Contact">
                                    <input value={form.travelerPhone} onChange={(event) => updateField('travelerPhone', event.target.value)} className="form-input" placeholder="9876543210" required />
                                </Field>
                                <Field label="Email">
                                    <input value={form.travelerEmail} onChange={(event) => updateField('travelerEmail', event.target.value)} className="form-input" placeholder="guest@example.com" />
                                </Field>
                                <Field label="Alternate Contact">
                                    <input value={form.alternateContact} onChange={(event) => updateField('alternateContact', event.target.value)} className="form-input" placeholder="Optional alternate number" />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Trip Overview"
                            description="Capture the big-picture movement for the journey before you get into day-wise planning."
                        >
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Field label="Travel Start Date">
                                    <input type="date" value={form.travelStartDate} onChange={(event) => updateField('travelStartDate', event.target.value)} className="form-input" />
                                </Field>
                                <Field label="Travel End Date">
                                    <input type="date" value={form.travelEndDate} onChange={(event) => updateField('travelEndDate', event.target.value)} className="form-input" />
                                </Field>
                                <Field label="Duration">
                                    <input value={form.durationLabel} onChange={(event) => updateField('durationLabel', event.target.value)} className="form-input" placeholder="5 Nights / 6 Days" />
                                </Field>
                                <Field label="Traveler Count">
                                    <input type="number" min="1" value={form.travelerCount} onChange={(event) => updateField('travelerCount', event.target.value)} className="form-input" placeholder="4" />
                                </Field>
                                <Field label="Pickup Point">
                                    <input value={form.pickupPoint} onChange={(event) => updateField('pickupPoint', event.target.value)} className="form-input" placeholder="Delhi Airport" />
                                </Field>
                                <Field label="Drop Point">
                                    <input value={form.dropPoint} onChange={(event) => updateField('dropPoint', event.target.value)} className="form-input" placeholder="Delhi Railway Station" />
                                </Field>
                                <Field label="Hotel Summary">
                                    <input value={form.hotelSummary} onChange={(event) => updateField('hotelSummary', event.target.value)} className="form-input" placeholder="2N Shimla + 3N Manali" />
                                </Field>
                                <Field label="Transport Summary">
                                    <input value={form.transportSummary} onChange={(event) => updateField('transportSummary', event.target.value)} className="form-input" placeholder="Private sedan with driver" />
                                </Field>
                            </div>

                            <div className="mt-4">
                                <Field label="Trip Overview">
                                    <textarea
                                        rows={4}
                                        value={form.overview}
                                        onChange={(event) => updateField('overview', event.target.value)}
                                        className="form-input min-h-[140px] resize-y"
                                        placeholder="Add a polished overview of the trip, pacing, and overall guest experience."
                                    />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Day Wise Planner"
                            description="This is the core itinerary builder. Add as many days as the trip needs and write each day in a clear guest-friendly flow."
                        >
                            <div className="space-y-4">
                                {form.dayPlans.map((day, index) => (
                                    <DayPlanEditor
                                        key={`day-plan-${index}`}
                                        day={day}
                                        index={index}
                                        disableRemove={form.dayPlans.length === 1}
                                        onChange={(nextDay) => updateDayPlan(index, nextDay)}
                                        onRemove={() => removeDayPlan(index)}
                                    />
                                ))}

                                <button
                                    type="button"
                                    onClick={addDayPlan}
                                    className="rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-50"
                                >
                                    <Plus className="mr-2 inline h-4 w-4" /> Add Another Day
                                </button>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Inclusions & Notes"
                            description="Use these blocks for what is covered, what is not, and guest-facing operational guidance."
                        >
                            <div className="space-y-6">
                                <ListEditor label="Inclusions" values={form.inclusions} onChange={(values) => updateField('inclusions', values)} helper="Examples: hotel stay, breakfast, transfers, sightseeing, permits." />
                                <ListEditor label="Exclusions" values={form.exclusions} onChange={(values) => updateField('exclusions', values)} helper="Examples: personal expenses, monument tickets, airfare, porter charges." />
                                <ListEditor label="Important Notes" values={form.importantNotes} onChange={(values) => updateField('importantNotes', values)} helper="Use this for reporting notes, weather alerts, payment reminders, or pickup instructions." />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Authorized By">
                                        <input value={form.authorizedBy} onChange={(event) => updateField('authorizedBy', event.target.value)} className="form-input" placeholder="Planner or manager name" />
                                    </Field>
                                    <Field label="Customer Support">
                                        <input value={form.customerSupport} onChange={(event) => updateField('customerSupport', event.target.value)} className="form-input" placeholder="Support number shown on itinerary" />
                                    </Field>
                                </div>

                                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">Itinerary Actions</div>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Save the itinerary into admin history, or download the current draft directly as a polished PDF.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-70">
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                {activeItineraryId ? 'Save Changes' : 'Save Itinerary'}
                                            </button>
                                            <button type="button" onClick={handleDownloadDraft} disabled={downloading} className="btn-outline px-5 py-2.5 text-sm disabled:opacity-70">
                                                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                                                Download PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </form>

                    <SectionCard
                        title="Itinerary Preview"
                        description={activeItineraryId
                            ? 'This preview reflects the saved itinerary direction and stays visually close to the downloadable document.'
                            : 'This preview updates live while you type and stays visually close to the downloadable document.'}
                    >
                        <ItineraryPreview itinerary={form} />
                    </SectionCard>
                </div>
            )}
        </div>
    );
}

