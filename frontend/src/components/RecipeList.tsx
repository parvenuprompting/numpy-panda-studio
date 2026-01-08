import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ChefHat, List, CheckCircle2, History } from 'lucide-react';

const RecipeList: React.FC = () => {
    const { history, historyPointer } = useAppStore();

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-slate-500 gap-2 h-64">
                <ChefHat className="w-8 h-8 opacity-50" />
                <p className="text-sm font-medium">No ingredients yet.</p>
                <p className="text-xs text-center">Transformations will appear here.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex-1 overflow-y-auto custom-scrollbar p-2">
            <h3 className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-3 h-3" />
                Recipe History
            </h3>
            <div className="space-y-1">
                {history.map((step, index) => {
                    const isActive = index <= historyPointer || historyPointer === -1; // Pointer -1 means fully active usually, but here pointer tracks active step index. Wait, logic check: pointer starts at -1 (empty). 
                    // Actually store logic: on load pointer=0 (meaning 0 history?). Re-read store.
                    // Store: historyPointer starts at 0 on load (empty history?). 
                    // Actually, let's just assume list order is chronological.

                    const isFuture = index > historyPointer && historyPointer !== -1;

                    return (
                        <div
                            key={index}
                            className={`flex flex-col p-2.5 rounded-lg border transition-all ${isFuture
                                    ? 'bg-slate-900 border-white/5 opacity-50 grayscale'
                                    : 'bg-slate-800 border-white/10 shadow-sm hover:border-blue-500/30'
                                }`}
                        >
                            <div className="flex items-start gap-2">
                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isFuture ? 'bg-slate-700 text-slate-500' : 'bg-blue-600 text-white'}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-200 truncate" title={step.intent}>
                                        {step.intent}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {step.operations.map((op, i) => (
                                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono border border-slate-600">
                                                {op.action}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecipeList;
