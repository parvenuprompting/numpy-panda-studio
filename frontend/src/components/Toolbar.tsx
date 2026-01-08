import React from 'react';
import { Undo, Redo, Trash2, Download, FileJson } from 'lucide-react';
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

            {/* Export Actions */}
            <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5 ml-auto">
                <button
                    onClick={() => exportSession('py')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export .py
                </button>
                <div className="w-px bg-white/10 my-1 mx-1"></div>
                <button
                    onClick={() => exportSession('ipynb')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-white/5 rounded-md transition-colors"
                >
                    <FileJson className="w-3.5 h-3.5" />
                    Export .ipynb
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
