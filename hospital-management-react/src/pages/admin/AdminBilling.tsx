import React, { useEffect, useMemo, useState } from 'react';
import {
    Receipt,
    Plus,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    X,
    CreditCard,
    Eye,
    Download,
    Filter,
} from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Patient {
    id: number;
    fullName: string;
}

interface BillItem {
    description: string;
    quantity: number;
    amount: number;
}

interface Bill {
    id: number;
    billNumber?: string;
    amount: number;
    paidAmount: number;
    balanceAmount?: number;
    status: string;
    paymentMethod?: string;
    billDate?: string;
    dueDate?: string;
    notes?: string;
    generatedAt?: string;
    paidAt?: string;
    patient?: Patient;
    items?: BillItem[];
}

type BillStatus = 'ALL' | 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
type BillSort = 'NEWEST' | 'OLDEST' | 'AMOUNT_HIGH' | 'BALANCE_HIGH';

const STATUS_FILTERS: BillStatus[] = ['ALL', 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE'];
const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'];

const toNumber = (value: unknown) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
};

const parseDateSafe = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatMoney = (value: number) => `₹${Math.max(0, value).toFixed(0)}`;

const formatDate = (value?: string) => {
    const parsed = parseDateSafe(value);
    if (!parsed) return '—';
    return parsed.toLocaleDateString('en-IN');
};

const getBillNumber = (bill: Bill) => bill.billNumber || `INV-${String(bill.id).padStart(4, '0')}`;
const getBillAmount = (bill: Bill) => toNumber(bill.amount);
const getPaidAmount = (bill: Bill) => toNumber(bill.paidAmount);

const getBalanceAmount = (bill: Bill) => {
    if (bill.balanceAmount !== undefined && bill.balanceAmount !== null) {
        return Math.max(0, toNumber(bill.balanceAmount));
    }
    return Math.max(0, getBillAmount(bill) - getPaidAmount(bill));
};

const getIsOverdue = (bill: Bill) => {
    if (String(bill.status || '').toUpperCase() === 'PAID') return false;
    const dueDate = parseDateSafe(bill.dueDate);
    if (!dueDate) return false;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dueDate.getTime() < todayStart.getTime() && getBalanceAmount(bill) > 0;
};

const getDisplayStatus = (bill: Bill): Exclude<BillStatus, 'ALL'> => {
    if (getIsOverdue(bill)) return 'OVERDUE';
    const normalized = String(bill.status || 'PENDING').toUpperCase();
    if (normalized === 'PAID' || normalized === 'PARTIAL' || normalized === 'PENDING') {
        return normalized;
    }
    return 'PENDING';
};

const statusCfg: Record<Exclude<BillStatus, 'ALL'>, { cls: string; Icon: React.FC<{ className?: string }> }> = {
    PAID: { cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', Icon: CheckCircle2 },
    PENDING: { cls: 'text-amber-600 bg-amber-50 border-amber-200', Icon: Clock },
    PARTIAL: { cls: 'text-blue-600 bg-blue-50 border-blue-200', Icon: CreditCard },
    OVERDUE: { cls: 'text-red-600 bg-red-50 border-red-200', Icon: XCircle },
};

const StatusBadge: React.FC<{ status: Exclude<BillStatus, 'ALL'> }> = ({ status }) => {
    const cfg = statusCfg[status];
    const Icon = cfg.Icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
            <Icon className="h-3 w-3" />
            {status}
        </span>
    );
};

