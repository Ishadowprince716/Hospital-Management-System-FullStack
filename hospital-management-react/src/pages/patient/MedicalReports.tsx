import React from 'react';
import { FileText, Download, AlertCircle, Brain } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useGetPatientMedicalReportsQuery } from '../../store/api/patientApiSlice';
import { formatDoctorName } from '../../utils/displayNames';
import { API_BASE } from '../../api';
import {
    PatientAlert,
    PatientEmptyState,
    PatientLoader,
    PatientPageFrame,
    PatientPageHeader,
    patientCardClass,
} from '../../components/patient/PatientPanel';

interface MedicalReport {
    id: number;
    reportTitle: string;
    reportType: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    uploader?: { fullName: string };
}

import SmartDiagnosticLab from '../../components/dashboard/SmartDiagnosticLab';

const getMedicalReports = (payload: unknown): MedicalReport[] => {
    if (Array.isArray(payload)) {
        return payload as MedicalReport[];
    }
    if (payload && typeof payload === 'object') {
        const content = (payload as { content?: unknown }).content;
        return Array.isArray(content) ? content as MedicalReport[] : [];
    }
    return [];
};

const MedicalReports: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { data, error, isLoading } = useGetPatientMedicalReportsQuery(user?.id as number, {
        skip: !user?.id,
    });

    const reports = getMedicalReports(data?.data);

    const handleDownload = (report: MedicalReport) => {
        const token = localStorage.getItem('token');
        fetch(`${API_BASE}/reports/${report.id}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = report.reportTitle;
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    };

    if (isLoading) {
        return (
            <PatientPageFrame>
                <PatientLoader label="Loading medical reports" />
            </PatientPageFrame>
        );
    }

    return (
        <PatientPageFrame>
            <PatientPageHeader
                title="Medical Reports"
                description="View lab reports, imaging documents, and AI-assisted summaries in one organized workspace."
                icon={FileText}
                tone="purple"
            />

            <section className={`${patientCardClass} p-5`}>
                <div className="mb-5 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-color)]">Smart Diagnostic Lab</h2>
                        <p className="text-sm text-[var(--text-muted)]">Recent sample insights and report review workspace.</p>
                    </div>
                </div>
                <SmartDiagnosticLab />
            </section>

            <div className="flex flex-col gap-1 border-t border-gray-100 pt-6 dark:border-slate-800">
                <h2 className="text-xl font-bold text-[var(--text-color)]">Document Repository</h2>
                <p className="text-sm text-[var(--text-muted)]">Secure storage for your medical documents and legacy records.</p>
            </div>

            {error && (
                <PatientAlert icon={AlertCircle} tone="rose">Failed to load medical reports.</PatientAlert>
            )}

            {!error && reports.length === 0 ? (
                <PatientEmptyState
                    icon={FileText}
                    title="No medical reports found"
                    description="Uploaded reports and lab documents will appear here."
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports.map(report => (
                        <div key={report.id} className={`${patientCardClass} flex h-full flex-col p-5 transition-colors hover:border-[var(--primary)]`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-[var(--primary)]">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="px-2.5 py-1 bg-[var(--bg-secondary)] rounded-full text-xs font-medium text-[var(--text-color)]">
                                        {report.reportType}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-lg text-[var(--text-color)] mb-1 line-clamp-2">
                                    {report.reportTitle}
                                </h3>

                                <div className="mt-auto pt-4 text-sm text-[var(--text-muted)] space-y-1">
                                    <p><strong>Uploaded:</strong> {new Date(report.uploadDate).toLocaleDateString()}</p>
                                    <p><strong>By:</strong> {formatDoctorName(report.uploader?.fullName)}</p>
                                </div>

                                <button
                                    onClick={() => handleDownload(report)}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                        </div>
                    ))}
                </div>
            )}
        </PatientPageFrame>
    );
};

export default MedicalReports;
