import React, { useEffect, useState } from 'react';
import { Pill, Loader2, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/Card';

interface PrescriptionItem {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface Prescription {
    id: number;
    doctor?: { fullName: string };
    diagnosis: string;
    status: string;
    prescriptionDate: string;
    notes?: string;
    items?: PrescriptionItem[];
}

const PatientPrescriptions: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/prescriptions/patient/${user?.id}?size=50`);
                setPrescriptions(res.data?.data?.content || res.data?.data || []);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load prescriptions');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchPrescriptions();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-color)]">My Prescriptions</h1>
                <p className="text-[var(--text-muted)]">View your current and past prescriptions</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>Failed to load prescriptions.</p>
                </div>
            )}

            {!error && prescriptions.length === 0 ? (
                <div className="card p-12 text-center text-[var(--text-muted)]">
                    <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No prescriptions found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map(p => (
                        <Card key={p.id} className="overflow-hidden border-l-4 border-l-[var(--primary)]">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pb-4 border-b border-[var(--border-color)]">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg text-[var(--text-color)]">Prescription #{p.id}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {p.status || 'ISSUED'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            <strong>Diagnosis:</strong> {p.diagnosis}
                                        </p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            <strong>Prescribed by:</strong> Dr. {p.doctor?.fullName || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-sm text-[var(--text-muted)] md:text-right">
                                        <div><strong>Date:</strong> {new Date(p.prescriptionDate).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-[var(--text-color)] mb-2">Medications</h4>
                                    {p.items && p.items.length > 0 ? (
                                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                                            {p.items.map((item, idx) => (
                                                <div key={idx} className="bg-[var(--bg-secondary)] p-3 rounded-lg flex items-start gap-3">
                                                    <div className="p-2 bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] rounded-lg">
                                                        <Pill className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-[var(--text-color)]">{item.medicineName}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">
                                                            {item.dosage} • {item.frequency} • {item.duration}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[var(--text-muted)]">No medications listed.</p>
                                    )}
                                </div>

                                {p.notes && (
                                    <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                                        <h4 className="text-sm font-semibold text-[var(--text-color)] mb-1">Doctor's Notes</h4>
                                        <p className="text-sm text-[var(--text-muted)]">{p.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientPrescriptions;
