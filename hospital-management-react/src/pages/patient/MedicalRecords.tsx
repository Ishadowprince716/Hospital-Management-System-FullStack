import React, { useEffect, useState } from 'react';
import { FileText, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/Card';

interface MedicalRecord {
    id: number;
    diagnosis: string;
    prescription?: string;
    notes?: string;
    treatmentPlan?: string;
    createdAt: string;
    appointment?: {
        appointmentDate: string;
        appointmentTime: string;
        doctor?: { fullName: string; specialization?: string };
    };
}

interface MedicalDocumentDTO {
    id: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    documentType: string;
    description: string;
    uploadDate: string;
    uploadedByName: string;
}

const MedicalRecords: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [documents, setDocuments] = useState<MedicalDocumentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [recordsRes, docsRes] = await Promise.all([
                    api.get(`/medical-records/patient/${user?.id}?size=50`),
                    api.get(`/medical-documents/patient/${user?.id}`)
                ]);
                setRecords(recordsRes.data?.data?.content || recordsRes.data?.data || []);
                setDocuments(docsRes.data?.data || []);
            } catch {
                setError('Could not load medical data.');
            } finally { setLoading(false); }
        };
        if (user?.id) fetchData();
    }, [user?.id]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <FileText className="h-6 w-6 text-blue-600" /> Medical Records
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Your complete health history — diagnoses, treatments, and prescriptions.
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl text-blue-600 bg-blue-50 border border-blue-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : records.length === 0 ? (
                <Card className="border-[var(--border-color)]">
                    <CardContent className="py-16 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-medium" style={{ color: 'var(--text-color)' }}>No Records Found</h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            Medical records will appear here after your appointments are completed.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {records.map((rec) => (
                        <div key={rec.id} className="card overflow-hidden">
                            {/* Record Header - always visible */}
                            <button
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold" style={{ color: 'var(--text-color)' }}>
                                            {rec.diagnosis || 'General Consultation'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                            <span>
                                                {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </span>
                                            {rec.appointment?.doctor?.fullName && (
                                                <>
                                                    <span>•</span>
                                                    <span>Dr. {rec.appointment.doctor.fullName}</span>
                                                </>
                                            )}
                                            {rec.appointment?.doctor?.specialization && (
                                                <>
                                                    <span>•</span>
                                                    <span>{rec.appointment.doctor.specialization}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {expanded === rec.id
                                    ? <ChevronUp className="h-5 w-5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                    : <ChevronDown className="h-5 w-5 shrink-0" style={{ color: 'var(--text-muted)' }} />}
                            </button>

                            {/* Expanded Details */}
                            {expanded === rec.id && (
                                <div className="border-t border-[var(--border-color)] animate-fadeIn">
                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {rec.notes && (
                                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-[var(--border-color)]">
                                                <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Doctor's Notes</p>
                                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>{rec.notes}</p>
                                            </div>
                                        )}
                                        {rec.prescription && (
                                            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                                                <p className="text-xs font-semibold uppercase mb-2 text-purple-600">Prescription</p>
                                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>{rec.prescription}</p>
                                            </div>
                                        )}
                                        {rec.treatmentPlan && (
                                            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 md:col-span-2">
                                                <p className="text-xs font-semibold uppercase mb-2 text-teal-600">Treatment Plan</p>
                                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>{rec.treatmentPlan}</p>
                                            </div>
                                        )}
                                        {rec.appointment && (
                                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 md:col-span-2">
                                                <p className="text-xs font-semibold uppercase mb-2 text-blue-600">Appointment Info</p>
                                                <div className="flex gap-6 text-sm">
                                                    <div>
                                                        <span style={{ color: 'var(--text-muted)' }}>Date: </span>
                                                        <span className="font-medium" style={{ color: 'var(--text-color)' }}>
                                                            {rec.appointment.appointmentDate ? new Date(rec.appointment.appointmentDate).toLocaleDateString() : '—'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-muted)' }}>Time: </span>
                                                        <span className="font-medium" style={{ color: 'var(--text-color)' }}>{rec.appointment.appointmentTime || '—'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Documents Section */}
            {documents.length > 0 && (
                <div className="card p-6 mt-8">
                    <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Uploaded Documents</h2>
                    <div className="grid gap-3">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] hover:bg-gray-50 dark:hover:bg-slate-800/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>{doc.fileName}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{doc.documentType} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Download</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRecords;
