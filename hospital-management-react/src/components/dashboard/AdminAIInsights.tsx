import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, TrendingUp, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import api from '../../api';

interface AdminInsight {
    revenueRiskSummary: string;
    bottleneckAlerts: string[];
    strategicRecommendations: string[];
}

const AdminAIInsights: React.FC = () => {
    const [insight, setInsight] = useState<AdminInsight | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await api.get('/ai/admin-insights');
                setInsight(res.data?.data);
            } catch (err) {
                console.error('Failed to fetch admin insights:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="card p-6 flex items-center justify-center min-h-[150px]">
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                <span className="text-sm font-medium text-gray-500">MediMate AI is analyzing hospital operations...</span>
            </div>
        );
    }

    if (!insight) return null;

    return (
        <div className="card p-0 overflow-hidden border-indigo-100 dark:border-indigo-900/30 shadow-xl shadow-indigo-500/5">
            <div className="bg-indigo-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="text-sm font-bold">Strategic AI Insights</h3>
                </div>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Operational Audit</span>
            </div>

            <div className="p-5 space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-2">
                        <TrendingUp className="h-3.5 w-3.5" /> Revenue & Efficiency
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                        {insight.revenueRiskSummary}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3" /> Critical Bottlenecks
                        </h4>
                        <div className="space-y-1.5">
                            {insight.bottleneckAlerts.map((alert, i) => (
                                <div key={i} className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-red-400" /> {alert}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-2">
                            <Lightbulb className="h-3 w-3" /> Recommendations
                        </h4>
                        <div className="space-y-1.5">
                            {insight.strategicRecommendations.map((rec, i) => (
                                <div key={i} className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-teal-400" /> {rec}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2 border-t border-gray-100 dark:border-slate-800">
                View Full Operational Report <ArrowRight className="h-3 w-3" />
            </button>
        </div>
    );
};

export default AdminAIInsights;
