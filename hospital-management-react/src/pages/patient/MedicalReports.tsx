import React from 'react';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useGetPatientMedicalReportsQuery } from '../../store/api/patientApiSlice';
import { Card, CardContent } from '../../components/ui/Card';

interface MedicalReport {
    id: number;
    reportTitle: string;
    reportType: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    uploader?: { fullName: string };
}

const MedicalReports: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { data, error, isLoading } = useGetPatientMedicalReportsQuery(user?.id as number, {
        skip: !user?.id,
    });

    const reports: MedicalReport[] = data?.data?.content || data?.data || [];

    const handleDownload = (report: MedicalReport) => {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:8080/api/reports/${report.id}/download`, {
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
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-color)]">Medical Reports</h1>
                <p className="text-[var(--text-muted)]">View and download your lab results and medical reports</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>Failed to load medical reports.</p>
                </div>
            )}

            {!error && reports.length === 0 ? (
                <div className="card p-12 text-center text-[var(--text-muted)]">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No medical reports found.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports.map(report => (
                        <Card key={report.id} className="hover:border-[var(--primary)] transition-colors">
                            <CardContent className="p-5 flex flex-col h-full">
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
                                    <p><strong>By:</strong> Dr. {report.uploader?.fullName || 'N/A'}</p>
                                </div>

                                <button
                                    onClick={() => handleDownload(report)}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicalReports;
