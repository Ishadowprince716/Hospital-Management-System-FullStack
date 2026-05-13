import React, { useEffect, useState } from 'react';
import { Stethoscope, CheckCircle2, XCircle, Loader2, AlertCircle, Search, RefreshCw, Download, UserCheck, UserX } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';

interface Doctor {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    specialization: string;
    department: string;
    consultationFee: number;
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

const ManageDoctors: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctors?size=100');
            const data = res.data?.data?.content || res.data?.data || [];
            setDoctors(data);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to load doctors.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await api.patch(`/admin/users/${id}/status?active=${!currentStatus}`);
            // Optimistically update the UI
            setDoctors(doctors.map(doc => doc.id === id ? { ...doc, isActive: !currentStatus } : doc));
        } catch {
            alert('Failed to update doctor status.');
        }
    };

    const filteredDoctors = doctors.filter(d => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
            (d.fullName || '').toLowerCase().includes(query) ||
            (d.specialization || '').toLowerCase().includes(query) ||
            (d.department || '').toLowerCase().includes(query) ||
            (d.email || '').toLowerCase().includes(query);
        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && d.isActive) ||
            (statusFilter === 'INACTIVE' && !d.isActive);
        return matchesQuery && matchesStatus;
    });

    const stats = {
        total: doctors.length,
        active: doctors.filter(d => d.isActive).length,
        inactive: doctors.filter(d => !d.isActive).length,
        specialties: new Set(doctors.map(d => d.specialization).filter(Boolean)).size,
    };

    const exportDoctors = () => {
        downloadCsv('hms-doctors.csv', [
            ['ID', 'Name', 'Email', 'Phone', 'Specialization', 'Department', 'Fee', 'Status'],
            ...filteredDoctors.map(doc => [
                doc.id,
                doc.fullName,
                doc.email,
                doc.phoneNumber,
                doc.specialization,
                doc.department,
                doc.consultationFee,
                doc.isActive ? 'Active' : 'Inactive',
            ]),
        ]);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-color)] flex items-center gap-2">
                        <Stethoscope className="h-6 w-6 text-teal-600" />
                        Manage Doctors
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">View, approve, and manage doctor accounts across the system.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search name, specialty, email..."
                            className="pl-9 h-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="button" variant="outline" onClick={fetchDoctors} isLoading={loading} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button type="button" variant="outline" onClick={exportDoctors} disabled={filteredDoctors.length === 0} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'Total Doctors', value: stats.total, icon: Stethoscope, tone: 'text-teal-600 bg-teal-50' },
                    { label: 'Active', value: stats.active, icon: UserCheck, tone: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Inactive', value: stats.inactive, icon: UserX, tone: 'text-red-600 bg-red-50' },
                    { label: 'Specialties', value: stats.specialties, icon: CheckCircle2, tone: 'text-blue-600 bg-blue-50' },
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
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${statusFilter === filter ? 'border-teal-600 bg-teal-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-teal-300 hover:text-[var(--text-color)]'}`}
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
                            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                        </div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="text-center py-16">
                            <Stethoscope className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <h3 className="text-lg font-medium text-[var(--text-color)]">No doctors found</h3>
                            <p className="text-sm text-[var(--text-muted)] mt-1">There are no doctors matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 text-[var(--text-muted)] border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Doctor Info</th>
                                        <th className="px-6 py-4 font-semibold">Specialty & Dept</th>
                                        <th className="px-6 py-4 font-semibold">Contact</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {filteredDoctors.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <ProfileAvatar
                                                        profilePictureUrl={doc.profilePictureUrl}
                                                        name={doc.fullName}
                                                        className="h-10 w-10 shrink-0 rounded-full border border-teal-100 text-sm shadow-sm"
                                                        fallbackClassName="bg-teal-100 text-teal-700"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-[var(--text-color)]">Dr. {doc.fullName || 'Unknown'}</div>
                                                        <div className="text-[var(--text-muted)] text-xs">Fee: ₹{doc.consultationFee || 0}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[var(--text-color)] font-medium">{doc.specialization || 'General'}</div>
                                                <div className="text-[var(--text-muted)] text-xs">{doc.department || 'Outpatient'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[var(--text-color)] text-xs">{doc.email}</div>
                                                <div className="text-[var(--text-muted)] text-xs">{doc.phoneNumber || '—'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {doc.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                        <CheckCircle2 className="h-3 w-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                                                        <XCircle className="h-3 w-3" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => toggleStatus(doc.id, doc.isActive)}
                                                        className={doc.isActive ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                                                        title={doc.isActive ? "Deactivate Doctor" : "Approve/Activate Doctor"}
                                                    >
                                                        {doc.isActive ? "Deactivate" : "Approve"}
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

export default ManageDoctors;
