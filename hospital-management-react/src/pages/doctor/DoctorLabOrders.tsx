import React, { useEffect, useState } from 'react';
import { FlaskConical, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, Clock, X, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Patient { id: number; fullName: string; }
interface LabOrder {
    id: number;
    testName: string;
    testType: string;
    status: string;
    priority: string;
    orderDate: string;
    resultDate?: string;
    results?: string;
    notes?: string;
    patient?: Patient;
}

const PRIORITIES = ['ROUTINE', 'URGENT', 'STAT'];
const STATUSES   = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const TESTS = ['Complete Blood Count (CBC)', 'Lipid Panel', 'Blood Glucose', 'Urinalysis', 'Thyroid Function (TSH)', 'Liver Function', 'Kidney Function (BMP)', 'HbA1c', 'X-Ray', 'MRI Scan', 'CT Scan', 'ECG', 'Echocardiogram', 'Stool Analysis'];

const priorityColor: Record<string, string> = {
    ROUTINE: 'text-blue-600 bg-blue-50 border-blue-200',
    URGENT:  'text-amber-600 bg-amber-50 border-amber-200',
    STAT:    'text-red-600 bg-red-50 border-red-200',
};
const statusColor: Record<string, string> = {
    PENDING:     'text-gray-600 bg-gray-50 border-gray-200',
    IN_PROGRESS: 'text-blue-600 bg-blue-50 border-blue-200',
    COMPLETED:   'text-emerald-600 bg-emerald-50 border-emerald-200',
    CANCELLED:   'text-red-600 bg-red-50 border-red-200',
};

const DoctorLabOrders: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // Form
    const [patientId, setPatientId] = useState('');
    const [testName, setTestName] = useState('');
    const [testType, setTestType] = useState('BLOOD');
    const [priority, setPriority] = useState('ROUTINE');
    const [notes, setNotes] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/lab-orders/doctor/${user?.id}?size=100`);
            setOrders(res.data?.data?.content || res.data?.data || []);
        } catch { setOrders([]); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchOrders();
        api.get('/patients?size=200')
            .then(r => setPatients(r.data?.data?.content || r.data?.data || []))
            .catch(() => { });
    }, [user?.id]);

    // POST — create lab order
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true); setError(null);
        try {
            await api.post('/lab-orders', {
                patient: { id: Number(patientId) },
                doctor:  { id: user?.id },
                testName, testType, priority, notes, status: 'PENDING',
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false); setShowForm(false);
                setPatientId(''); setTestName(''); setNotes(''); setPriority('ROUTINE');
                fetchOrders();
            }, 1800);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to create lab order.'));
        } finally { setSubmitting(false); }
    };

    // PATCH — update status
    const updateStatus = async (id: number, status: string) => {
        setUpdatingId(id);
        try {
            await api.patch(`/lab-orders/${id}/status`, { status });
            setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
        } catch { alert('Failed to update status.'); }
        finally { setUpdatingId(null); }
    };

    // DELETE — remove order
    const deleteOrder = async (id: number) => {
        if (!window.confirm('Delete this lab order?')) return;
        try {
            await api.delete(`/lab-orders/${id}`);
            setOrders(o => o.filter(x => x.id !== id));
        } catch { alert('Failed to delete lab order.'); }
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                        <FlaskConical className="h-6 w-6 text-violet-600" /> Lab Orders
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Order laboratory tests and track results for your patients.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                    <Plus className="h-4 w-4" /> New Lab Order
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: stats.total, color: 'text-violet-600' },
                    { label: 'Pending',       value: stats.pending, color: 'text-gray-600' },
                    { label: 'In Progress',   value: stats.inProgress, color: 'text-blue-600' },
                    { label: 'Completed',     value: stats.completed, color: 'text-emerald-600' },
                ].map(s => (
                    <div key={s.label} className="stat-card text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Create Form */}
            {showForm && (
                <Card className="border-violet-200 shadow-md animate-fadeIn">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold" style={{ color: 'var(--text-color)' }}>
                                New Lab Order <span className="text-xs text-violet-500 font-mono ml-2">POST /lab-orders</span>
                            </h2>
                            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>
                        {success ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                                <p className="font-semibold text-emerald-600">Lab order created successfully!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Patient *</label>
                                        <select value={patientId} onChange={e => setPatientId(e.target.value)} required
                                            className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-violet-500">
                                            <option value="">Select patient...</option>
                                            {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Test Name *</label>
                                        <select value={testName} onChange={e => setTestName(e.target.value)} required
                                            className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-violet-500">
                                            <option value="">Select test...</option>
                                            {TESTS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Test Type</label>
                                        <select value={testType} onChange={e => setTestType(e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-violet-500">
                                            {['BLOOD', 'URINE', 'IMAGING', 'PATHOLOGY', 'CARDIAC', 'OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Priority</label>
                                        <div className="flex gap-2">
                                            {PRIORITIES.map(p => (
                                                <button key={p} type="button" onClick={() => setPriority(p)}
                                                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${priority === p ? priorityColor[p] : 'border-[var(--border-color)] hover:border-gray-300'}`}
                                                    style={{ color: priority === p ? undefined : 'var(--text-muted)' }}>
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Clinical Notes</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Clinical indication or special instructions..."
                                        className="w-full min-h-[70px] p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                                </div>
                                {error && <div className="flex items-center gap-2 p-3 rounded-lg text-red-600 bg-red-50 border border-red-200 text-sm"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                                <div className="flex gap-3">
                                    <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" isLoading={submitting}>Submit Order</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Orders Table */}
            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16">
                            <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-base font-medium" style={{ color: 'var(--text-color)' }}>No Lab Orders Yet</h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create your first lab order using the button above.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>
                                    <tr>{['Patient', 'Test', 'Type', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                                        <th key={h} className={`px-5 py-4 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-color)' }}>{order.patient?.fullName || '—'}</td>
                                            <td className="px-5 py-4" style={{ color: 'var(--text-color)' }}>{order.testName}</td>
                                            <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>{order.testType}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityColor[order.priority] || ''}`}>{order.priority}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[order.status] || ''}`}>
                                                    {order.status === 'COMPLETED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* PATCH status hover dropdown */}
                                                    <div className="relative group">
                                                        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--border-color)] hover:border-violet-400 transition-colors"
                                                            style={{ color: 'var(--text-color)' }} disabled={updatingId === order.id}>
                                                            {updatingId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronDown className="h-3 w-3" />} Status
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 w-36 rounded-xl shadow-lg border border-[var(--border-color)] z-10 hidden group-hover:block"
                                                            style={{ background: 'var(--card-bg)' }}>
                                                            {STATUSES.map(s => (
                                                                <button key={s} onClick={() => updateStatus(order.id, s)}
                                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl"
                                                                    style={{ color: 'var(--text-color)' }}>{s.replace('_', ' ')}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* DELETE */}
                                                    <button onClick={() => deleteOrder(order.id)}
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
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

export default DoctorLabOrders;
