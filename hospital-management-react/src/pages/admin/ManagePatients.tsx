import React, { useEffect, useState } from 'react';
import { Users, CheckCircle2, XCircle, Loader2, AlertCircle, Search } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Patient {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    bloodGroup: string;
    gender: string;
    dateOfBirth: string;
    isActive: boolean;
}

const ManagePatients: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredPatients = patients.filter(p => 
        (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.phoneNumber || '').includes(searchQuery)
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-color)] flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Manage Patients
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">View patient records and manage account access.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search by name or phone..." 
                        className="pl-9 h-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
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
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                                                        {patient.fullName?.charAt(0) || 'P'}
                                                    </div>
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
