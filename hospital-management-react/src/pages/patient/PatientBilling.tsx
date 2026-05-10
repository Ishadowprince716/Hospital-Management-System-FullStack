import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Clock, XCircle, AlertCircle, Receipt, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
    PatientAlert,
    PatientEmptyState,
    PatientLoader,
    PatientPageFrame,
    PatientPageHeader,
    PatientStatCard,
    patientCardClass,
} from '../../components/patient/PatientPanel';

interface BillItem { description: string; quantity: number; amount: number; }
interface Bill {
    id: number; amount: number; paidAmount: number; status: string;
    paymentMethod?: string; billDate?: string; dueDate?: string;
    notes?: string; items?: BillItem[];
}

const statusStyle: Record<string, { cls: string; icon: React.FC<{ className?: string }> }> = {
    PAID:    { cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
    PENDING: { cls: 'text-amber-600   bg-amber-50   border-amber-200',  icon: Clock },
    OVERDUE: { cls: 'text-red-600     bg-red-50     border-red-200',    icon: XCircle },
    PARTIAL: { cls: 'text-blue-600    bg-blue-50    border-blue-200',   icon: CheckCircle2 },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = (status || 'PENDING').toUpperCase();
    const cfg = statusStyle[s] || statusStyle.PENDING;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
            <Icon className="h-3.5 w-3.5" />{s}
        </span>
    );
};

const PatientBilling: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [payModal, setPayModal] = useState<Bill | null>(null);
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('CASH');
    const [paying, setPaying] = useState(false);
    const [paySuccess, setPaySuccess] = useState(false);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/bills/patient/${user?.id}?size=50`);
            setBills(res.data?.data?.content || res.data?.data || []);
        } catch {
            setError('Failed to load bills. No billing data found for your account yet.');
        } finally { setLoading(false); }
    };

    useEffect(() => { if (user?.id) fetchBills(); }, [user?.id]);

    // POST /bills/{id}/pay — REST pay action
    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault(); setPaying(true);
        try {
            await api.post(`/bills/${payModal?.id}/pay`, {
                amount: Number(payAmount), paymentMethod: payMethod, notes: 'Patient online payment',
            });
            setPaySuccess(true);
            setTimeout(() => { setPaySuccess(false); setPayModal(null); setPayAmount(''); fetchBills(); }, 1800);
        } catch (err: unknown) {
            alert(getApiErrorMessage(err, 'Payment failed. Please try again.'));
        } finally { setPaying(false); }
    };

    const totalOwed = bills.filter(b => b.status !== 'PAID').reduce((s, b) => s + ((b.amount || 0) - (b.paidAmount || 0)), 0);
    const totalPaid = bills.reduce((s, b) => s + (b.paidAmount || 0), 0);

    return (
        <PatientPageFrame size="lg">
            <PatientPageHeader
                title="Billing & Payments"
                description="Review invoices, payment history, outstanding balances, and bill line items."
                icon={CreditCard}
                tone="amber"
            />

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <PatientStatCard label="Total Bills" value={bills.length} icon={Receipt} tone="blue" />
                <PatientStatCard label="Amount Due" value={`₹${totalOwed.toFixed(0)}`} icon={Clock} tone="amber" />
                <PatientStatCard label="Total Paid" value={`₹${totalPaid.toFixed(0)}`} icon={CheckCircle2} tone="emerald" />
            </div>

            {error && (
                <PatientAlert icon={AlertCircle} tone="amber">{error}</PatientAlert>
            )}

            {loading ? (
                <PatientLoader label="Loading bills" />
            ) : bills.length === 0 ? (
                <PatientEmptyState
                    icon={Receipt}
                    title="No bills found"
                    description="You have no billing records yet."
                />
            ) : (
                <div className={`${patientCardClass} overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>
                                    <tr>
                                        {['Invoice', 'Bill Date', 'Due Date', 'Amount', 'Paid', 'Status', 'Actions'].map(h => (
                                            <th key={h} className={`px-6 py-4 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {bills.map(bill => (
                                        <tr key={bill.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-xs" style={{ color: 'var(--text-color)' }}>INV-{String(bill.id).padStart(4, '0')}</td>
                                            <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN') : '—'}</td>
                                            <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                                            <td className="px-6 py-4 font-semibold" style={{ color: 'var(--text-color)' }}>₹{(bill.amount || 0).toFixed(0)}</td>
                                            <td className="px-6 py-4 text-emerald-600 font-medium">₹{(bill.paidAmount || 0).toFixed(0)}</td>
                                            <td className="px-6 py-4"><StatusBadge status={bill.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setSelectedBill(bill)} className="text-xs px-2 py-1 rounded-lg border border-[var(--border-color)] hover:border-blue-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Details</button>
                                                    {bill.status !== 'PAID' && (
                                                        <button onClick={() => { setPayModal(bill); setPayAmount(String((bill.amount || 0) - (bill.paidAmount || 0))); }} className="text-xs px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors">
                                                            Pay Now
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                </div>
            )}

            {/* Bill Details Modal */}
            {selectedBill && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBill(null)}>
                    <div className="w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fadeIn" style={{ background: 'var(--card-bg)' }} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>INV-{String(selectedBill.id).padStart(4, '0')}</h3>
                            <button onClick={() => setSelectedBill(null)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="space-y-2 mb-4">
                            {[{ l: 'Total Amount', v: `₹${(selectedBill.amount || 0).toFixed(2)}` }, { l: 'Amount Paid', v: `₹${(selectedBill.paidAmount || 0).toFixed(2)}` }, { l: 'Balance Due', v: `₹${((selectedBill.amount || 0) - (selectedBill.paidAmount || 0)).toFixed(2)}` }, { l: 'Payment Method', v: selectedBill.paymentMethod || '—' }, { l: 'Notes', v: selectedBill.notes || '—' }].map(r => (
                                <div key={r.l} className="flex justify-between py-2 border-b border-[var(--border-color)]">
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{r.l}</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{r.v}</span>
                                </div>
                            ))}
                        </div>
                        {selectedBill.items && selectedBill.items.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Line Items</p>
                                {selectedBill.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm py-1">
                                        <span style={{ color: 'var(--text-color)' }}>{item.description} × {item.quantity}</span>
                                        <span className="font-medium" style={{ color: 'var(--text-color)' }}>₹{item.amount}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 flex justify-between items-center">
                            <StatusBadge status={selectedBill.status} />
                            <Button variant="outline" onClick={() => setSelectedBill(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pay Modal */}
            {payModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPayModal(null)}>
                    <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fadeIn" style={{ background: 'var(--card-bg)' }} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>Make Payment</h3>
                            <button onClick={() => setPayModal(null)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>
                        {paySuccess ? (
                            <div className="text-center py-6">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                                <p className="font-semibold text-emerald-600">Payment Successful!</p>
                            </div>
                        ) : (
                            <form onSubmit={handlePay} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Amount (₹)</label>
                                    <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} required min="1" max={String((payModal.amount || 0) - (payModal.paidAmount || 0))} />
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Max payable: ₹{((payModal.amount || 0) - (payModal.paidAmount || 0)).toFixed(0)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Payment Method</label>
                                    <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-amber-500">
                                        {['CASH', 'UPI', 'CARD', 'NET_BANKING', 'INSURANCE'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" isLoading={paying}>Confirm Payment</Button>
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setPayModal(null)}>Cancel</Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </PatientPageFrame>
    );
};

export default PatientBilling;
