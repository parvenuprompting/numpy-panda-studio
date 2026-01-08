import React from 'react';
import { LayoutDashboard, FileSpreadsheet, Settings } from 'lucide-react';
import ActionPanel from '../components/ActionPanel';

import { useAppStore } from '../store/useAppStore';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { activeView, setActiveView } = useAppStore();

    return (
        <div className="flex h-screen w-screen bg-slate-900 text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-16 md:w-20 bg-slate-800/50 backdrop-blur-md border-r border-slate-700/50 flex flex-col items-center py-6 gap-6 z-20">
                <div className="p-2 mb-4 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>

                <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                    <button
                        onClick={() => setActiveView('data')}
                        className={`p-3 rounded-xl transition-all ${activeView === 'data' ? 'bg-white/10 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                        title="Data Inspector"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setActiveView('settings')}
                        className={`p-3 rounded-xl transition-all ${activeView === 'settings' ? 'bg-white/10 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {/* Background Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex-1 p-6 overflow-auto flex flex-col">
                    {children}
                </div>
            </main>

            {/* Right Action Panel */}
            <ActionPanel />
        </div>
    );
};

export default MainLayout;
