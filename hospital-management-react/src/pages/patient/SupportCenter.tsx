import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, Headphones, Loader2, MessageSquarePlus, Send, Timer } from 'lucide-react';
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

interface Ticket {
    id: number;
    requesterName?: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    description: string;
    adminNote?: string;
    createdAt?: string;
    updatedAt?: string;
}

const statusStyle: Record<string, string> = {
    OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
    WAITING_ON_PATIENT: 'bg-purple-50 text-purple-700 border-purple-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const SupportCenter: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        subject: '',
        category: 'Appointments',
        priority: 'MEDIUM',
        description: '',
    });

    const fetchTickets = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/support-tickets/user/${user.id}`);
            setTickets(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load support tickets.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [user?.id]);

    const stats = useMemo(() => ({
        open: tickets.filter(ticket => ticket.status === 'OPEN').length,
        active: tickets.filter(ticket => ['OPEN', 'IN_PROGRESS', 'WAITING_ON_PATIENT'].includes(ticket.status)).length,
        resolved: tickets.filter(ticket => ticket.status === 'RESOLVED').length,
    }), [tickets]);

    const submitTicket = async () => {
        if (!user?.id || !form.subject.trim() || !form.description.trim()) {
            setError('Subject and details are required.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await api.post('/support-tickets', {
                requesterId: user.id,
                ...form,
            });
            setForm({ subject: '', category: 'Appointments', priority: 'MEDIUM', description: '' });
            await fetchTickets();
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to create support ticket.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader
                title="Support Center"
                description="Raise billing, appointment, portal, prescription, or medical-record support requests and track staff follow-up."
                icon={Headphones}
                tone="purple"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Open" value={stats.open} icon={AlertCircle} tone="blue" helper="New requests" />
                <PatientStatCard label="Active" value={stats.active} icon={Timer} tone="amber" helper="In staff workflow" />
                <PatientStatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="emerald" helper="Closed requests" />
            </div>

            {error && <PatientAlert icon={AlertCircle} tone="rose">{error}</PatientAlert>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-[var(--text-color)]">New Request</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">Describe the issue so staff can route it quickly.</p>
                    </div>
                    <div className="space-y-3">
                        <label className="block">
                            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Subject</span>
                            <input
                                value={form.subject}
                                onChange={(event) => setForm(current => ({ ...current, subject: event.target.value }))}
                                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)] outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                                placeholder="Ex: Need help rescheduling appointment"
                            />
                        </label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="block">
                                <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Category</span>
                                <select
                                    value={form.category}
                                    onChange={(event) => setForm(current => ({ ...current, category: event.target.value }))}
                                    className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"
                                >
                                    {['Appointments', 'Billing', 'Portal Access', 'Medical Records', 'Prescriptions', 'Other'].map(category => (
                                        <option key={category}>{category}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Priority</span>
                                <select
                                    value={form.priority}
                                    onChange={(event) => setForm(current => ({ ...current, priority: event.target.value }))}
                                    className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </label>
                        </div>
                        <label className="block">
                            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Details</span>
                            <textarea
                                value={form.description}
                                onChange={(event) => setForm(current => ({ ...current, description: event.target.value }))}
                                rows={5}
                                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)] outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                                placeholder="Add dates, bill numbers, appointment details, or anything staff should know."
                            />
                        </label>
                    </div>
                    <Button onClick={submitTicket} isLoading={saving} className="mt-4 gap-2 bg-purple-600 hover:bg-purple-700">
                        <Send className="h-4 w-4" />
                        Submit Request
                    </Button>
                </div>

                <div className={`${patientCardClass} overflow-hidden`}>
                    <div className="border-b border-[var(--border-color)] p-5">
                        <h2 className="text-base font-bold text-[var(--text-color)]">My Requests</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">Latest updates from the support team.</p>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <PatientEmptyState
                            icon={MessageSquarePlus}
                            title="No support requests"
                            description="Requests you submit will appear here with staff notes and status."
                        />
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {tickets.map(ticket => (
                                <div key={ticket.id} className="p-5">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-bold text-[var(--text-color)]">{ticket.subject}</h3>
                                            <p className="mt-1 text-sm text-[var(--text-muted)]">{ticket.description}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle[ticket.status] || statusStyle.OPEN}`}>
                                            {ticket.status.replaceAll('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-muted)]">
                                        <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{ticket.category}</span>
                                        <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{ticket.priority}</span>
                                        {ticket.updatedAt && <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{new Date(ticket.updatedAt).toLocaleDateString('en-IN')}</span>}
                                    </div>
                                    {ticket.adminNote && (
                                        <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                                            {ticket.adminNote}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default SupportCenter;
