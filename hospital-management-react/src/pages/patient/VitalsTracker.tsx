import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Activity, HeartPulse, Loader2, Plus, RefreshCw, Thermometer, Wind } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import {
    PatientAlert,
    PatientEmptyState,
    PatientPageFrame,
    PatientPageHeader,
    PatientStatCard,
    patientCardClass,
} from '../../components/patient/PatientPanel';

interface VitalSigns {
    id: number;
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    notes?: string;
    recordedAt?: string;
}

const initialForm = {
    bloodPressure: '120/80',
    pulse: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    notes: '',
};

const unwrapList = <T,>(payload: unknown): T[] => {
    const data = payload && typeof payload === 'object' && 'data' in payload ? (payload as { data?: unknown }).data : payload;
    return Array.isArray(data) ? data as T[] : [];
};

const toNumberOrUndefined = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const getPulseStatus = (pulse?: number) => {
    if (!pulse) return { label: 'No pulse', className: 'bg-slate-50 text-slate-600 border-slate-100' };
    if (pulse < 60 || pulse > 100) return { label: 'Review pulse', className: 'bg-amber-50 text-amber-700 border-amber-100' };
    return { label: 'Normal pulse', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
};

const getOxygenStatus = (spo2?: number) => {
    if (!spo2) return { label: 'No SpO2', className: 'bg-slate-50 text-slate-600 border-slate-100' };
    if (spo2 < 94) return { label: 'Low SpO2', className: 'bg-red-50 text-red-700 border-red-100' };
    return { label: 'Healthy SpO2', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
};

const VitalsTracker: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [vitals, setVitals] = useState<VitalSigns[]>([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVitals = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/emr/patient/${user.id}/vitals`);
            setVitals(unwrapList<VitalSigns>(res.data));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load vital signs.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVitals();
    }, [user?.id]);

    const latest = vitals[0];
    const chartData = useMemo(() => vitals
        .slice(0, 10)
        .reverse()
        .map(item => ({
            label: item.recordedAt ? new Date(item.recordedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Now',
            pulse: item.pulse,
            spo2: item.oxygenSaturation,
            temp: item.temperature,
        })), [vitals]);

    const submitVitals = async () => {
        if (!user?.id) return;
        setSaving(true);
        setError(null);
        try {
            const payload = {
                bloodPressure: form.bloodPressure,
                pulse: toNumberOrUndefined(form.pulse),
                temperature: toNumberOrUndefined(form.temperature),
                respiratoryRate: toNumberOrUndefined(form.respiratoryRate),
                oxygenSaturation: toNumberOrUndefined(form.oxygenSaturation),
                weight: toNumberOrUndefined(form.weight),
                height: toNumberOrUndefined(form.height),
                notes: form.notes,
            };
            await api.post(`/emr/patient/${user.id}/vitals`, payload);
            setForm(initialForm);
            await fetchVitals();
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to save vital signs.'));
        } finally {
            setSaving(false);
        }
    };

    const pulseStatus = getPulseStatus(latest?.pulse);
    const oxygenStatus = getOxygenStatus(latest?.oxygenSaturation);

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader
                title="Vitals Tracker"
                description="Record blood pressure, pulse, oxygen, temperature, breathing rate, and body metrics with trend visibility for follow-up care."
                icon={HeartPulse}
                tone="rose"
                action={
                    <Button onClick={fetchVitals} variant="outline" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <PatientStatCard label="Pulse" value={latest?.pulse ? `${latest.pulse} bpm` : '—'} icon={Activity} tone="rose" helper={pulseStatus.label} />
                <PatientStatCard label="SpO2" value={latest?.oxygenSaturation ? `${latest.oxygenSaturation}%` : '—'} icon={Wind} tone="emerald" helper={oxygenStatus.label} />
                <PatientStatCard label="Temperature" value={latest?.temperature ? `${latest.temperature}°C` : '—'} icon={Thermometer} tone="amber" helper="Latest reading" />
                <PatientStatCard label="BMI" value={latest?.bmi ? latest.bmi.toFixed(1) : '—'} icon={HeartPulse} tone="blue" helper={latest?.weight ? `${latest.weight} kg` : 'Weight not recorded'} />
            </div>

            {error && <PatientAlert icon={HeartPulse} tone="rose">{error}</PatientAlert>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-[var(--text-color)]">Add Vitals</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">Save a new reading to your medical timeline.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                            ['bloodPressure', 'Blood Pressure', '120/80'],
                            ['pulse', 'Pulse', '78'],
                            ['temperature', 'Temperature °C', '36.8'],
                            ['oxygenSaturation', 'SpO2 %', '98'],
                            ['respiratoryRate', 'Respiratory Rate', '16'],
                            ['weight', 'Weight kg', '72'],
                            ['height', 'Height cm', '172'],
                        ].map(([key, label, placeholder]) => (
                            <label key={key} className="block">
                                <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">{label}</span>
                                <input
                                    value={form[key as keyof typeof form]}
                                    onChange={(event) => setForm(current => ({ ...current, [key]: event.target.value }))}
                                    placeholder={placeholder}
                                    className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                                />
                            </label>
                        ))}
                        <label className="block sm:col-span-2">
                            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Notes</span>
                            <textarea
                                value={form.notes}
                                onChange={(event) => setForm(current => ({ ...current, notes: event.target.value }))}
                                rows={3}
                                placeholder="Symptoms, context, medication timing, or follow-up notes"
                                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)] outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                            />
                        </label>
                    </div>
                    <Button onClick={submitVitals} isLoading={saving} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Save Vitals
                    </Button>
                </div>

                <div className={`${patientCardClass} p-5`}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-[var(--text-color)]">Vitals Trend</h2>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">Pulse and oxygen saturation over recent readings.</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${oxygenStatus.className}`}>{oxygenStatus.label}</span>
                    </div>
                    {loading ? (
                        <div className="flex h-72 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                        </div>
                    ) : chartData.length === 0 ? (
                        <PatientEmptyState
                            icon={HeartPulse}
                            title="No vitals recorded"
                            description="Your first saved reading will create a trend chart here."
                        />
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ left: -20, right: 12, top: 12, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 8,
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text-color)',
                                        }}
                                    />
                                    <Line type="monotone" dataKey="pulse" stroke="#e11d48" strokeWidth={3} dot={{ r: 3 }} name="Pulse" />
                                    <Line type="monotone" dataKey="spo2" stroke="#059669" strokeWidth={3} dot={{ r: 3 }} name="SpO2" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className={`${patientCardClass} overflow-hidden`}>
                <div className="border-b border-[var(--border-color)] p-5">
                    <h2 className="text-base font-bold text-[var(--text-color)]">Reading History</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Most recent vitals appear first.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-[var(--text-muted)] dark:bg-slate-800/50">
                            <tr>
                                {['Date', 'BP', 'Pulse', 'Temp', 'SpO2', 'Resp.', 'BMI', 'Notes'].map(header => (
                                    <th key={header} className="px-5 py-3 font-bold">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {vitals.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                                    <td className="px-5 py-4 font-semibold text-[var(--text-color)]">{item.recordedAt ? new Date(item.recordedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                                    <td className="px-5 py-4 text-[var(--text-muted)]">{item.bloodPressure || '—'}</td>
                                    <td className="px-5 py-4 text-[var(--text-muted)]">{item.pulse || '—'}</td>
                                    <td className="px-5 py-4 text-[var(--text-muted)]">{item.temperature || '—'}</td>
                                    <td className="px-5 py-4 text-[var(--text-muted)]">{item.oxygenSaturation || '—'}</td>
                                    <td className="px-5 py-4 text-[var(--text-muted)]">{item.respiratoryRate || '—'}</td>
                                    <td className="px-5 py-4 text-[var(--text-muted)]">{item.bmi ? item.bmi.toFixed(1) : '—'}</td>
                                    <td className="max-w-[260px] truncate px-5 py-4 text-[var(--text-muted)]" title={item.notes || ''}>{item.notes || '—'}</td>
                                </tr>
                            ))}
                            {!loading && vitals.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-5 py-10 text-center text-[var(--text-muted)]">No readings yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default VitalsTracker;
