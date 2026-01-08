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

                {/* Recipe List */}
                <div className="w-full flex-1 overflow-hidden border-t border-slate-700/50 flex flex-col pt-2">
                    {/* We need to pass the RecipeList here directly, or render it. 
                        But wait, the Sidebar w-20 is too narrow for text.
                        The design plan said: "Visualizes the history stack... Render a vertical list... Place this in the Left Sidebar".
                        Wait, sidebar is currently wide enough only for icons: w-16 md:w-20.
                        I need to expand the sidebar or make it a drawer?
                        Or maybe place it above ActionPanel in the Right Sidebar?
                        Plan said: "Place this in the Left Sidebar (or above the ActionPanel in the Right Sidebar)."
                        Right Sidebar (ActionPanel) is w-80. That's better for text.
                        The Left Sidebar is strictly navigation rail.
                        
                        Decision: INTEGRATE INTO RIGHT SIDEBAR (ActionPanel).
                        It makes more sense as "Ingredients" for the "Action".
                      */}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {/* Background Gradients */}
                {/* Video Background */}
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute w-full h-full object-cover opacity-30"
                        poster="/video-poster.png" // Optional
                    >
                        <source src="/videos/background.mp4" type="video/mp4" />
                    </video>
                    {/* Overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-slate-900/80" />
                </div>

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
