import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Play, Filter, Trash2, ArrowUpDown, Edit3, Type, XCircle, PaintBucket, Layers } from 'lucide-react';

type OperationType = 'filter_rows' | 'drop_column' | 'sort_values' | 'rename_column' | 'drop_na' | 'fill_na' | 'astype' | 'groupby_agg' | 'math_transform' | 'conditional';

const ActionPanel: React.FC = () => {
    const { currentData, applyAction, isLoading } = useAppStore();

    // Core State
    const [opType, setOpType] = useState<OperationType>('filter_rows');
    const [columns, setColumns] = useState<string[]>([]);
    const [selectedCol, setSelectedCol] = useState('');

    // Filter
    const [operator, setOperator] = useState('==');
    const [value, setValue] = useState('');

    // Sort
    const [isAscending, setIsAscending] = useState(true);

    // Rename
    const [newName, setNewName] = useState('');

    // Advanced Actions State
    const [targetCols, setTargetCols] = useState<string[]>([]);
    const [dtype, setDtype] = useState<string>('str');
    const [groupByCols, setGroupByCols] = useState<string[]>([]);
    const [aggregations, setAggregations] = useState<Record<string, string>>({});

    // Math & Conditional State
    const [mathFunc, setMathFunc] = useState('log');
    const [resultCol, setResultCol] = useState('');
    const [trueVal, setTrueVal] = useState('');
    const [falseVal, setFalseVal] = useState('');

    useEffect(() => {
        if (currentData && currentData.length > 0) {
            setColumns(Object.keys(currentData[0]));
        }
    }, [currentData]);

    const handleOpChange = (type: OperationType) => {
        setOpType(type);
        setValue('');
        setNewName('');
        setTargetCols([]);
        setGroupByCols([]);
        setAggregations({});
        setResultCol('');
        setTrueVal('');
        setFalseVal('');
        // Keep selectedCol if it exists
    };

    const toggleColumn = (col: string, listSetter: React.Dispatch<React.SetStateAction<string[]>>) => {
        listSetter(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    };

    const handleApply = async () => {
        let intent = "";
        let params: Record<string, any> = {};

        // Common Col
        const col = selectedCol || columns[0];

        if (opType === 'filter_rows') {
            if (!col) return;
            intent = `Filter: ${col} ${operator} ${value}`;
            let parsedValue: any = value;
            if (!isNaN(Number(value)) && value.trim() !== '') parsedValue = Number(value);
            params = { column: col, operator, value: parsedValue };

        } else if (opType === 'drop_column') {
            if (!col) return;
            intent = `Drop Column: ${col}`;
            params = { column: col };

        } else if (opType === 'sort_values') {
            if (!col) return;
            intent = `Sort by ${col} (${isAscending ? 'Asc' : 'Desc'})`;
            params = { column: col, ascending: isAscending };

        } else if (opType === 'rename_column') {
            if (!col || !newName) return;
            intent = `Rename ${col} to ${newName}`;
            params = { old_name: col, new_name: newName };

        } else if (opType === 'drop_na') {
            if (targetCols.length === 0) return;
            intent = `Drop Missing in ${targetCols.length} cols`;
            params = { subset: targetCols };

        } else if (opType === 'fill_na') {
            if (targetCols.length === 0 || !value) return;
            intent = `Fill Missing with ${value}`;
            let parsedValue: any = value;
            if (!isNaN(Number(value)) && value.trim() !== '') parsedValue = Number(value);
            params = { columns: targetCols, value: parsedValue };

        } else if (opType === 'astype') {
            if (!col) return;
            intent = `Convert ${col} to ${dtype}`;
            params = { column: col, dtype };

        } else if (opType === 'groupby_agg') {
            if (groupByCols.length === 0 || Object.keys(aggregations).length === 0) return;
            intent = `Group By ${groupByCols.join(', ')}`;
            params = { group_by: groupByCols, aggregations };

        } else if (opType === 'math_transform') {
            if (!col || !resultCol) return;
            intent = `Math: ${mathFunc}(${col}) -> ${resultCol}`;
            params = { target_col: col, function: mathFunc, new_col_name: resultCol };

        } else if (opType === 'conditional') {
            if (!col || !resultCol || !value) return;
            intent = `If ${col} ${operator} ${value} Then ${trueVal} Else ${falseVal}`;
            let parsedValue: any = value;
            if (!isNaN(Number(value)) && value.trim() !== '') parsedValue = Number(value);

            // Parse True/False vals if numbers
            let tVal: any = trueVal;
            if (!isNaN(Number(trueVal)) && trueVal.trim() !== '') tVal = Number(trueVal);
            let fVal: any = falseVal;
            if (!isNaN(Number(falseVal)) && falseVal.trim() !== '') fVal = Number(falseVal);

            params = {
                column: col, operator, value: parsedValue,
                true_val: tVal, false_val: fVal, new_col: resultCol
            };
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
                    NumPanda Action
                </h3>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar">

                {/* Operation Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operation</label>
                    <div className="grid grid-cols-5 gap-1">
                        {[
                            { id: 'filter_rows', icon: Filter, label: 'Filter' },
                            { id: 'sort_values', icon: ArrowUpDown, label: 'Sort' },
                            { id: 'drop_column', icon: Trash2, label: 'Drop' },
                            { id: 'rename_column', icon: Edit3, label: 'Rename' },
                            { id: 'astype', icon: Type, label: 'Type' },
                            { id: 'drop_na', icon: XCircle, label: 'DropNA' },
                            { id: 'fill_na', icon: PaintBucket, label: 'FillNA' },
                            { id: 'groupby_agg', icon: Layers, label: 'Group' },
                            { id: 'math_transform', icon: Play, label: 'Math' },
                            { id: 'conditional', icon: Play, label: 'If/Else' },
                        ].map((op) => (
                            <button
                                key={op.id}
                                onClick={() => handleOpChange(op.id as OperationType)}
                                className={`p-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all h-14 ${opType === op.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                                title={op.label}
                            >
                                <op.icon className="w-3.5 h-3.5" />
                                <span className="text-[9px] whitespace-nowrap">{op.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full h-px bg-white/5 my-2"></div>

                {/* Dynamic Form Area */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

                    {/* Common: Single Column Select */}
                    {['filter_rows', 'drop_column', 'sort_values', 'rename_column', 'astype', 'math_transform', 'conditional'].includes(opType) && (
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400">Target Column</label>
                            <select
                                value={selectedCol}
                                onChange={(e) => setSelectedCol(e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                            >
                                <option value="">Select column...</option>
                                {columns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Filter Specifics */}
                    {opType === 'filter_rows' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Operator</label>
                                <select
                                    value={operator}
                                    onChange={(e) => setOperator(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                >
                                    <option value="==">Equals (==)</option>
                                    <option value=">">Greater (&gt;)</option>
                                    <option value="<">Less (&lt;)</option>
                                    <option value="!=">Not Equals (!=)</option>
                                    <option value=">=">Greater/Eq (&gt;=)</option>
                                    <option value="<=">Less/Eq (&lt;=)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Value</label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Value..."
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                        </>
                    )}

                    {/* Sort Specifics */}
                    {opType === 'sort_values' && (
                        <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg border border-white/10">
                            <input
                                type="checkbox"
                                checked={isAscending}
                                onChange={(e) => setIsAscending(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm font-medium text-slate-300">Ascending Order</span>
                        </div>
                    )}

                    {/* Rename Specifics */}
                    {opType === 'rename_column' && (
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400">New Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="New name..."
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>
                    )}

                    {/* Type Conversion */}
                    {opType === 'astype' && (
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400">Target Type</label>
                            <select
                                value={dtype}
                                onChange={(e) => setDtype(e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                            >
                                <option value="str">String (Text)</option>
                                <option value="int">Integer (Number)</option>
                                <option value="float">Float (Decimal)</option>
                                <option value="bool">Boolean (T/F)</option>
                            </select>
                        </div>
                    )}

                    {/* Multi-Select Commons (DropNA, FillNA) */}
                    {(opType === 'drop_na' || opType === 'fill_na') && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-slate-400">Target Columns</label>
                                <button onClick={() => setTargetCols(columns)} className="text-[10px] text-blue-400 hover:text-blue-300">Select All</button>
                            </div>
                            <div className="max-h-48 overflow-y-auto bg-slate-800 border border-white/10 rounded-lg p-2 space-y-1 custom-scrollbar">
                                {columns.map(col => (
                                    <label key={col} className="flex items-center gap-2 text-sm hover:bg-white/5 p-1.5 rounded cursor-pointer select-none transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={targetCols.includes(col)}
                                            onChange={() => toggleColumn(col, setTargetCols)}
                                            className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0"
                                        />
                                        <span className="truncate text-slate-300">{col}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {opType === 'fill_na' && (
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400">Fill Value</label>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Value..."
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>
                    )}

                    {/* Group By */}
                    {opType === 'groupby_agg' && (
                        <div className="space-y-4">
                            {/* Group Columns Selector */}
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Group By</label>
                                <div className="max-h-32 overflow-y-auto bg-slate-800 border border-white/10 rounded-lg p-2 space-y-1 custom-scrollbar">
                                    {columns.map(col => (
                                        <label key={col} className="flex items-center gap-2 text-sm hover:bg-white/5 p-1 rounded cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={groupByCols.includes(col)}
                                                onChange={() => toggleColumn(col, setGroupByCols)}
                                                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-0"
                                            />
                                            <span className="truncate text-slate-300">{col}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Aggregations Map */}
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Aggregations</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    {columns.filter(c => !groupByCols.includes(c)).map(col => (
                                        <div key={col} className="flex gap-2 items-center bg-slate-800/50 p-1.5 rounded border border-white/5">
                                            <span className="text-[11px] w-24 truncate text-slate-400" title={col}>{col}</span>
                                            <select
                                                className="flex-1 bg-slate-900 border border-white/10 rounded text-xs p-1 text-white focus:border-blue-500 outline-none"
                                                onChange={(e) => {
                                                    if (e.target.value === '') {
                                                        const newAggs = { ...aggregations };
                                                        delete newAggs[col];
                                                        setAggregations(newAggs);
                                                    } else {
                                                        setAggregations({ ...aggregations, [col]: e.target.value });
                                                    }
                                                }}
                                                value={aggregations[col] || ''}
                                            >
                                                <option value="">-</option>
                                                <option value="mean">Mean</option>
                                                <option value="sum">Sum</option>
                                                <option value="count">Count</option>
                                                <option value="min">Min</option>
                                                <option value="max">Max</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Math Transform */}
                    {opType === 'math_transform' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Function</label>
                                <select
                                    value={mathFunc}
                                    onChange={(e) => setMathFunc(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                >
                                    <option value="log">Log (np.log)</option>
                                    <option value="sqrt">Sqrt (np.sqrt)</option>
                                    <option value="ceil">Ceil (np.ceil)</option>
                                    <option value="round">Round (np.round)</option>
                                    <option value="abs">Abs (np.abs)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">New Column Name</label>
                                <input
                                    type="text"
                                    value={resultCol}
                                    onChange={(e) => setResultCol(e.target.value)}
                                    placeholder="e.g. log_price"
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                        </>
                    )}

                    {/* Conditional (If/Else) */}
                    {opType === 'conditional' && (
                        <>
                            <div className="flex gap-2">
                                <div className="space-y-1 w-1/3">
                                    <label className="text-xs text-slate-400">Operator</label>
                                    <select
                                        value={operator}
                                        onChange={(e) => setOperator(e.target.value)}
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                    >
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                        <option value="==">==</option>
                                        <option value="!=">!=</option>
                                        <option value=">=">&gt;=</option>
                                        <option value="<=">&lt;=</option>
                                    </select>
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs text-slate-400">Compare Value</label>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="space-y-1 w-1/2">
                                    <label className="text-xs text-slate-400">True Value</label>
                                    <input
                                        type="text"
                                        value={trueVal}
                                        onChange={(e) => setTrueVal(e.target.value)}
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                    />
                                </div>
                                <div className="space-y-1 w-1/2">
                                    <label className="text-xs text-slate-400">False Value</label>
                                    <input
                                        type="text"
                                        value={falseVal}
                                        onChange={(e) => setFalseVal(e.target.value)}
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Result Column</label>
                                <input
                                    type="text"
                                    value={resultCol}
                                    onChange={(e) => setResultCol(e.target.value)}
                                    placeholder="e.g. status"
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                        </>
                    )}

                </div>
            </div>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleApply}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-sm text-white shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Applying...' : 'Apply Transformation'}
                </button>
            </div>
        </div>
    );
};

export default ActionPanel;
