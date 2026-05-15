import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRightLeft, CalendarCheck, CheckCircle2, Loader2, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { PatientAlert, PatientEmptyState, PatientPageFrame, PatientPageHeader, PatientStatCard, patientCardClass } from '../../components/patient/PatientPanel';

interface Referral {
    id: number; referringDoctorName?: string; specialty: string; priority: string; status: string; reason: string;
    preferredDate?: string; coordinatorNote?: string; notes?: string;
}

const PatientReferrals: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        const fetchReferrals = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/referrals/patient/${user.id}`);
                setReferrals(Array.isArray(res.data?.data) ? res.data.data : []);
            } catch (err: unknown) {
                setError(getApiErrorMessage(err, 'Unable to load referrals.'));
            } finally {
                setLoading(false);
            }
        };
        fetchReferrals();
    }, [user?.id]);

    const stats = useMemo(() => ({
        requested: referrals.filter(r => r.status === 'REQUESTED').length,
        scheduled: referrals.filter(r => r.status === 'SCHEDULED').length,
        urgent: referrals.filter(r => r.priority === 'URGENT').length,
    }), [referrals]);

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader title="Specialist Referrals" description="View specialist referrals, priority, scheduling status, and coordinator instructions from your care team." icon={ArrowRightLeft} tone="purple" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Requested" value={stats.requested} icon={ArrowRightLeft} tone="blue" helper="Awaiting scheduling" />
                <PatientStatCard label="Scheduled" value={stats.scheduled} icon={CalendarCheck} tone="emerald" helper="Coordinator confirmed" />
                <PatientStatCard label="Urgent" value={stats.urgent} icon={Zap} tone="rose" helper="Priority referrals" />
            </div>
            {error && <PatientAlert icon={ArrowRightLeft} tone="rose">{error}</PatientAlert>}
            {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div> : referrals.length === 0 ? (
                <PatientEmptyState icon={ArrowRightLeft} title="No referrals yet" description="Specialist referral instructions will appear here when your doctor creates one." />
            ) : (
                <div className="space-y-4">
                    {referrals.map(r => <div key={r.id} className={`${patientCardClass} p-5`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-base font-bold text-[var(--text-color)]">{r.specialty}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Referred by {r.referringDoctorName || 'Doctor'}</p></div><span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">{r.status}</span></div>
                        <p className="mt-4 text-sm text-[var(--text-muted)]">{r.reason}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-muted)]"><span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{r.priority}</span>{r.preferredDate && <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{new Date(r.preferredDate).toLocaleDateString('en-IN')}</span>}</div>
                        {r.coordinatorNote && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800"><CheckCircle2 className="mb-1 h-4 w-4" />{r.coordinatorNote}</div>}
                    </div>)}
                </div>
            )}
        </PatientPageFrame>
    );
};

export default PatientReferrals;
