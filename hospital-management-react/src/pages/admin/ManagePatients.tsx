import React, { useEffect, useState } from 'react';
import { Users, CheckCircle2, XCircle, Loader2, AlertCircle, Search, RefreshCw, Download, HeartPulse, ShieldCheck } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';

interface Patient {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    bloodGroup: string;
    gender: string;
    dateOfBirth: string;
    isActive: boolean;
    profilePictureUrl?: string;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const downloadCsv = (filename: string, rows: unknown[][]) => {
    const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

const ManagePatients: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/patients?size=100');
            const data = res.data?.data?.content || res.data?.data || [];
            setPatients(data);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to load patients.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await api.patch(`/admin/users/${id}/status?active=${!currentStatus}`);
            // Optimistically update the UI
            setPatients(patients.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
        } catch {
            alert('Failed to update patient status.');
        }
    };

    const filteredPatients = patients.filter(p => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
            (p.fullName || '').toLowerCase().includes(query) ||
            (p.email || '').toLowerCase().includes(query) ||
            (p.phoneNumber || '').includes(searchQuery) ||
            (p.bloodGroup || '').toLowerCase().includes(query);
        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && p.isActive) ||
            (statusFilter === 'INACTIVE' && !p.isActive);
        return matchesQuery && matchesStatus;
    });

    const stats = {
        total: patients.length,
        active: patients.filter(p => p.isActive).length,
        suspended: patients.filter(p => !p.isActive).length,
        bloodGroups: new Set(patients.map(p => p.bloodGroup).filter(Boolean)).size,
    };

    const exportPatients = () => {
        downloadCsv('hms-patients.csv', [
            ['ID', 'Name', 'Email', 'Phone', 'Gender', 'Blood Group', 'Date of Birth', 'Status'],
            ...filteredPatients.map(patient => [
                patient.id,
                patient.fullName,
                patient.email,
                patient.phoneNumber,
                patient.gender,
                patient.bloodGroup,
                patient.dateOfBirth,
                patient.isActive ? 'Active' : 'Suspended',
            ]),
        ]);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-color)] flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Manage Patients
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">View patient records and manage account access.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search name, phone, blood..."
                            className="pl-9 h-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="button" variant="outline" onClick={fetchPatients} isLoading={loading} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button type="button" variant="outline" onClick={exportPatients} disabled={filteredPatients.length === 0} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'Total Patients', value: stats.total, icon: Users, tone: 'text-blue-600 bg-blue-50' },
                    { label: 'Active', value: stats.active, icon: ShieldCheck, tone: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Suspended', value: stats.suspended, icon: XCircle, tone: 'text-red-600 bg-red-50' },
                    { label: 'Blood Groups', value: stats.bloodGroups, icon: HeartPulse, tone: 'text-rose-600 bg-rose-50' },
                ].map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="surface-panel p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-black text-[var(--text-color)]">{item.value}</p>
                                    <p className="text-xs font-semibold text-[var(--text-muted)]">{item.label}</p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.tone}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-2">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as StatusFilter[]).map(filter => (
                    <button
                        key={filter}
                        type="button"
                        onClick={() => setStatusFilter(filter)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${statusFilter === filter ? 'border-blue-600 bg-blue-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-blue-300 hover:text-[var(--text-color)]'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl text-red-600 bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                </div>
            )}

            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <h3 className="text-lg font-medium text-[var(--text-color)]">No patients found</h3>
                            <p className="text-sm text-[var(--text-muted)] mt-1">There are no patients matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 text-[var(--text-muted)] border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Patient Info</th>
                                        <th className="px-6 py-4 font-semibold">Details</th>
                                        <th className="px-6 py-4 font-semibold">Contact</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <ProfileAvatar
                                                        profilePictureUrl={patient.profilePictureUrl}
                                                        name={patient.fullName}
                                                        className="h-10 w-10 shrink-0 rounded-full border border-blue-100 text-sm shadow-sm"
                                                        fallbackClassName="bg-blue-100 text-blue-700"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-[var(--text-color)]">{patient.fullName || 'Unknown'}</div>
                                                        <div className="text-[var(--text-muted)] text-xs">ID: #{patient.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[var(--text-color)] text-xs">{patient.gender || '—'} / {patient.bloodGroup || '—'}</div>
                                                <div className="text-[var(--text-muted)] text-xs">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[var(--text-color)] text-xs">{patient.email}</div>
                                                <div className="text-[var(--text-muted)] text-xs">{patient.phoneNumber || '—'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {patient.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                        <CheckCircle2 className="h-3 w-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                                                        <XCircle className="h-3 w-3" /> Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => toggleStatus(patient.id, patient.isActive)}
                                                        className={patient.isActive ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                                                        title={patient.isActive ? "Suspend Patient" : "Reactivate Patient"}
                                                    >
                                                        {patient.isActive ? "Suspend" : "Activate"}
                                                    </Button>
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

export default ManagePatients;
