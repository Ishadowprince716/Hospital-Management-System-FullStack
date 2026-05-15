import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, CalendarCheck, ClipboardCheck, Loader2, Pill, ShieldAlert } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { PatientAlert, PatientEmptyState, PatientPageFrame, PatientPageHeader, PatientStatCard, patientCardClass } from '../../components/patient/PatientPanel';

interface Plan {
    id: number; doctorName?: string; status: string; plannedDischargeDate?: string; diagnosis?: string;
    medicationInstructions?: string; careInstructions?: string; followUpPlan?: string; redFlags?: string;
    transportRequired?: boolean; billingCleared?: boolean;
}

const DischargeInstructions: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        const fetchPlans = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/discharge-plans/patient/${user.id}`);
                setPlans(Array.isArray(res.data?.data) ? res.data.data : []);
            } catch (err: unknown) {
                setError(getApiErrorMessage(err, 'Unable to load discharge instructions.'));
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, [user?.id]);

    const latest = plans[0];
    const stats = useMemo(() => ({
        ready: plans.filter(p => p.status === 'READY').length,
        completed: plans.filter(p => p.status === 'COMPLETED').length,
        redFlags: plans.filter(p => p.redFlags).length,
    }), [plans]);

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader title="Discharge Instructions" description="Review hospital discharge guidance, medicines, follow-up plans, and warning signs from your care team." icon={ClipboardCheck} tone="emerald" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Ready Plans" value={stats.ready} icon={CalendarCheck} tone="emerald" helper="Prepared by care team" />
                <PatientStatCard label="Completed" value={stats.completed} icon={ClipboardCheck} tone="blue" helper="Discharge complete" />
                <PatientStatCard label="Warning Notes" value={stats.redFlags} icon={ShieldAlert} tone="rose" helper="Review carefully" />
            </div>
            {error && <PatientAlert icon={AlertTriangle} tone="rose">{error}</PatientAlert>}
            {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div> : plans.length === 0 ? (
                <PatientEmptyState icon={ClipboardCheck} title="No discharge plan yet" description="Your discharge instructions will appear here once your care team prepares them." />
            ) : (
                <div className="space-y-5">
                    {latest && <div className={`${patientCardClass} p-5`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div><h2 className="text-lg font-bold text-[var(--text-color)]">Latest discharge plan</h2><p className="mt-1 text-sm text-[var(--text-muted)]">By {latest.doctorName || 'care team'} {latest.plannedDischargeDate ? `for ${new Date(latest.plannedDischargeDate).toLocaleDateString('en-IN')}` : ''}</p></div>
                            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{latest.status}</span>
                        </div>
                        {latest.redFlags && <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800"><ShieldAlert className="mb-2 h-5 w-5" />{latest.redFlags}</div>}
                    </div>}
                    {plans.map(plan => <div key={plan.id} className={`${patientCardClass} p-5`}>
                        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-base font-bold text-[var(--text-color)]">{plan.diagnosis || 'Discharge plan'}</h3><span className="text-xs font-bold text-[var(--text-muted)]">{plan.status}</span></div>
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                            <section className="rounded-lg bg-blue-50 p-4 text-blue-900"><Pill className="mb-2 h-5 w-5" /><p className="text-xs font-bold uppercase">Medicines</p><p className="mt-2 text-sm">{plan.medicationInstructions || 'No medicine instructions recorded.'}</p></section>
                            <section className="rounded-lg bg-emerald-50 p-4 text-emerald-900"><ClipboardCheck className="mb-2 h-5 w-5" /><p className="text-xs font-bold uppercase">Care</p><p className="mt-2 text-sm">{plan.careInstructions || 'No care instructions recorded.'}</p></section>
                            <section className="rounded-lg bg-amber-50 p-4 text-amber-900"><CalendarCheck className="mb-2 h-5 w-5" /><p className="text-xs font-bold uppercase">Follow-up</p><p className="mt-2 text-sm">{plan.followUpPlan || 'No follow-up plan recorded.'}</p></section>
                        </div>
                    </div>)}
                </div>
            )}
        </PatientPageFrame>
    );
};

export default DischargeInstructions;
