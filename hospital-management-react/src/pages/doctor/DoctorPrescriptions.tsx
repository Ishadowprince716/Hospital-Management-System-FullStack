import React, { useCallback, useEffect, useState } from 'react';
import { Pill, Plus, Trash2, AlertCircle, Loader2, CheckCircle2, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface PrescriptionItem { medicineName: string; dosage: string; frequency: string; duration: string; }
interface Prescription { id: number; patient?: { fullName: string }; diagnosis: string; status: string; prescriptionDate: string; items?: PrescriptionItem[]; }
interface Patient { id: number; fullName: string; }

const DoctorPrescriptions: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<PrescriptionItem[]>([{ medicineName: '', dosage: '', frequency: '', duration: '' }]);
    const doctorId = user?.id;

    const fetchPrescriptions = useCallback(async () => {
        if (!doctorId) {
            setPrescriptions([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/prescriptions/doctor/${doctorId}?size=50`);
            setPrescriptions(res.data?.data?.content || []);
        } catch { setPrescriptions([]); }
        finally { setLoading(false); }
    }, [doctorId]);

    const fetchPatients = useCallback(async () => {
        try {
            const res = await api.get('/patients?size=100');
            setPatients(res.data?.data?.content || res.data?.data || []);
        } catch { setPatients([]); }
    }, []);

    useEffect(() => { fetchPrescriptions(); fetchPatients(); }, [fetchPrescriptions, fetchPatients]);

    const addItem = () => setItems([...items, { medicineName: '', dosage: '', frequency: '', duration: '' }]);
    const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
    const updateItem = (i: number, field: keyof PrescriptionItem, val: string) => {
        const updated = [...items]; updated[i] = { ...updated[i], [field]: val }; setItems(updated);
    };

    // POST — REST Create
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setError(null);
        try {
            await api.post('/prescriptions', {
                patient: { id: Number(patientId) },
                doctor: { id: doctorId },
                diagnosis, notes,
                items: items.filter(it => it.medicineName),
                status: 'ACTIVE',
            });
            setSuccess(true);
            setTimeout(() => { setSuccess(false); setShowForm(false); setDiagnosis(''); setNotes(''); setPatientId(''); setItems([{ medicineName: '', dosage: '', frequency: '', duration: '' }]); fetchPrescriptions(); }, 2000);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to create prescription.'));
        } finally { setSubmitting(false); }
    };

    // PATCH — REST Partial Update (status only)
    const patchStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/prescriptions/${id}/status?status=${status}`);
            setPrescriptions(p => p.map(x => x.id === id ? { ...x, status } : x));
        } catch { alert('Failed to update status.'); }
    };

    // DELETE — REST Remove
    const deletePrescription = async (id: number) => {
        if (!window.confirm('Delete this prescription?')) return;
        try {
            await api.delete(`/prescriptions/${id}`);
            setPrescriptions(p => p.filter(x => x.id !== id));
        } catch { alert('Failed to delete prescription.'); }
    };

    const statusColor: Record<string, string> = {
        ACTIVE: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        COMPLETED: 'text-blue-600 bg-blue-50 border-blue-200',
        CANCELLED: 'text-red-600 bg-red-50 border-red-200',
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}><Pill className="h-6 w-6 text-purple-600" /> Prescriptions</h1><p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create medication plans and keep patient prescriptions organized.</p></div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2"><Plus className="h-4 w-4" /> New Prescription</Button>
            </div>

            {/* POST Form */}
            {showForm && (
                <Card className="border-purple-200 shadow-md animate-fadeIn">
                    <CardContent className="p-6">
                        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Create Prescription</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Patient *</label>
                                    <select value={patientId} onChange={e => setPatientId(e.target.value)} required className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        <option value="">Select patient...</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Diagnosis *</label>
                                    <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Primary diagnosis" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes or instructions..." className="w-full min-h-[80px] p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>

                            {/* Medicine Items */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>Medicines</label>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-purple-600 border-purple-200 hover:bg-purple-50"><Plus className="h-3 w-3 mr-1" /> Add Medicine</Button>
                                </div>
                                <div className="space-y-2">
                                    {items.map((item, i) => (
                                        <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-[var(--border-color)] bg-gray-50/50 p-3 dark:bg-slate-800/30 sm:grid-cols-2 lg:grid-cols-4">
                                            <Input placeholder="Medicine name" value={item.medicineName} onChange={e => updateItem(i, 'medicineName', e.target.value)} className="text-sm" />
                                            <Input placeholder="Dosage (e.g. 500mg)" value={item.dosage} onChange={e => updateItem(i, 'dosage', e.target.value)} className="text-sm" />
                                            <Input placeholder="Frequency" value={item.frequency} onChange={e => updateItem(i, 'frequency', e.target.value)} className="text-sm" />
                                            <div className="flex gap-1">
                                                <Input placeholder="Duration" value={item.duration} onChange={e => updateItem(i, 'duration', e.target.value)} className="text-sm" />
                                                {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && <div className="flex items-center gap-2 p-3 rounded-lg text-red-600 bg-red-50 border border-red-200 text-sm"><AlertCircle className="h-4 w-4 shrink-0" /> {error}</div>}
                            {success && <div className="flex items-center gap-2 p-3 rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 text-sm"><CheckCircle2 className="h-4 w-4" /> Prescription created successfully!</div>}

                            <div className="flex gap-3">
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" isLoading={submitting}>Create Prescription</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Prescription List */}
            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
                        : prescriptions.length === 0 ? (
                            <div className="text-center py-16"><Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No prescriptions yet. Create your first one above.</p></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>
                                        <tr>{['Patient', 'Diagnosis', 'Date', 'Status', 'Actions'].map(h => <th key={h} className={`px-6 py-4 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]">
                                        {prescriptions.map(rx => (
                                            <tr key={rx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-color)' }}>{rx.patient?.fullName || '—'}</td>
                                                <td className="px-6 py-4 max-w-[180px] truncate" style={{ color: 'var(--text-muted)' }}>{rx.diagnosis || '—'}</td>
                                                <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{rx.prescriptionDate ? new Date(rx.prescriptionDate).toLocaleDateString() : '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[rx.status] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>{rx.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* PATCH — partial update */}
                                                        {rx.status === 'ACTIVE' && <button onClick={() => patchStatus(rx.id, 'COMPLETED')} className="px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors" title="PATCH status">✓ Complete</button>}
                                                        {/* DELETE */}
                                                        <button onClick={() => deletePrescription(rx.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="DELETE"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorPrescriptions;
