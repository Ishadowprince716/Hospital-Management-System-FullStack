import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface AvailabilitySlot {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
    isAvailable?: boolean;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SHORT: Record<string, string> = {
    MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
    FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};
const DAY_COLOR: Record<string, string> = {
    MONDAY: 'bg-blue-50 border-blue-200 text-blue-700',
    TUESDAY: 'bg-purple-50 border-purple-200 text-purple-700',
    WEDNESDAY: 'bg-teal-50 border-teal-200 text-teal-700',
    THURSDAY: 'bg-amber-50 border-amber-200 text-amber-700',
    FRIDAY: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    SATURDAY: 'bg-rose-50 border-rose-200 text-rose-700',
    SUNDAY: 'bg-gray-50 border-gray-200 text-gray-700',
};

const DoctorAvailability: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form
    const [day, setDay] = useState('MONDAY');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [slotDuration, setSlotDuration] = useState(30);
    const doctorId = user?.id;

    const fetchSlots = useCallback(async () => {
        if (!doctorId) {
            setSlots([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/doctors/${doctorId}/availability`);
            setSlots(res.data?.data || []);
        } catch { setSlots([]); } finally { setLoading(false); }
    }, [doctorId]);

    useEffect(() => { fetchSlots(); }, [fetchSlots]);

    // POST — set availability for a day
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true); setError(null);
        if (endTime <= startTime) {
            setSubmitting(false);
            setError('End time must be later than start time.');
            return;
        }
        try {
            await api.post(`/doctors/${doctorId}/availability`, {
                dayOfWeek: day, startTime, endTime, slotDuration,
            });
            setSuccess(true);
            setTimeout(() => { setSuccess(false); fetchSlots(); }, 1500);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to save schedule.'));
        } finally { setSubmitting(false); }
    };

    // DELETE — remove a slot
    const deleteSlot = async (id: number) => {
        if (!window.confirm('Remove this schedule slot?')) return;
        try {
            await api.delete(`/doctors/availability/${id}`);
            setSlots(s => s.filter(x => x.id !== id));
        } catch { alert('Failed to remove slot.'); }
    };

    // Group slots by day for visual calendar grid
    const slotsByDay: Record<string, AvailabilitySlot[]> = {};
    slots.forEach(s => {
        if (!slotsByDay[s.dayOfWeek]) slotsByDay[s.dayOfWeek] = [];
        slotsByDay[s.dayOfWeek].push(s);
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <Calendar className="h-6 w-6 text-teal-600" /> Availability Schedule
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Set your weekly working hours so patients can book appointments during your available slots.
                </p>
            </div>

            {/* Weekly calendar grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {DAYS.map(d => {
                    const daySlots = slotsByDay[d] || [];
                    return (
                        <div key={d} className={`rounded-xl border p-3 min-h-[110px] ${daySlots.length > 0 ? DAY_COLOR[d] : 'border-[var(--border-color)] bg-gray-50/30 dark:bg-slate-800/20'}`}>
                            <p className={`text-xs font-bold mb-2 ${daySlots.length > 0 ? '' : 'text-gray-400'}`}>{DAY_SHORT[d]}</p>
                            {daySlots.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center mt-4">—</p>
                            ) : (
                                daySlots.map(slot => (
                                    <div key={slot.id} className="text-xs leading-tight">
                                        <p className="font-semibold">{slot.startTime?.slice(0, 5)} – {slot.endTime?.slice(0, 5)}</p>
                                        <p className="opacity-70">{slot.slotDuration}min slots</p>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add schedule form */}
            <Card className="border-teal-200 shadow-sm">
                <CardContent className="p-5">
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                        <Plus className="h-4 w-4 text-teal-600" /> Add Working Hours
                    </h2>

                    {success && (
                        <div className="flex items-center gap-2 p-3 rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 mb-4 animate-fadeIn">
                            <CheckCircle2 className="h-4 w-4" /> Schedule saved successfully!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Day selector */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Day of Week</label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map(d => (
                                    <button key={d} type="button" onClick={() => setDay(d)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${day === d ? `${DAY_COLOR[d]} shadow-sm` : 'border-[var(--border-color)] hover:border-teal-300'}`}
                                        style={{ color: day === d ? undefined : 'var(--text-muted)' }}>
                                        {DAY_SHORT[d]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Start Time</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>End Time</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Slot Duration</label>
                                <select value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))}
                                    className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
                                    {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} minutes</option>)}
                                </select>
                            </div>
                        </div>

                        {error && <div className="flex items-center gap-2 p-3 rounded-lg text-red-600 bg-red-50 border border-red-200 text-sm"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" isLoading={submitting}>
                            Save Schedule
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Saved slots list */}
            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-7 w-7 animate-spin text-teal-600" /></div>
            ) : slots.length > 0 && (
                <Card className="border-[var(--border-color)] shadow-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>
                                    <tr>
                                        {['Day', 'Start', 'End', 'Slot Duration', 'Action'].map(h => (
                                            <th key={h} className={`px-6 py-3 ${h === 'Action' ? 'text-right' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {slots.map(slot => (
                                        <tr key={slot.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${DAY_COLOR[slot.dayOfWeek] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                    {slot.dayOfWeek}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-color)' }}>{slot.startTime?.slice(0, 5)}</td>
                                            <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-color)' }}>{slot.endTime?.slice(0, 5)}</td>
                                            <td className="px-6 py-3" style={{ color: 'var(--text-muted)' }}>{slot.slotDuration} min</td>
                                            <td className="px-6 py-3 text-right">
                                                <button onClick={() => deleteSlot(slot.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DoctorAvailability;
