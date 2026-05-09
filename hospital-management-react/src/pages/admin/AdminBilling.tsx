import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Search, Loader2, AlertCircle, CheckCircle2, Clock, XCircle, X, CreditCard } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Patient { id: number; fullName: string; }
interface BillItem { description: string; quantity: number; amount: number; }
interface Bill {
    id: number; billNumber?: string; amount: number; paidAmount: number;
    balanceAmount?: number; status: string; paymentMethod?: string;
    billDate?: string; dueDate?: string; notes?: string;
    patient?: Patient; items?: BillItem[];
}

const statusCfg: Record<string, { cls: string; Icon: React.FC<{className?:string}> }> = {
    PAID:    { cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', Icon: CheckCircle2 },
    PENDING: { cls: 'text-amber-600 bg-amber-50 border-amber-200',      Icon: Clock },
    PARTIAL: { cls: 'text-blue-600 bg-blue-50 border-blue-200',         Icon: CreditCard },
    OVERDUE: { cls: 'text-red-600 bg-red-50 border-red-200',            Icon: XCircle },
};

const StatusBadge: React.FC<{status:string}> = ({ status }) => {
    const s = (status||'PENDING').toUpperCase();
    const cfg = statusCfg[s] || statusCfg.PENDING;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
            <cfg.Icon className="h-3 w-3"/>{s}
        </span>
    );
};

