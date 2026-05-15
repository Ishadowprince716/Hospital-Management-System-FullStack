import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, CheckCircle2, ChefHat, Clock3, Loader2, Salad, Send, Utensils, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { PatientAlert, PatientEmptyState, PatientPageFrame, PatientPageHeader, PatientStatCard, patientCardClass } from '../../components/patient/PatientPanel';

interface MealRequest {
    id: number;
    mealDate: string;
    mealType: string;
    dietType: string;
    roomNumber?: string;
    allergyNotes?: string;
    preferences?: string;
    priority: string;
    status: string;
    nutritionNote?: string;
}

const statusTone: Record<string, string> = {
    REQUESTED: 'border-blue-100 bg-blue-50 text-blue-700',
    APPROVED: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    PREPARING: 'border-amber-100 bg-amber-50 text-amber-700',
    DELIVERED: 'border-purple-100 bg-purple-50 text-purple-700',
    HELD: 'border-red-100 bg-red-50 text-red-700',
};

const DietaryMeals: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [items, setItems] = useState<MealRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        mealDate: '',
        mealType: 'LUNCH',
        dietType: 'REGULAR',
        roomNumber: '',
        allergyNotes: '',
        preferences: '',
        priority: 'NORMAL',
    });

    const fetchItems = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/dietary-meals/patient/${user.id}`);
            setItems(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to load dietary requests.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [user?.id]);

    const stats = useMemo(() => ({
        requested: items.filter(item => item.status === 'REQUESTED').length,
        preparing: items.filter(item => item.status === 'PREPARING').length,
        delivered: items.filter(item => item.status === 'DELIVERED').length,
    }), [items]);

    const submit = async () => {
        if (!user?.id || !form.mealDate) {
            setMessage('Meal date is required.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/dietary-meals', {
                patientId: user.id,
                ...form,
            });
            setForm({ mealDate: '', mealType: 'LUNCH', dietType: 'REGULAR', roomNumber: '', allergyNotes: '', preferences: '', priority: 'NORMAL' });
            await fetchItems();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to submit dietary request.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader title="Dietary Meals" description="Request patient meals with diet preferences, allergy notes, and room delivery details." icon={Utensils} tone="emerald" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Requested" value={stats.requested} icon={Clock3} tone="blue" helper="Awaiting kitchen review" />
                <PatientStatCard label="Preparing" value={stats.preparing} icon={ChefHat} tone="amber" helper="Kitchen in progress" />
                <PatientStatCard label="Delivered" value={stats.delivered} icon={CheckCircle2} tone="emerald" helper="Completed meals" />
            </div>

            {message && <PatientAlert icon={Utensils} tone={message.startsWith('Unable') ? 'rose' : 'amber'}>{message}</PatientAlert>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <h2 className="text-base font-bold text-[var(--text-color)]">New Meal Request</h2>
                    <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input type="date" value={form.mealDate} onChange={e => setForm(c => ({ ...c, mealDate: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input value={form.roomNumber} onChange={e => setForm(c => ({ ...c, roomNumber: e.target.value }))} placeholder="Room / bed number" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <select value={form.mealType} onChange={e => setForm(c => ({ ...c, mealType: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>BREAKFAST</option><option>LUNCH</option><option>DINNER</option><option>SNACK</option></select>
                            <select value={form.dietType} onChange={e => setForm(c => ({ ...c, dietType: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>REGULAR</option><option>DIABETIC</option><option>LOW_SODIUM</option><option>LIQUID</option><option>SOFT</option><option>VEGAN</option><option>HIGH_PROTEIN</option></select>
                        </div>
                        <select value={form.priority} onChange={e => setForm(c => ({ ...c, priority: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>NORMAL</option><option>URGENT</option></select>
                        <textarea value={form.allergyNotes} onChange={e => setForm(c => ({ ...c, allergyNotes: e.target.value }))} rows={3} placeholder="Allergies or restrictions..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                        <textarea value={form.preferences} onChange={e => setForm(c => ({ ...c, preferences: e.target.value }))} rows={4} placeholder="Meal preferences, dislikes, appetite notes..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                        <Button onClick={submit} isLoading={saving} className="gap-2"><Send className="h-4 w-4" /> Submit Meal Request</Button>
                    </div>
                </div>

                <div className={`${patientCardClass} overflow-hidden`}>
                    <div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Meal Requests</h2></div>
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
                    ) : items.length === 0 ? (
                        <PatientEmptyState icon={Salad} title="No dietary requests" description="Meal requests and nutrition notes will appear here." />
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {items.map(item => (
                                <div key={item.id} className="p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-bold text-[var(--text-color)]">{item.mealType.replace('_', ' ')} • {item.dietType.replace('_', ' ')}</h3>
                                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusTone[item.status] || statusTone.REQUESTED}`}>{item.status.replace('_', ' ')}</span>
                                        {item.priority === 'URGENT' && <span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-xs font-bold text-red-700"><Zap className="h-3.5 w-3.5" /> URGENT</span>}
                                    </div>
                                    <p className="mt-2 text-sm text-[var(--text-muted)]">{item.mealDate}{item.roomNumber ? ` • Room ${item.roomNumber}` : ''}</p>
                                    {item.allergyNotes && <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {item.allergyNotes}</p>}
                                    {item.nutritionNote && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{item.nutritionNote}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default DietaryMeals;
