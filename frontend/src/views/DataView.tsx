import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import Toolbar from '../components/Toolbar';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartsView from './ChartsView';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const ProfileView: React.FC = () => {
    const { profile } = useAppStore();
    if (!profile) return <div>No profile data</div>;

    const stats = Object.entries(profile.column_details).map(([col, details]) => ({
        name: col,
        valid: profile.rows - details.missing_count,
        missing: details.missing_count,
        unique: details.unique_count,
        type: details.dtype
    }));

    return (
        <div className="space-y-6 overflow-y-auto h-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(profile.column_details).map(([col, details]) => (
                    <div key={col} className="bg-slate-800 p-4 rounded-xl border border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg">{col}</h4>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">{details.dtype}</span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-400">
                            <div className="flex justify-between">
                                <span>Unique:</span>
                                <span className="text-white">{details.unique_count}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Missing:</span>
                                <span className={`${details.missing_count > 0 ? 'text-red-400' : 'text-green-400'}`}>{details.missing_count}</span>
                            </div>
                            {details.mean !== undefined && (
                                <div className="flex justify-between">
                                    <span>Mean:</span>
                                    <span className="text-blue-300">{Number(details.mean).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        {/* Mini Quality Bar */}
                        <div className="mt-3 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden flex">
                            <div className="bg-green-500 h-full" style={{ width: `${((profile.rows - details.missing_count) / profile.rows) * 100}%` }} />
                            <div className="bg-red-500 h-full" style={{ width: `${(details.missing_count / profile.rows) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-white/5">
                <h3 className="font-bold text-xl mb-4">Dataset Health</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats}>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Bar dataKey="valid" stackId="a" fill="#22c55e" name="Valid Rows" />
                            <Bar dataKey="missing" stackId="a" fill="#ef4444" name="Missing Rows" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const DataView: React.FC = () => {
    const { currentData, profile } = useAppStore();
    const [activeTab, setActiveTab] = useState<'grid' | 'profile' | 'charts'>('grid');

    const columnDefs = useMemo<ColDef[]>(() => {
        if (!currentData || currentData.length === 0) return [];
        return Object.keys(currentData[0]).map(key => ({
            field: key,
            headerName: key,
            filter: true,
            sortable: true,
            resizable: true,
            flex: 1,
            minWidth: 100
        }));
    }, [currentData]);

    const defaultColDef = useMemo<ColDef>(() => ({
        sortable: true,
        filter: true,
        resizable: true,
    }), []);

    if (!currentData || currentData.length === 0) {
        return (
            <div className="flex flex-col h-full gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Data Inspector</h2>
                    <Toolbar />
                </div>
                <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-800/20 rounded-2xl border border-white/5">
                    No data loaded.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Data Inspector</h2>
                    {/* Tabs */}
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setActiveTab('grid')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Grid View
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Profiler
                        </button>
                        <button
                            onClick={() => setActiveTab('charts')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'charts' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Visualizer
                        </button>
                    </div>
                </div>
                <Toolbar />
            </div>

            <div className="flex-1 bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden shadow-inner relative flex flex-col">
                {activeTab === 'grid' && (
                    <div className="ag-theme-alpine-dark w-full h-full flex-1">
                        <AgGridReact
                            rowData={currentData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            animateRows={true}
                            pagination={true}
                            paginationPageSize={20}
                        />
                    </div>
                )}
                {activeTab === 'profile' && <ProfileView />}
                {activeTab === 'charts' && <ChartsView />}
            </div>
        </div>
    );
};

export default DataView;
