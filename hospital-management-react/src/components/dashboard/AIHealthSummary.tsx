import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, ShieldCheck, AlertCircle, Pill, ChevronRight, Activity } from 'lucide-react';
import api from '../../api';

interface HealthInsight {
    recentHistorySummary: string;
    activeMedications: string[];
    criticalAlerts: string[];
    recommendedActions: string[];
}

const AIHealthSummary: React.FC<{ patientId: number }> = ({ patientId }) => {
    const [insight, setInsight] = useState<HealthInsight | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsight = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/ai/health-summary/${patientId}`);
                setInsight(res.data?.data);
            } catch (err) {
                console.error('Failed to fetch AI summary:', err);
                setError('AI analysis is currently unavailable.');
            } finally {
                setLoading(false);
            }
        };

        if (patientId) fetchInsight();
    }, [patientId]);

    if (loading) {
        return (
            <div className="card p-6 flex flex-col items-center justify-center min-h-[200px] animate-pulse">
                <Loader2 className="h-8 w-8 text-teal-500 animate-spin mb-3" />
                <p className="text-sm text-gray-500 font-medium">MediMate AI is analyzing your medical history...</p>
            </div>
        );
    }

    if (error || !insight) {
        return null; // Don't show if error or no data
    }

    return (
        <div className="card p-0 overflow-hidden border-teal-100 dark:border-teal-900/30 shadow-xl shadow-teal-500/5 transition-all hover:shadow-teal-500/10 group">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold leading-none">AI Health Insights</h3>
                        <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold mt-1">Personalized Clinical Summary</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3 text-white" />
                    <span className="text-[10px] font-bold text-white">Verified</span>
                </div>
            </div>

            <div className="p-5 space-y-6 bg-white dark:bg-slate-900">
                {/* Clinical Journey */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Activity className="h-3 w-3 text-teal-500" /> Recent Journey
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                        "{insight.recentHistorySummary}"
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Meds */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Pill className="h-3 w-3 text-purple-500" /> Active Medications
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {insight.activeMedications.length > 0 ? insight.activeMedications.map((med, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-[11px] font-bold border border-purple-100 dark:border-purple-800/30">
                                    {med}
                                </span>
                            )) : (
                                <span className="text-xs text-gray-400 italic">No active medications found</span>
                            )}
                        </div>
                    </div>

                    {/* Critical Alerts */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-red-500" /> Critical Observations
                        </h4>
                        <div className="space-y-2">
                            {insight.criticalAlerts.length > 0 ? insight.criticalAlerts.map((alert, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                                    <AlertCircle className="h-3 w-3 text-red-500 mt-0.5" />
                                    <span className="text-[11px] font-bold text-red-700 dark:text-red-400 leading-tight">{alert}</span>
                                </div>
                            )) : (
                                <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">No critical alerts detected</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-3">AI Recommendations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {insight.recommendedActions.map((action, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors cursor-default group/item border border-transparent hover:border-teal-100 dark:hover:border-teal-900/30">
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover/item:text-teal-600 transition-colors">{action}</span>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover/item:text-teal-400 transition-all transform group-hover/item:translate-x-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                <Sparkles className="h-2.5 w-2.5 text-teal-500" /> Generated by Clinical AI Assistant
            </div>
        </div>
    );
};

export default AIHealthSummary;
