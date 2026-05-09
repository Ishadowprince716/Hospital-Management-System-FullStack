import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, TrendingUp, ArrowDownCircle, RefreshCw } from 'lucide-react';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    currentStock: number;
    minThreshold: number;
    unitPrice: number;
    expiryDate: string;
}

const InventoryDashboard: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/inventory/low-stock');
            setItems(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-color)]">Pharmacy & Supply Inventory</h1>
                    <p className="text-[var(--text-muted)]">Real-time stock monitoring and auto-procurement alerts.</p>
                </div>
                <Button onClick={fetchInventory} variant="outline" className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-amber-600">Critical Low Stock</p>
                            <h3 className="text-2xl font-bold text-amber-900">{items.length} Items</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-600">Consumption Rate</p>
                            <h3 className="text-2xl font-bold text-blue-900">+12% vs last wk</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <ArrowDownCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Auto-Orders Pending</p>
                            <h3 className="text-2xl font-bold text-emerald-900">4 Active</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-[var(--text-muted)] border-b">
                                <tr>
                                    <th className="px-6 py-4">Item Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Stock Level</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-[var(--text-color)]">{item.name}</td>
                                        <td className="px-6 py-4 text-[var(--text-muted)]">{item.category}</td>
                                        <td className="px-6 py-4 font-bold text-red-600">{item.currentStock} / {item.minThreshold}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">REORDER REQUIRED</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="outline">Restock Now</Button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)]">
                                            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            No critical low stock items detected.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InventoryDashboard;
