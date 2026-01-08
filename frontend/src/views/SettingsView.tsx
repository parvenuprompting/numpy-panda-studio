import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Settings, Monitor, MessageSquare, Save, AlertTriangle } from 'lucide-react';

const SettingsView: React.FC = () => {
    const { settings, updateSettings, sessionId } = useAppStore();

    return (
        <div className="max-w-4xl mx-auto h-full overflow-y-auto pr-4">
            <header className="mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Settings className="w-8 h-8 text-blue-400" />
                    Settings
                </h2>
                <p className="text-slate-400 mt-2">Configure your Pandas Studio environment.</p>
            </header>

            <div className="space-y-6">

                {/* Appearance Section */}
                <section className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-purple-400" />
                        Appearance
                    </h3>

                    <div className="grid gap-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="block font-medium text-slate-200">Grid Density</label>
                                <p className="text-sm text-slate-400">Controls the spacing of rows in the data grid.</p>
                            </div>
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-white/10">
                                {['compact', 'standard', 'comfortable'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => updateSettings({ gridDensity: option as any })}
                                        className={`px-4 py-2 rounded-md text-sm capitalize transition-all ${settings.gridDensity === option ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/5 pt-6">
                            <div>
                                <label className="block font-medium text-slate-200">Theme</label>
                                <p className="text-sm text-slate-400">Toggle between Dark and Light mode (Coming Soon).</p>
                            </div>
                            <button disabled className="px-4 py-2 bg-slate-700 text-slate-400 rounded-lg cursor-not-allowed text-sm">
                                Dark Mode Only
                            </button>
                        </div>
                    </div>
                </section>

                {/* Code Generation Section */}
                <section className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-400" />
                        Code Generation
                    </h3>

                    <div className="flex justify-between items-center">
                        <div>
                            <label className="block font-medium text-slate-200">Include Comments</label>
                            <p className="text-sm text-slate-400">Add explanatory comments to the generated Python script.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.showComments}
                                onChange={(e) => updateSettings({ showComments: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </section>

                {/* General / Session */}
                <section className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Save className="w-5 h-5 text-yellow-400" />
                        Session
                    </h3>

                    <div className="flex justify-between items-center">
                        <div>
                            <label className="block font-medium text-slate-200">Auto-Save Actions</label>
                            <p className="text-sm text-slate-400">Automatically save session state after every action.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.autoSave}
                                onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </section>

                {/* Danger Zone */}
                {sessionId && (
                    <section className="bg-red-900/10 border border-red-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                        </h3>
                        <p className="text-sm text-red-300/70 mb-4">Actions here cannot be undone.</p>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Force Reload Application
                        </button>
                    </section>
                )}

            </div>
        </div>
    );
};

export default SettingsView;
