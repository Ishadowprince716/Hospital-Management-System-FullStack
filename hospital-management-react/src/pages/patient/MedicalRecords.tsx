import React, { useEffect, useState } from 'react';
import { FileText, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api from '../../api';
import { formatDoctorName } from '../../utils/displayNames';
import {
    PatientAlert,
    PatientEmptyState,
    PatientLoader,
    PatientPageFrame,
    PatientPageHeader,
    PatientStatCard,
    patientCardClass,
} from '../../components/patient/PatientPanel';

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
        <PatientPageFrame size="lg">
            <PatientPageHeader
                title="Medical Records"
                description="Your complete health history, including diagnoses, visit notes, treatment plans, and uploaded clinical documents."
                icon={FileText}
                tone="teal"
            />

            {!loading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <PatientStatCard label="Clinical Records" value={records.length} icon={FileText} tone="teal" />
                    <PatientStatCard label="Documents" value={documents.length} icon={FileText} tone="blue" />
                    <PatientStatCard label="Expanded View" value={expanded ? 'Open' : 'Ready'} icon={expanded ? ChevronUp : ChevronDown} tone="slate" />
                </div>
            )}

            {error && (
                <PatientAlert icon={AlertCircle} tone="blue">{error}</PatientAlert>
            )}

            {loading ? (
                <PatientLoader label="Loading medical records" />
            ) : records.length === 0 ? (
                <PatientEmptyState
                    icon={FileText}
                    title="No records found"
                    description="Medical records will appear here after your appointments are completed."
                />
            ) : (
                <div className="space-y-3">
                    {records.map((rec) => (
                        <div key={rec.id} className={`${patientCardClass} overflow-hidden`}>
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
                                                    <span>{formatDoctorName(rec.appointment.doctor.fullName)}</span>
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
                <div className={`${patientCardClass} mt-8 p-6`}>
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
        </PatientPageFrame>
    );
};

export default MedicalRecords;
