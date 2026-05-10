import React, { useEffect, useState } from 'react';
import { LayoutGrid, Bed as BedIcon, Sparkles, Loader2 } from 'lucide-react';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Bed {
    id: number;
    bedNumber: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
}

interface Ward {
    id: number;
    name: string;
    type: string;
    totalCapacity: number;
    beds: Bed[];
}

const BedHeatmap: React.FC = () => {
    const [wards, setWards] = useState<Ward[]>([]);
    const [loading, setLoading] = useState(true);
    const [forecast, setForecast] = useState<string | null>(null);
    const [predicting, setPredicting] = useState(false);

    const fetchWards = async () => {
        setLoading(true);
        try {
            const res = await api.get('/beds/wards');
            setWards(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch wards:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAIPrediction = async () => {
        setPredicting(true);
        try {
            const res = await api.get('/orchestration/demand-forecast');
            setForecast(res.data?.data || 'No forecast data available.');
        } catch {
            setForecast('Failed to generate AI prediction.');
        } finally {
            setPredicting(false);
        }
    };

    useEffect(() => {
        fetchWards();
    }, []);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-color)]">Hospital Capacity Orchestration</h1>
                    <p className="text-[var(--text-muted)]">AI-driven predictive bed management and ward heatmaps.</p>
                </div>
                <Button onClick={getAIPrediction} disabled={predicting} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white gap-2 border-none">
                    {predicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Demand Forecast
                </Button>
            </div>

            {forecast && (
                <Card className="bg-indigo-50 border-indigo-100 border-l-4 border-l-indigo-600">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                            <div>
                                <p className="text-sm font-bold text-indigo-900 mb-1">AI Predictive Insights (Next 30 Days)</p>
                                <p className="text-sm text-indigo-800 leading-relaxed italic">{forecast}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {wards.map(ward => (
                    <Card key={ward.id} className="overflow-hidden">
                        <div className="bg-gray-50 border-b px-4 py-3 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-[var(--text-color)]">{ward.name}</h3>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">{ward.type} WING</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-[var(--primary)]">
                                    {Math.round((ward.beds.filter(b => b.status === 'OCCUPIED').length / ward.totalCapacity) * 100)}%
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)] font-bold">OCCUPANCY</p>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                                {ward.beds.map(bed => (
                                    <div 
                                        key={bed.id} 
                                        className={`
                                            aspect-square rounded-lg flex flex-col items-center justify-center border-2 transition-all cursor-pointer
                                            ${bed.status === 'AVAILABLE' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:scale-105' : ''}
                                            ${bed.status === 'OCCUPIED' ? 'bg-red-50 border-red-200 text-red-600 shadow-inner' : ''}
                                            ${bed.status === 'CLEANING' ? 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse' : ''}
                                            ${bed.status === 'MAINTENANCE' ? 'bg-gray-100 border-gray-200 text-gray-400' : ''}
                                        `}
                                        title={`Bed ${bed.bedNumber} - ${bed.status}`}
                                    >
                                        <BedIcon className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-bold">{bed.bedNumber}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {wards.length === 0 && !loading && (
                    <div className="col-span-2 text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                        <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-[var(--text-muted)]">No wards configured in the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BedHeatmap;
