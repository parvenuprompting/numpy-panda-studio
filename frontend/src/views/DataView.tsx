import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import Toolbar from '../components/Toolbar';

const DataView: React.FC = () => {
    const { currentData, profile, undo, redo, canUndo, canRedo } = useAppStore();

    if (!currentData || currentData.length === 0) {
        return <div className="text-center text-slate-400">Loading data or empty dataset...</div>;
    }

    const columns = Object.keys(currentData[0]);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Data Inspector</h2>
                    {profile && <span className="text-slate-400 text-sm">{profile.rows} rows • {profile.columns} columns</span>}
                </div>
                <Toolbar />
            </div>

            <div className="flex-1 bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden shadow-inner relative">
                <div className="absolute inset-0 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    {columns.map(col => (
                                        <td key={`${idx}-${col}`} className="p-3 text-sm text-slate-300 whitespace-nowrap">
                                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataView;
