import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, ClipboardCheck, Loader2, RefreshCw, Search, Truck, WalletCards } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Plan {
    id: number; patientName?: string; doctorName?: string; status: string; plannedDischargeDate?: string; diagnosis?: string;
    transportRequired?: boolean; billingCleared?: boolean; redFlags?: string;
}

const DischargeBoard: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ACTIVE');

    const fetchPlans = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/discharge-plans');
            setPlans(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load discharge plans.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    const stats = useMemo(() => ({
        draft: plans.filter(p => p.status === 'DRAFT').length,
        ready: plans.filter(p => p.status === 'READY').length,
        completed: plans.filter(p => p.status === 'COMPLETED').length,
        blocked: plans.filter(p => !p.billingCleared).length,
    }), [plans]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return plans.filter(plan => {
            const matchesFilter = filter === 'ALL' || (filter === 'ACTIVE' && plan.status !== 'COMPLETED') || plan.status === filter || (filter === 'BILLING_BLOCKED' && !plan.billingCleared);
            const matchesSearch = !term || (plan.patientName || '').toLowerCase().includes(term) || (plan.doctorName || '').toLowerCase().includes(term) || (plan.diagnosis || '').toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [filter, plans, search]);

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]"><ClipboardCheck className="h-6 w-6 text-emerald-600" /> Discharge Board</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Monitor discharge readiness, billing clearance, transport needs, and patient instructions.</p></div>
                <Button onClick={fetchPlans} variant="outline" className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[[CalendarCheck, 'Draft', stats.draft], [ClipboardCheck, 'Ready', stats.ready], [ClipboardCheck, 'Completed', stats.completed], [WalletCards, 'Billing Blocked', stats.blocked]].map(([Icon, label, value]) => {
                    const IconComp = Icon as typeof CalendarCheck;
                    return <div key={label as string} className="stat-card"><IconComp className="mb-2 h-5 w-5 text-emerald-600" /><p className="text-2xl font-bold text-[var(--text-color)]">{value as number}</p><p className="text-sm text-[var(--text-muted)]">{label as string}</p></div>;
                })}
            </div>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, doctor, diagnosis..." className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-3 text-sm text-[var(--text-color)]" /></div>
                <div className="flex flex-wrap gap-2">{['ACTIVE', 'ALL', 'DRAFT', 'READY', 'COMPLETED', 'BILLING_BLOCKED'].map(v => <button key={v} onClick={() => setFilter(v)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filter === v ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-emerald-300'}`}>{v.replace('_', ' ')}</button>)}</div>
            </div>
            <Card><CardContent className="p-0">
                {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div> : filtered.length === 0 ? <div className="py-16 text-center text-sm text-[var(--text-muted)]">No discharge plans found.</div> : <div className="divide-y divide-[var(--border-color)]">{filtered.map(plan => <div key={plan.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_220px] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-bold text-[var(--text-color)]">{plan.patientName}</h2><span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{plan.status}</span>{plan.transportRequired && <Truck className="h-4 w-4 text-amber-600" />}{!plan.billingCleared && <WalletCards className="h-4 w-4 text-red-600" />}</div><p className="mt-2 text-sm text-[var(--text-muted)]">{plan.diagnosis || 'No diagnosis recorded.'}</p><p className="mt-2 text-xs font-semibold text-[var(--text-muted)]">Doctor: {plan.doctorName || '—'}</p>{plan.redFlags && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{plan.redFlags}</p>}</div><div className="text-sm font-semibold text-[var(--text-muted)]">{plan.plannedDischargeDate ? new Date(plan.plannedDischargeDate).toLocaleDateString('en-IN') : 'No date'}<div className={`mt-2 rounded-full px-2 py-1 text-center text-xs font-bold ${plan.billingCleared ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{plan.billingCleared ? 'Billing cleared' : 'Billing pending'}</div></div></div>)}</div>}
            </CardContent></Card>
        </div>
    );
};

export default DischargeBoard;
