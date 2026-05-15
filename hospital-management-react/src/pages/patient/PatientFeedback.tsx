import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, Loader2, MessageSquareHeart, Send, Star, ThumbsUp } from 'lucide-react';
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

interface Appointment {
    id: number;
    doctorName?: string;
    appointmentDate?: string;
    status?: string;
    reason?: string;
}

interface Feedback {
    id: number;
    rating: number;
    category?: string;
    comment?: string;
    followUpRequested?: boolean;
    createdAt?: string;
}

const RatingPicker: React.FC<{ value: number; onChange: (rating: number) => void; label: string }> = ({ value, onChange, label }) => (
    <div>
        <p className="mb-2 text-xs font-bold text-[var(--text-muted)]">{label}</p>
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(rating => (
                <button
                    key={rating}
                    type="button"
                    onClick={() => onChange(rating)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                        rating <= value ? 'border-amber-200 bg-amber-50 text-amber-500' : 'border-[var(--border-color)] text-slate-300 hover:border-amber-200'
                    }`}
                    title={`${rating} stars`}
                >
                    <Star className="h-4 w-4 fill-current" />
                </button>
            ))}
        </div>
    </div>
);

const PatientFeedback: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        appointmentId: '',
        rating: 5,
        waitTimeRating: 5,
        staffRating: 5,
        doctorRating: 5,
        category: 'Visit Experience',
        comment: '',
        followUpRequested: false,
    });

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        setMessage(null);
        try {
            const [appointmentsRes, feedbackRes] = await Promise.allSettled([
                api.get('/appointments/my?size=100'),
                api.get(`/patient-feedback/patient/${user.id}`),
            ]);
            if (appointmentsRes.status === 'fulfilled') {
                const raw = appointmentsRes.value.data?.data?.content || appointmentsRes.value.data?.data || [];
                setAppointments(Array.isArray(raw) ? raw : []);
            }
            if (feedbackRes.status === 'fulfilled') {
                setFeedback(Array.isArray(feedbackRes.value.data?.data) ? feedbackRes.value.data.data : []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    const completedAppointments = appointments.filter(appt => (appt.status || '').toUpperCase() === 'COMPLETED');
    const averageRating = useMemo(() => {
        if (feedback.length === 0) return 0;
        return feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length;
    }, [feedback]);

    const submitFeedback = async () => {
        if (!user?.id) return;
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/patient-feedback', {
                patientId: user.id,
                appointmentId: form.appointmentId ? Number(form.appointmentId) : null,
                rating: form.rating,
                waitTimeRating: form.waitTimeRating,
                staffRating: form.staffRating,
                doctorRating: form.doctorRating,
                category: form.category,
                comment: form.comment,
                followUpRequested: form.followUpRequested,
            });
            setForm(current => ({ ...current, comment: '', followUpRequested: false, rating: 5, waitTimeRating: 5, staffRating: 5, doctorRating: 5 }));
            setMessage('Thank you. Your feedback has been submitted.');
            await fetchData();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to submit feedback.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader
                title="Visit Feedback"
                description="Share your experience after visits so the hospital team can improve service quality and follow up when needed."
                icon={MessageSquareHeart}
                tone="rose"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Feedback Sent" value={feedback.length} icon={CheckCircle2} tone="emerald" helper="Total responses" />
                <PatientStatCard label="Average Rating" value={averageRating ? averageRating.toFixed(1) : '—'} icon={Star} tone="amber" helper="Your submitted ratings" />
                <PatientStatCard label="Completed Visits" value={completedAppointments.length} icon={ThumbsUp} tone="blue" helper="Eligible for feedback" />
            </div>

            {message && <PatientAlert icon={MessageSquareHeart} tone={message.startsWith('Unable') ? 'rose' : 'emerald'}>{message}</PatientAlert>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-[var(--text-color)]">Submit Feedback</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">Rate the visit and add details for the experience team.</p>
                    </div>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Related visit</span>
                            <select
                                value={form.appointmentId}
                                onChange={(event) => setForm(current => ({ ...current, appointmentId: event.target.value }))}
                                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"
                            >
                                <option value="">General feedback</option>
                                {appointments.slice(0, 20).map(appt => (
                                    <option key={appt.id} value={appt.id}>
                                        #{appt.id} {appt.doctorName || 'Doctor'} {appt.appointmentDate ? `- ${new Date(appt.appointmentDate).toLocaleDateString('en-IN')}` : ''}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <RatingPicker label="Overall rating" value={form.rating} onChange={(rating) => setForm(current => ({ ...current, rating }))} />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <RatingPicker label="Wait time" value={form.waitTimeRating} onChange={(rating) => setForm(current => ({ ...current, waitTimeRating: rating }))} />
                            <RatingPicker label="Staff" value={form.staffRating} onChange={(rating) => setForm(current => ({ ...current, staffRating: rating }))} />
                            <RatingPicker label="Doctor" value={form.doctorRating} onChange={(rating) => setForm(current => ({ ...current, doctorRating: rating }))} />
                        </div>

                        <label className="block">
                            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Category</span>
                            <select
                                value={form.category}
                                onChange={(event) => setForm(current => ({ ...current, category: event.target.value }))}
                                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"
                            >
                                {['Visit Experience', 'Doctor Consultation', 'Billing', 'Reception', 'Cleanliness', 'Portal Experience'].map(category => (
                                    <option key={category}>{category}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">Comments</span>
                            <textarea
                                rows={4}
                                value={form.comment}
                                onChange={(event) => setForm(current => ({ ...current, comment: event.target.value }))}
                                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)] outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                                placeholder="What went well? What should we improve?"
                            />
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color)]">
                            <input
                                type="checkbox"
                                checked={form.followUpRequested}
                                onChange={(event) => setForm(current => ({ ...current, followUpRequested: event.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                            />
                            I would like staff to follow up
                        </label>
                    </div>
                    <Button onClick={submitFeedback} isLoading={saving} className="mt-4 gap-2 bg-rose-600 hover:bg-rose-700">
                        <Send className="h-4 w-4" />
                        Submit Feedback
                    </Button>
                </div>

                <div className={`${patientCardClass} overflow-hidden`}>
                    <div className="border-b border-[var(--border-color)] p-5">
                        <h2 className="text-base font-bold text-[var(--text-color)]">Feedback History</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">Your most recent submissions.</p>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                        </div>
                    ) : feedback.length === 0 ? (
                        <PatientEmptyState icon={MessageSquareHeart} title="No feedback yet" description="Submitted feedback will appear here." />
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {feedback.map(item => (
                                <div key={item.id} className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex gap-0.5 text-amber-500">
                                                {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-4 w-4 ${star <= item.rating ? 'fill-current' : ''}`} />)}
                                            </div>
                                            <p className="mt-2 text-sm font-bold text-[var(--text-color)]">{item.category || 'General'}</p>
                                        </div>
                                        {item.followUpRequested && <span className="rounded-full border border-purple-100 bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">Follow-up requested</span>}
                                    </div>
                                    {item.comment && <p className="mt-2 text-sm text-[var(--text-muted)]">{item.comment}</p>}
                                    {item.createdAt && <p className="mt-3 text-xs font-semibold text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleString('en-IN')}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default PatientFeedback;
