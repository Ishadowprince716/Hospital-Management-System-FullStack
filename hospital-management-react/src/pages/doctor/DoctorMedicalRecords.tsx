import React, { useEffect, useState } from 'react';
import { FileText, Plus, AlertCircle, Loader2, CheckCircle2, X, Stethoscope } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Appointment {
    id: number;
    patient?: { id: number; fullName: string };
    patientId?: number;
    patientName?: string;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
    status: string;
}

const getPatientName = (appointment: Appointment) =>
    appointment.patient?.fullName || appointment.patientName || 'Unknown Patient';

const DoctorMedicalRecords: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [completedAppts, setCompletedAppts] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);

    // Form state
    const [selectedApptId, setSelectedApptId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [prescription, setPrescription] = useState('');
    const [notes, setNotes] = useState('');
    const [treatmentPlan, setTreatmentPlan] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            // GET appointments for this doctor to pick from
            const apptRes = await api.get('/appointments/my?size=100&sort=appointmentDate,desc');
            const allAppts: Appointment[] = apptRes.data?.data?.content || [];
            setCompletedAppts(allAppts.filter(a => a.status === 'COMPLETED' || a.status === 'SCHEDULED'));
        } catch { setCompletedAppts([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [user?.id]);

    // POST /medical-records — REST Create
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApptId || !diagnosis) return;
        setSubmitting(true); setError(null);
        try {
            await api.post('/medical-records', {
                appointmentId: Number(selectedApptId),
                diagnosis, prescription, notes, treatmentPlan,
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false); setShowForm(false);
                setSelectedApptId(''); setDiagnosis(''); setPrescription(''); setNotes(''); setTreatmentPlan('');
                fetchData();
            }, 2000);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to save medical record.'));
        } finally { setSubmitting(false); }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                        <FileText className="h-6 w-6 text-teal-600" /> Medical Records
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Write post-appointment medical records and treatment plans for patients.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                    <Plus className="h-4 w-4" /> New Record
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card className="border-teal-200 shadow-md animate-fadeIn">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold" style={{ color: 'var(--text-color)' }}>
                                Write Medical Record
                            </h2>
                            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        {success ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                                <p className="font-semibold text-emerald-600">Medical record saved successfully!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Select Appointment *</label>
                                    <select value={selectedApptId} onChange={e => setSelectedApptId(e.target.value)} required
                                        className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-teal-500">
                                        <option value="">Choose appointment...</option>
                                        {completedAppts.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {getPatientName(a)} — {a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : ''} ({a.status})
                                            </option>
                                        ))}
                                    </select>
                                    {completedAppts.length === 0 && !loading && (
                                        <p className="text-xs mt-1 text-amber-500">No appointments found. Mark appointments as COMPLETED or SCHEDULED first.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Diagnosis *</label>
                                    <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Primary diagnosis" required />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-purple-600">Prescription</label>
                                        <textarea value={prescription} onChange={e => setPrescription(e.target.value)}
                                            placeholder="Medicines and dosage..."
                                            className="w-full min-h-[90px] p-3 rounded-lg border border-purple-200 bg-purple-50/40 dark:bg-purple-900/10 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Doctor's Notes</label>
                                        <textarea value={notes} onChange={e => setNotes(e.target.value)}
                                            placeholder="Observations, symptoms..."
                                            className="w-full min-h-[90px] p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-teal-600">Treatment Plan</label>
                                    <textarea value={treatmentPlan} onChange={e => setTreatmentPlan(e.target.value)}
                                        placeholder="Follow-up plan, lifestyle advice, next steps..."
                                        className="w-full min-h-[80px] p-3 rounded-lg border border-teal-200 bg-teal-50/40 dark:bg-teal-900/10 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" />
                                </div>

                                {error && <div className="flex items-center gap-2 p-3 rounded-lg text-red-600 bg-red-50 border border-red-200 text-sm"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

                                <div className="flex gap-3 pt-1">
                                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" isLoading={submitting}>Save Record</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Records Panel — appointments with inline record form trigger */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
                ) : completedAppts.length === 0 ? (
                    <Card className="border-[var(--border-color)]">
                        <CardContent className="py-16 text-center">
                            <Stethoscope className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-base font-medium" style={{ color: 'var(--text-color)' }}>No appointments yet</h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Appointments appear here once they are scheduled. Click "New Record" after completing one.</p>
                        </CardContent>
                    </Card>
                ) : (
                    completedAppts.map(appt => (
                        <div key={appt.id} className="card">
                            <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpanded(expanded === appt.id ? null : appt.id)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                                        {getPatientName(appt).charAt(0).toUpperCase() || 'P'}
                                    </div>
                                    <div>
                                        <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{getPatientName(appt)}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : ''} · {appt.reason || 'No reason specified'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${appt.status === 'COMPLETED' ? 'text-emerald-600 bg-emerald-50 border border-emerald-200' : 'text-blue-600 bg-blue-50 border border-blue-200'}`}>
                                        {appt.status}
                                    </span>
                                    <Button size="sm" variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50 text-xs"
                                        onClick={e => { e.stopPropagation(); setSelectedApptId(String(appt.id)); setShowForm(true); window.scrollTo(0,0); }}>
                                        + Write Record
                                    </Button>
                                </div>
                            </div>
                            {expanded === appt.id && (
                                <div className="border-t border-[var(--border-color)] px-5 py-4 bg-gray-50/50 dark:bg-slate-800/20 animate-fadeIn">
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        <strong style={{ color: 'var(--text-color)' }}>Patient Reason:</strong> {appt.reason || '—'}
                                    </p>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                        <strong style={{ color: 'var(--text-color)' }}>Time:</strong> {appt.appointmentTime || '—'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DoctorMedicalRecords;
