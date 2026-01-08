import React from 'react';
import { Undo, Redo, Trash2, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Toolbar: React.FC = () => {
    const { undo, redo, applyAction, exportSession, sessionId, canUndo, canRedo } = useAppStore();

    const handleDropTest = () => {
        applyAction({
            intent: 'Drop Test Column',
            operations: [{ action: 'drop_column', params: { column: 'B' } }] // Hardcoded for demo
        });
    };

    if (!sessionId) return null;

    return (
        <div className="flex items-center gap-2 p-2 bg-slate-800/80 backdrop-blur border border-white/10 rounded-xl mb-4">
            <div className="flex gap-1 border-r border-white/10 pr-2 mr-2">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="p-2 rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="p-2 rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>

            <button
                onClick={handleDropTest}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg text-sm font-medium transition-all mr-auto"
            >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Drop 'B'</span>
            </button>

            <button
                onClick={exportSession}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg text-sm font-medium transition-all"
            >
                <Download className="w-3.5 h-3.5" />
                <span>Export Code</span>
            </button>
        </div>
    );
};

export default Toolbar;
