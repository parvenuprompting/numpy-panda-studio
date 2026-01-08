import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Play, Filter, Trash2, ArrowUpDown } from 'lucide-react';

type OperationType = 'filter_rows' | 'drop_column' | 'sort_values';

const ActionPanel: React.FC = () => {
    const { currentData, applyAction, isLoading } = useAppStore();
    const [opType, setOpType] = useState<OperationType>('filter_rows');

    // Form States
    const [selectedCol, setSelectedCol] = useState<string>('');
    const [operator, setOperator] = useState<string>('==');
    const [value, setValue] = useState<string>('');
    const [isAscending, setIsAscending] = useState<boolean>(true);

    const columns = currentData && currentData.length > 0 ? Object.keys(currentData[0]) : [];

    // Reset form when operation changes
    const handleOpChange = (type: OperationType) => {
        setOpType(type);
        setValue('');
        // Keep column if possible, else reset
    };

    const handleApply = async () => {
        if (!selectedCol && columns.length > 0) {
            // If user hasn't selected a col yet, pick first to be safe or error
            // Better: force user to pick. But for V1 lets default to first if empty
            // logic below handles empty check
        }

        const col = selectedCol || columns[0];
        if (!col) return;

        let intent = "";
        let params: Record<string, any> = {};

        if (opType === 'filter_rows') {
            intent = `Filter: ${col} ${operator} ${value}`;
            // Simple type inference for value
            let parsedValue: any = value;
            if (!isNaN(Number(value)) && value.trim() !== '') {
                parsedValue = Number(value);
            }
            params = { column: col, operator, value: parsedValue };
        } else if (opType === 'drop_column') {
            intent = `Drop Column: ${col}`;
            params = { column: col };
        } else if (opType === 'sort_values') {
            intent = `Sort by ${col} (${isAscending ? 'Asc' : 'Desc'})`;
            params = { column: col, ascending: isAscending };
        }

        await applyAction({
            intent,
            operations: [{ action: opType, params }]
        });
    };

    if (!currentData) return null;

    return (
        <div className="h-full flex flex-col bg-slate-900 border-l border-white/10 w-80">
            <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Play className="w-4 h-4 text-blue-400" />
                    Action Builder
                </h3>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-6">
                {/* Operation Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operation</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => handleOpChange('filter_rows')}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${opType === 'filter_rows' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            <Filter className="w-4 h-4" />
                            <span className="text-[10px]">Filter</span>
                        </button>
                        <button
                            onClick={() => handleOpChange('sort_values')}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${opType === 'sort_values' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="text-[10px]">Sort</span>
                        </button>
                        <button
                            onClick={() => handleOpChange('drop_column')}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${opType === 'drop_column' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-[10px]">Drop</span>
                        </button>
                    </div>
                </div>

                {/* Dynamic Form */}
                <div className="space-y-4">
                    {/* Column Select */}
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400">Target Column</label>
                        <select
                            value={selectedCol}
                            onChange={(e) => setSelectedCol(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                        >
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Filter Specifics */}
                    {opType === 'filter_rows' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Operator</label>
                                <select
                                    value={operator}
                                    onChange={(e) => setOperator(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="==">Equals (==)</option>
                                    <option value=">">Greater than (&gt;)</option>
                                    <option value="<">Less than (&lt;)</option>
                                    <option value="!=">Not Equals (!=)</option>
                                    <option value=">=">Greater/Equal (&gt;=)</option>
                                    <option value="<=">Less/Equal (&lt;=)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Value</label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Enter value..."
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Sort Specifics */}
                    {opType === 'sort_values' && (
                        <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg border border-white/10">
                            <input
                                type="checkbox"
                                checked={isAscending}
                                onChange={(e) => setIsAscending(e.target.checked)}
                                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm">Ascending Order</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleApply}
                    disabled={isLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Applying...' : 'Apply Transformation'}
                </button>
            </div>
        </div>
    );
};

export default ActionPanel;
