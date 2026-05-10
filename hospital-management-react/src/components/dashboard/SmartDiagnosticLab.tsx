import React, { useState } from 'react';
import {
    Sparkles, FileText, Brain, Search,
    ChevronRight, AlertCircle, Clock,
    Share2, Download
} from 'lucide-react';

interface Report {
    id: number;
    title: string;
    date: string;
    type: string;
    status: 'Ready' | 'Analyzing' | 'Action Required';
    aiInsight: string;
    criticalFindings: string[];
}

const SmartDiagnosticLab: React.FC = () => {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const reports: Report[] = [
        {
            id: 1,
            title: 'Complete Blood Count (CBC)',
            date: 'Oct 12, 2025',
            type: 'Laboratory',
            status: 'Ready',
            aiInsight: 'Your hemoglobin levels are slightly below the reference range, suggesting mild anemia. All other parameters are within normal limits.',
            criticalFindings: ['Hemoglobin: 11.2 g/dL (Low)', 'MCV: 82 fL (Normal)']
        },
        {
            id: 2,
            title: 'Chest X-Ray Digital Scan',
            date: 'Nov 05, 2025',
            type: 'Radiology',
            status: 'Action Required',
            aiInsight: 'The AI model has detected a minor opacity in the lower left lobe. Clinical correlation with a specialist is recommended for potential early-stage pneumonia.',
            criticalFindings: ['Lower Left Lobe Opacity Detected', 'Diaphragm: Clear', 'Cardiac Silhouette: Normal Size']
        },
        {
            id: 3,
            title: 'Lipid Profile Panel',
            date: 'May 10, 2026',
            type: 'Cardiology',
            status: 'Ready',
            aiInsight: 'Excellent improvement in LDL cholesterol since last month. Keep maintaining the current diet and exercise routine.',
            criticalFindings: ['Total Cholesterol: 180 mg/dL', 'LDL: 98 mg/dL (Improved)', 'HDL: 52 mg/dL']
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                        <Brain className="h-6 w-6 text-indigo-500" /> Smart Diagnostic Lab
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">AI-powered analysis of your medical reports and imaging.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 shadow-sm transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Reports List */}
                <div className="lg:col-span-5 space-y-3">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                selectedReport?.id === report.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                                : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-indigo-200 hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${selectedReport?.id === report.id ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>
                                    <FileText className={`h-5 w-5 ${selectedReport?.id === report.id ? 'text-white' : 'text-indigo-600'}`} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                                    report.status === 'Action Required'
                                    ? (selectedReport?.id === report.id ? 'bg-red-400 text-white' : 'bg-red-50 text-red-600')
                                    : (selectedReport?.id === report.id ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400')
                                }`}>
                                    {report.status}
                                </span>
                            </div>
                            <h3 className="font-bold text-sm mb-1 truncate">{report.title}</h3>
                            <div className="flex items-center justify-between text-[10px] opacity-70">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {report.date}</span>
                                <span className="font-bold uppercase">{report.type}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Analysis Detail */}
                <div className="lg:col-span-7">
                    <>
                        {selectedReport ? (
                            <div
                                key={selectedReport.id}
                                className="card p-0 overflow-hidden border-indigo-100 dark:border-indigo-900/30 h-full flex flex-col shadow-xl animate-fadeIn"
                            >
                                <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-black mb-1">{selectedReport.title}</h3>
                                            <p className="text-sm opacity-80 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" /> Finalized on {selectedReport.date}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"><Download className="h-4 w-4" /></button>
                                            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"><Share2 className="h-4 w-4" /></button>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                                            <Brain className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-1.5 text-indigo-200">
                                                <Sparkles className="h-3 w-3" /> Clinical AI Interpretation
                                            </h4>
                                            <p className="text-sm leading-relaxed font-medium italic">
                                                "{selectedReport.aiInsight}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Key Parameters & Findings</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedReport.criticalFindings.map((finding, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                                                    <div className={`w-2 h-2 rounded-full ${finding.includes('Low') || finding.includes('Detected') ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{finding}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                            <AlertCircle className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Next Step Advice</p>
                                                <p className="text-[11px] text-indigo-600 dark:text-indigo-300 font-medium leading-relaxed mt-0.5">
                                                    We have automatically highlighted the appropriate slots for a follow-up consultation based on this report.
                                                </p>
                                            </div>
                                            <button className="ml-auto p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest border-t border-gray-100 dark:border-slate-800">
                                    Full HIPAA-Compliant AI Encryption Active
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[32px]">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6">
                                    <Search className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-400">Select a report to view analysis</h3>
                                <p className="text-sm text-gray-300 max-w-xs mt-2">Get instant AI-driven medical insights and high-resolution imaging review.</p>
                            </div>
                        )}
                    </>
                </div>
            </div>
        </div>
    );
};

const Calendar: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default SmartDiagnosticLab;
