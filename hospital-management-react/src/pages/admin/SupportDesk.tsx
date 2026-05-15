import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Headphones, Loader2, RefreshCw, Search, Timer } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Ticket {
    id: number;
    requesterId: number;
    requesterName?: string;
    requesterRole?: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    description: string;
    adminNote?: string;
    createdAt?: string;
    updatedAt?: string;
}

const statusClass: Record<string, string> = {
    OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
    WAITING_ON_PATIENT: 'bg-purple-50 text-purple-700 border-purple-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const priorityClass: Record<string, string> = {
    LOW: 'bg-slate-50 text-slate-700 border-slate-100',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-100',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-100',
    URGENT: 'bg-red-50 text-red-700 border-red-100',
};

const SupportDesk: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ACTIVE');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [draftNotes, setDraftNotes] = useState<Record<number, string>>({});

    const fetchTickets = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/support-tickets');
            const rows = Array.isArray(res.data?.data) ? res.data.data as Ticket[] : [];
            setTickets(rows);
            setDraftNotes(Object.fromEntries(rows.map(ticket => [ticket.id, ticket.adminNote || ''])));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load support tickets.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const stats = useMemo(() => ({
        open: tickets.filter(ticket => ticket.status === 'OPEN').length,
        active: tickets.filter(ticket => ['OPEN', 'IN_PROGRESS', 'WAITING_ON_PATIENT'].includes(ticket.status)).length,
        urgent: tickets.filter(ticket => ticket.priority === 'URGENT' || ticket.priority === 'HIGH').length,
        resolved: tickets.filter(ticket => ticket.status === 'RESOLVED').length,
    }), [tickets]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return tickets.filter(ticket => {
            const matchesStatus = statusFilter === 'ALL'
                || (statusFilter === 'ACTIVE' && ticket.status !== 'RESOLVED')
                || ticket.status === statusFilter;
            const matchesSearch = !term
                || ticket.subject.toLowerCase().includes(term)
                || ticket.description.toLowerCase().includes(term)
                || (ticket.requesterName || '').toLowerCase().includes(term)
                || ticket.category.toLowerCase().includes(term);
            return matchesStatus && matchesSearch;
        });
    }, [search, statusFilter, tickets]);

    const updateTicket = async (ticket: Ticket, status = ticket.status, priority = ticket.priority) => {
        setUpdatingId(ticket.id);
        setError(null);
        try {
            const res = await api.patch(`/support-tickets/${ticket.id}`, {
                status,
                priority,
                adminNote: draftNotes[ticket.id] || '',
            });
            const updated = res.data?.data as Ticket;
            setTickets(current => current.map(item => item.id === ticket.id ? updated : item));
            setDraftNotes(current => ({ ...current, [ticket.id]: updated.adminNote || '' }));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to update support ticket.'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]">
                        <Headphones className="h-6 w-6 text-purple-600" />
                        Support Desk
                    </h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Triage patient support requests, update priorities, and leave resolution notes.</p>
                </div>
                <Button onClick={fetchTickets} variant="outline" className="gap-2 self-start">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Open', value: stats.open, icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active', value: stats.active, icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'High Priority', value: stats.urgent, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="stat-card">
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}>
                                <Icon className={`h-5 w-5 ${item.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-[var(--text-color)]">{item.value}</p>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">{item.label}</p>
                        </div>
                    );
                })}
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search requester, subject, category..."
                        className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-3 text-sm text-[var(--text-color)] outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['ACTIVE', 'ALL', 'OPEN', 'IN_PROGRESS', 'WAITING_ON_PATIENT', 'RESOLVED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                                statusFilter === status
                                    ? 'border-purple-600 bg-purple-600 text-white'
                                    : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-purple-300'
                            }`}
                        >
                            {status.replaceAll('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <Headphones className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                            <p className="text-sm font-semibold text-[var(--text-color)]">No support tickets found</p>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">Try a different filter or search term.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {filtered.map(ticket => (
                                <div key={ticket.id} className="grid gap-4 p-5 xl:grid-cols-[1fr_260px]">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-bold text-[var(--text-color)]">{ticket.subject}</h2>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass[ticket.status] || statusClass.OPEN}`}>
                                                {ticket.status.replaceAll('_', ' ')}
                                            </span>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${priorityClass[ticket.priority] || priorityClass.MEDIUM}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">{ticket.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-muted)]">
                                            <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{ticket.requesterName || 'Unknown requester'}</span>
                                            <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{ticket.category}</span>
                                            {ticket.updatedAt && <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">Updated {new Date(ticket.updatedAt).toLocaleString('en-IN')}</span>}
                                        </div>
                                        <textarea
                                            value={draftNotes[ticket.id] || ''}
                                            onChange={(event) => setDraftNotes(current => ({ ...current, [ticket.id]: event.target.value }))}
                                            rows={3}
                                            placeholder="Add staff note or resolution update..."
                                            className="mt-4 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)] outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block">
                                            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Status</span>
                                            <select
                                                value={ticket.status}
                                                onChange={(event) => updateTicket(ticket, event.target.value, ticket.priority)}
                                                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"
                                            >
                                                <option value="OPEN">Open</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="WAITING_ON_PATIENT">Waiting on Patient</option>
                                                <option value="RESOLVED">Resolved</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Priority</span>
                                            <select
                                                value={ticket.priority}
                                                onChange={(event) => updateTicket(ticket, ticket.status, event.target.value)}
                                                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"
                                            >
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                                <option value="URGENT">Urgent</option>
                                            </select>
                                        </label>
                                        <Button
                                            onClick={() => updateTicket(ticket)}
                                            isLoading={updatingId === ticket.id}
                                            className="w-full bg-purple-600 hover:bg-purple-700"
                                        >
                                            Save Note
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SupportDesk;
