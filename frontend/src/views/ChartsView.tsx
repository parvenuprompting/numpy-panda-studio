import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ChartsView: React.FC = () => {
    const { currentData, profile } = useAppStore();

    if (!currentData || !profile) return null;

    const renderChart = (col: string, details: any) => {
        // Prepare Data
        const values = currentData.map(row => row[col]).filter(v => v !== null && v !== undefined);
        const uniqueCount = new Set(values).size;

        // Decision Logic: Bar (Histogram) vs Pie (Categorical)
        const isNumeric = ['int', 'float', 'number'].some(t => details.dtype.includes(t));
        const isCategorical = uniqueCount < 20 || !isNumeric;

        let chartData = [];
        let ChartComponent;

        if (isCategorical) {
            // Count frequencies
            const counts: Record<string, number> = {};
            values.forEach(v => counts[String(v)] = (counts[String(v)] || 0) + 1);
            chartData = Object.entries(counts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10); // Top 10

            ChartComponent = (
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
            );
        } else {
            // Numeric Histogram (Simple Binning or just raw top 50 sort?)
            // For now, let's just take top 20 values for bar chart to keep it simple without complex binning
            chartData = values.slice(0, 50).map((v, i) => ({ name: i, value: Number(v) }));

            ChartComponent = (
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                        <XAxis hide />
                        <YAxis hide />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            );
        }

        return (
            <div key={col} className="bg-slate-800 p-4 rounded-xl border border-white/5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-200 truncate pr-2 w-32" title={col}>{col}</h4>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-400 font-mono">{details.dtype}</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    {ChartComponent}
                </div>
                <div className="mt-4 flex justify-between text-xs text-slate-500">
                    <span>{uniqueCount} Unique</span>
                    <span>{values.length} Rows</span>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto p-6 bg-slate-900/50">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span> Data Visualizer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {Object.entries(profile.column_details).map(([col, details]) => renderChart(col, details))}
            </div>
        </div>
    );
};

export default ChartsView;