const AdminBilling: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<BillStatus>('ALL');
    const [sortBy, setSortBy] = useState<BillSort>('NEWEST');

    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [paymentBill, setPaymentBill] = useState<Bill | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);

    const [patientId, setPatientId] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ description: 'Consultation Fee', quantity: 1, amount: 500 }]);
    const totalAmount = items.reduce((sum, item) => sum + toNumber(item.amount) * toNumber(item.quantity), 0);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bills?size=200&sort=generatedAt,desc');
            setBills(res.data?.data?.content || res.data?.data || []);
        } catch {
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
        api.get('/patients?size=200')
            .then((r) => setPatients(r.data?.data?.content || []))
            .catch(() => setPatients([]));
    }, []);

    const addItem = () => setItems([...items, { description: '', quantity: 1, amount: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, idx) => idx !== index));
    const updateItem = (index: number, key: 'description' | 'quantity' | 'amount', value: string) => {
        const updated = [...items];
        if (key === 'description') {
            updated[index] = { ...updated[index], description: value };
        } else {
            updated[index] = { ...updated[index], [key]: Math.max(0, toNumber(value)) };
        }
        setItems(updated);
    };

    const resetCreateForm = () => {
        setPatientId('');
        setBillDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        setNotes('');
        setItems([{ description: 'Consultation Fee', quantity: 1, amount: 500 }]);
        setFormError(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        try {
            if (!patientId) {
                throw new Error('Patient is required.');
            }
            if (items.length === 0 || totalAmount <= 0) {
                throw new Error('Add at least one bill item with a valid amount.');
            }
            if (dueDate && billDate && parseDateSafe(dueDate) && parseDateSafe(billDate) && parseDateSafe(dueDate)!.getTime() < parseDateSafe(billDate)!.getTime()) {
                throw new Error('Due date cannot be before bill date.');
            }

            await api.post('/bills', {
                patientId: Number(patientId),
                totalAmount,
                paidAmount: 0,
                paymentStatus: 'PENDING',
                notes,
                billDate,
                dueDate: dueDate || null,
                items: items.map((item) => ({
                    description: item.description || 'Service',
                    quantity: Math.max(1, toNumber(item.quantity)),
                    amount: Math.max(0, toNumber(item.amount) * Math.max(1, toNumber(item.quantity))),
                })),
            });

            setShowForm(false);
            resetCreateForm();
            fetchBills();
        } catch (err: unknown) {
            setFormError(getApiErrorMessage(err, err instanceof Error ? err.message : 'Failed to create bill.'));
        } finally {
            setSubmitting(false);
        }
    };

    const openPaymentModal = (bill: Bill, markFull = false) => {
        const balance = getBalanceAmount(bill);
        setPaymentBill(bill);
        setPaymentAmount((markFull ? balance : Math.min(balance, 500)).toFixed(0));
        setPaymentMethod('CASH');
        setPaymentNotes(markFull ? 'Admin: marked as fully paid' : '');
        setPaymentError(null);
    };

    const closePaymentModal = () => {
        setPaymentBill(null);
        setPaymentAmount('');
        setPaymentNotes('');
        setPaymentMethod('CASH');
        setPaymentError(null);
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentBill) return;

        const balance = getBalanceAmount(paymentBill);
        const amount = toNumber(paymentAmount);

        if (amount <= 0) {
            setPaymentError('Payment amount must be greater than zero.');
            return;
        }
        if (amount > balance + 0.01) {
            setPaymentError(`Amount exceeds remaining balance ${formatMoney(balance)}.`);
            return;
        }

        setPaymentSubmitting(true);
        setPaymentError(null);
        try {
            await api.post(`/bills/${paymentBill.id}/payments`, {
                amount,
                paymentMethod,
                notes: paymentNotes || 'Admin recorded payment',
            });
            closePaymentModal();
            fetchBills();
        } catch (err: unknown) {
            setPaymentError(getApiErrorMessage(err, 'Failed to record payment.'));
        } finally {
            setPaymentSubmitting(false);
        }
    };

    const exportBillsCsv = () => {
        const rows = filteredBills.map((bill) => ({
            billNumber: getBillNumber(bill),
            patient: bill.patient?.fullName || '—',
            totalAmount: getBillAmount(bill).toFixed(2),
            paidAmount: getPaidAmount(bill).toFixed(2),
            balanceAmount: getBalanceAmount(bill).toFixed(2),
            status: getDisplayStatus(bill),
            billDate: formatDate(bill.billDate),
            dueDate: formatDate(bill.dueDate),
            paymentMethod: bill.paymentMethod || '—',
        }));

        const headers = ['Bill Number', 'Patient', 'Amount', 'Paid', 'Balance', 'Status', 'Bill Date', 'Due Date', 'Payment Method'];
        const lines = rows.map((r) => [r.billNumber, r.patient, r.totalAmount, r.paidAmount, r.balanceAmount, r.status, r.billDate, r.dueDate, r.paymentMethod]
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(','));
        const csv = [headers.join(','), ...lines].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-bills-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportSingleBill = (bill: Bill) => {
        const lineItems = (bill.items || [])
            .map((item) => `${item.description} (x${toNumber(item.quantity)}): ${formatMoney(toNumber(item.amount))}`)
            .join('\n');
        const content = [
            `Bill Number: ${getBillNumber(bill)}`,
            `Patient: ${bill.patient?.fullName || '—'}`,
            `Status: ${getDisplayStatus(bill)}`,
            `Amount: ${formatMoney(getBillAmount(bill))}`,
            `Paid: ${formatMoney(getPaidAmount(bill))}`,
            `Balance: ${formatMoney(getBalanceAmount(bill))}`,
            `Bill Date: ${formatDate(bill.billDate)}`,
            `Due Date: ${formatDate(bill.dueDate)}`,
            `Payment Method: ${bill.paymentMethod || '—'}`,
            `Notes: ${bill.notes || '—'}`,
            '',
            'Line Items:',
            lineItems || 'No line items',
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${getBillNumber(bill)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const filteredBills = useMemo(() => {
        const term = search.trim().toLowerCase();
        const subset = bills.filter((bill) => {
            const displayStatus = getDisplayStatus(bill);
            const matchSearch = !term
                || (bill.patient?.fullName || '').toLowerCase().includes(term)
                || getBillNumber(bill).toLowerCase().includes(term);
            const matchStatus = statusFilter === 'ALL' || displayStatus === statusFilter;
            return matchSearch && matchStatus;
        });

        const sorted = [...subset];
        sorted.sort((a, b) => {
            if (sortBy === 'AMOUNT_HIGH') return getBillAmount(b) - getBillAmount(a);
            if (sortBy === 'BALANCE_HIGH') return getBalanceAmount(b) - getBalanceAmount(a);

            const aDate = parseDateSafe(a.generatedAt || a.billDate)?.getTime() || 0;
            const bDate = parseDateSafe(b.generatedAt || b.billDate)?.getTime() || 0;
            return sortBy === 'OLDEST' ? aDate - bDate : bDate - aDate;
        });

        return sorted;
    }, [bills, search, sortBy, statusFilter]);

    const stats = useMemo(() => {
        const totalBills = bills.length;
        const totalBilled = bills.reduce((sum, bill) => sum + getBillAmount(bill), 0);
        const totalPaid = bills.reduce((sum, bill) => sum + getPaidAmount(bill), 0);
        const pendingAmount = bills.reduce((sum, bill) => sum + getBalanceAmount(bill), 0);
        const overdueBills = bills.filter(getIsOverdue).length;
        const overdueAmount = bills.filter(getIsOverdue).reduce((sum, bill) => sum + getBalanceAmount(bill), 0);
        const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

        return { totalBills, totalBilled, totalPaid, pendingAmount, overdueBills, overdueAmount, collectionRate };
    }, [bills]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                        <Receipt className="h-6 w-6 text-amber-600" /> Admin Billing
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Generate invoices, track payments, and recover overdue balances faster.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search patient / bill #..."
                            className="pl-9 h-9 w-56"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as BillSort)}
                        className="h-9 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] text-sm"
                    >
                        <option value="NEWEST">Newest first</option>
                        <option value="OLDEST">Oldest first</option>
                        <option value="AMOUNT_HIGH">Highest amount</option>
                        <option value="BALANCE_HIGH">Highest balance</option>
                    </select>

                    <Button variant="outline" className="gap-2" onClick={exportBillsCsv}>
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>

                    <Button onClick={() => setShowForm((prev) => !prev)} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        New Bill
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wide font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Filter className="h-3.5 w-3.5" />
                    Filter
                </span>
                {STATUS_FILTERS.map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusFilter === status
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'border-[var(--border-color)] hover:border-amber-300 text-[var(--text-muted)]'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Total Bills', value: stats.totalBills, color: 'text-blue-600', span: 'lg:col-span-1' },
                    { label: 'Billed', value: formatMoney(stats.totalBilled), color: 'text-slate-700', span: 'lg:col-span-1' },
                    { label: 'Collected', value: formatMoney(stats.totalPaid), color: 'text-emerald-600', span: 'lg:col-span-1' },
                    { label: 'Pending', value: formatMoney(stats.pendingAmount), color: 'text-amber-600', span: 'lg:col-span-1' },
                    { label: 'Overdue', value: `${stats.overdueBills} (${formatMoney(stats.overdueAmount)})`, color: 'text-red-600', span: 'lg:col-span-1' },
                    { label: 'Collection Rate', value: `${stats.collectionRate.toFixed(0)}%`, color: 'text-indigo-600', span: 'lg:col-span-1' },
                ].map((card) => (
                    <div key={card.label} className={`stat-card text-center ${card.span}`}>
                        <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {showForm && (
                <Card className="border-amber-200 shadow-md animate-fadeIn">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold" style={{ color: 'var(--text-color)' }}>
                                Generate Invoice <span className="text-xs text-amber-500 font-mono ml-2">POST /bills</span>
                            </h2>
                            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Patient *</label>
                                    <select
                                        value={patientId}
                                        onChange={(e) => setPatientId(e.target.value)}
                                        required
                                        className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">Select patient...</option>
                                        {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Bill Date</label>
                                    <Input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Due Date</label>
                                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>Line Items</label>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                                        <Plus className="h-3 w-3 mr-1" />Add Item
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-6">
                                                <Input
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Qty"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Input
                                                    type="number"
                                                    placeholder="Unit ₹"
                                                    min="0"
                                                    value={item.amount}
                                                    onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="col-span-1 text-right">
                                                {items.length > 1 && (
                                                    <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-2 text-right text-sm">
                                    Total:
                                    <span className="text-lg font-bold text-amber-600 ml-2">{formatMoney(totalAmount)}</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional notes..."
                                    className="w-full min-h-[60px] p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                />
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg text-red-600 bg-red-50 border border-red-200 text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {formError}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" isLoading={submitting}>
                                    Generate Invoice
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetCreateForm(); }}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-amber-600" /></div>
                    ) : filteredBills.length === 0 ? (
                        <div className="text-center py-16">
                            <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-base font-medium" style={{ color: 'var(--text-color)' }}>No bills found</h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try another filter or generate a new bill.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>
                                    <tr>
                                        {['Bill #', 'Patient', 'Amount', 'Paid', 'Balance', 'Status', 'Bill Date', 'Due Date', 'Actions'].map((head) => (
                                            <th key={head} className={`px-5 py-4 ${head === 'Actions' ? 'text-right' : 'text-left'}`}>{head}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {filteredBills.map((bill) => {
                                        const displayStatus = getDisplayStatus(bill);
                                        const balance = getBalanceAmount(bill);
                                        const isActionable = balance > 0.01 && displayStatus !== 'PAID';
                                        return (
                                            <tr
                                                key={bill.id}
                                                className={`transition-colors ${getIsOverdue(bill)
                                                    ? 'bg-red-50/50 dark:bg-red-950/10'
                                                    : 'hover:bg-gray-50/50 dark:hover:bg-slate-800/30'
                                                    }`}
                                            >
                                                <td className="px-5 py-4 font-mono text-xs font-medium" style={{ color: 'var(--text-color)' }}>{getBillNumber(bill)}</td>
                                                <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-color)' }}>{bill.patient?.fullName || '—'}</td>
                                                <td className="px-5 py-4 font-semibold" style={{ color: 'var(--text-color)' }}>{formatMoney(getBillAmount(bill))}</td>
                                                <td className="px-5 py-4 text-emerald-600 font-medium">{formatMoney(getPaidAmount(bill))}</td>
                                                <td className="px-5 py-4 text-amber-600 font-medium">{formatMoney(balance)}</td>
                                                <td className="px-5 py-4"><StatusBadge status={displayStatus} /></td>
                                                <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(bill.billDate)}</td>
                                                <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(bill.dueDate)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedBill(bill)}
                                                            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-blue-400 transition-colors"
                                                            title="View bill"
                                                        >
                                                            <Eye className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                        </button>

                                                        <button
                                                            onClick={() => exportSingleBill(bill)}
                                                            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-amber-400 transition-colors"
                                                            title="Download summary"
                                                        >
                                                            <Download className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                        </button>

                                                        {isActionable && (
                                                            <>
                                                                <button
                                                                    onClick={() => openPaymentModal(bill)}
                                                                    className="text-xs px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                                                                >
                                                                    Record Payment
                                                                </button>
                                                                <button
                                                                    onClick={() => openPaymentModal(bill, true)}
                                                                    className="text-xs px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedBill && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBill(null)}>
                    <div
                        className="w-full max-w-2xl rounded-2xl shadow-2xl p-6 animate-fadeIn"
                        style={{ background: 'var(--card-bg)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>{getBillNumber(selectedBill)}</h3>
                            <button onClick={() => setSelectedBill(null)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                            {[
                                { label: 'Patient', value: selectedBill.patient?.fullName || '—' },
                                { label: 'Status', value: getDisplayStatus(selectedBill) },
                                { label: 'Total Amount', value: formatMoney(getBillAmount(selectedBill)) },
                                { label: 'Paid Amount', value: formatMoney(getPaidAmount(selectedBill)) },
                                { label: 'Balance', value: formatMoney(getBalanceAmount(selectedBill)) },
                                { label: 'Bill Date', value: formatDate(selectedBill.billDate) },
                                { label: 'Due Date', value: formatDate(selectedBill.dueDate) },
                                { label: 'Payment Method', value: selectedBill.paymentMethod || '—' },
                            ].map((row) => (
                                <div key={row.label} className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border border-[var(--border-color)] p-3">
                            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Line Items</p>
                            {(selectedBill.items && selectedBill.items.length > 0) ? (
                                <div className="space-y-2">
                                    {selectedBill.items.map((item, index) => (
                                        <div key={`${item.description}-${index}`} className="flex items-center justify-between text-sm">
                                            <span style={{ color: 'var(--text-color)' }}>{item.description} <span style={{ color: 'var(--text-muted)' }}>x{toNumber(item.quantity)}</span></span>
                                            <span className="font-medium" style={{ color: 'var(--text-color)' }}>{formatMoney(toNumber(item.amount))}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No line items available.</p>
                            )}
                        </div>

                        {selectedBill.notes && (
                            <div className="mt-4 rounded-xl border border-[var(--border-color)] p-3">
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-color)' }}>Notes</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedBill.notes}</p>
                            </div>
                        )}

                        <div className="flex gap-2 mt-5 justify-end">
                            <Button variant="outline" onClick={() => exportSingleBill(selectedBill)} className="gap-2">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedBill(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {paymentBill && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closePaymentModal}>
                    <div
                        className="w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fadeIn"
                        style={{ background: 'var(--card-bg)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Record Payment</h3>
                            <button onClick={closePaymentModal}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                            {getBillNumber(paymentBill)} • Remaining {formatMoney(getBalanceAmount(paymentBill))}
                        </p>

                        <form className="space-y-4" onSubmit={handleRecordPayment}>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Amount *</label>
                                <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)]"
                                >
                                    {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Notes</label>
                                <textarea
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    placeholder="Payment notes..."
                                    className="w-full min-h-[70px] p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] text-sm"
                                />
                            </div>

                            {paymentError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg text-red-600 bg-red-50 border border-red-200 text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {paymentError}
                                </div>
                            )}

                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={closePaymentModal}>Cancel</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" isLoading={paymentSubmitting}>
                                    Save Payment
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBilling;