const AdminBilling: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string|null>(null);

    const [patientId, setPatientId] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ description: 'Consultation Fee', quantity: 1, amount: 500 }]);
    const totalAmount = items.reduce((s,i) => s + (Number(i.amount) * Number(i.quantity)), 0);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bills?size=100&sort=generatedAt,desc');
            setBills(res.data?.data?.content || res.data?.data || []);
        } catch { setBills([]); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchBills();
        api.get('/patients?size=200').then(r => setPatients(r.data?.data?.content || [])).catch(()=>{});
    }, []);

    const addItem = () => setItems([...items, { description: '', quantity: 1, amount: 0 }]);
    const removeItem = (i:number) => setItems(items.filter((_,idx) => idx!==i));
    const updateItem = (i:number, k:string, v:string|number) => {
        const u=[...items]; u[i]={...u[i],[k]:v}; setItems(u);
    };

    const handleCreate = async (e:React.FormEvent) => {
        e.preventDefault(); setSubmitting(true); setFormError(null);
        try {
            await api.post('/bills', {
                patientId: Number(patientId), totalAmount, paidAmount: 0,
                paymentStatus: 'PENDING', notes, billDate, dueDate,
                items: items.map(i => ({ description: i.description, quantity: Number(i.quantity), amount: Number(i.amount)*Number(i.quantity) }))
            });
            setShowForm(false); setPatientId(''); setNotes('');
            setItems([{ description: 'Consultation Fee', quantity:1, amount:500 }]);
            fetchBills();
        } catch (err: unknown) { setFormError(getApiErrorMessage(err, 'Failed to create bill.')); }
        finally { setSubmitting(false); }
    };

    const handleMarkPaid = async (id:number, balance:number) => {
        if (!window.confirm(`Mark ₹${balance.toFixed(0)} as paid?`)) return;
        try {
            await api.post(`/bills/${id}/pay`, { amount: balance, paymentMethod: 'CASH', notes: 'Admin: marked paid' });
            fetchBills();
        } catch { alert('Failed to mark as paid.'); }
    };

    const filtered = bills.filter(b =>
        (b.patient?.fullName||'').toLowerCase().includes(search.toLowerCase()) ||
        (b.billNumber||'').toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: bills.length,
        revenue: bills.filter(b=>b.status==='PAID').reduce((s,b)=>s+(b.paidAmount||0),0),
        pending: bills.filter(b=>b.status==='PENDING'||b.status==='PARTIAL').reduce((s,b)=>s+(b.balanceAmount||0),0),
        overdue: bills.filter(b=>b.status==='OVERDUE').length,
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{color:'var(--text-color)'}}>
                        <Receipt className="h-6 w-6 text-amber-600"/> Admin Billing
                    </h1>
                    <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Generate invoices, track payments, and manage all hospital bills.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
                        <Input placeholder="Search patient / bill #..." className="pl-9 h-9 w-56" value={search} onChange={e=>setSearch(e.target.value)}/>
                    </div>
                    <Button onClick={()=>setShowForm(!showForm)} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                        <Plus className="h-4 w-4"/> New Bill
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label:'Total Bills',        value: stats.total, color:'text-blue-600' },
                    { label:'Revenue Collected',  value:`₹${stats.revenue.toFixed(0)}`, color:'text-emerald-600' },
                    { label:'Pending Amount',      value:`₹${stats.pending.toFixed(0)}`, color:'text-amber-600' },
                    { label:'Overdue Bills',       value: stats.overdue, color:'text-red-600' },
                ].map(s=>(
                    <div key={s.label} className="stat-card text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Create Bill Form */}
            {showForm && (
                <Card className="border-amber-200 shadow-md animate-fadeIn">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold" style={{color:'var(--text-color)'}}>
                                Generate Invoice <span className="text-xs text-amber-500 font-mono ml-2">POST /bills</span>
                            </h2>
                            <button onClick={()=>setShowForm(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600"/></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{color:'var(--text-color)'}}>Patient *</label>
                                    <select value={patientId} onChange={e=>setPatientId(e.target.value)} required
                                        className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-amber-500">
                                        <option value="">Select patient...</option>
                                        {patients.map(p=><option key={p.id} value={p.id}>{p.fullName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{color:'var(--text-color)'}}>Bill Date</label>
                                    <Input type="date" value={billDate} onChange={e=>setBillDate(e.target.value)}/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{color:'var(--text-color)'}}>Due Date</label>
                                    <Input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium" style={{color:'var(--text-color)'}}>Line Items</label>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                                        <Plus className="h-3 w-3 mr-1"/>Add Item
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {items.map((item,i)=>(
                                        <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-6"><Input placeholder="Description" value={item.description} onChange={e=>updateItem(i,'description',e.target.value)} className="text-sm"/></div>
                                            <div className="col-span-2"><Input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e=>updateItem(i,'quantity',e.target.value)} className="text-sm"/></div>
                                            <div className="col-span-3"><Input type="number" placeholder="Unit ₹" min="0" value={item.amount} onChange={e=>updateItem(i,'amount',e.target.value)} className="text-sm"/></div>
                                            <div className="col-span-1 text-right">
                                                {items.length > 1 && <button type="button" onClick={()=>removeItem(i)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4"/></button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-2 text-right text-sm">Total: <span className="text-lg font-bold text-amber-600">₹{totalAmount.toFixed(0)}</span></p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{color:'var(--text-color)'}}>Notes</label>
                                <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Additional notes..."
                                    className="w-full min-h-[60px] p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"/>
                            </div>
                            {formError && <div className="flex items-center gap-2 p-3 rounded-lg text-red-600 bg-red-50 border border-red-200 text-sm"><AlertCircle className="h-4 w-4 shrink-0"/>{formError}</div>}
                            <div className="flex gap-3">
                                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" isLoading={submitting}>Generate Invoice</Button>
                                <Button type="button" variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Bills Table */}
            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-amber-600"/></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300"/>
                            <h3 className="text-base font-medium" style={{color:'var(--text-color)'}}>No bills found</h3>
                            <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Generate your first invoice using the button above.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]" style={{color:'var(--text-muted)'}}>
                                    <tr>{['Bill #','Patient','Amount','Paid','Balance','Status','Date','Actions'].map(h=>(
                                        <th key={h} className={`px-5 py-4 ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {filtered.map(bill=>(
                                        <tr key={bill.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4 font-mono text-xs font-medium" style={{color:'var(--text-color)'}}>{bill.billNumber||`INV-${String(bill.id).padStart(4,'0')}`}</td>
                                            <td className="px-5 py-4 font-medium" style={{color:'var(--text-color)'}}>{bill.patient?.fullName||'—'}</td>
                                            <td className="px-5 py-4 font-semibold" style={{color:'var(--text-color)'}}>₹{(bill.amount||0).toFixed(0)}</td>
                                            <td className="px-5 py-4 text-emerald-600 font-medium">₹{(bill.paidAmount||0).toFixed(0)}</td>
                                            <td className="px-5 py-4 text-amber-600 font-medium">₹{(bill.balanceAmount||0).toFixed(0)}</td>
                                            <td className="px-5 py-4"><StatusBadge status={bill.status}/></td>
                                            <td className="px-5 py-4 text-xs" style={{color:'var(--text-muted)'}}>{bill.billDate?new Date(bill.billDate).toLocaleDateString('en-IN'):'—'}</td>
                                            <td className="px-5 py-4 text-right">
                                                {bill.status!=='PAID' && (
                                                    <button onClick={()=>handleMarkPaid(bill.id,bill.balanceAmount||bill.amount||0)}
                                                        className="text-xs px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors">
                                                        Mark Paid
                                                    </button>
                                                )}
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

export default AdminBilling;
