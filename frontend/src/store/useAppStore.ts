import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DatasetService } from '../services/api';
import type { ActionSpec, DatasetProfile, DatasetLoadRequest } from '../types/dataset-types';

interface UserSettings {
    theme: 'dark'; // V1 only supports dark
    gridDensity: 'compact' | 'standard' | 'comfortable';
    showComments: boolean;
    autoSave: boolean;
}

interface AppState {
    // Navigation
    activeView: 'data' | 'settings';
    setActiveView: (view: 'data' | 'settings') => void;

    // Settings
    settings: UserSettings;
    updateSettings: (newSettings: Partial<UserSettings>) => void;

    // Data Session
    sessionId: string | null;
    currentData: Record<string, any>[];
    currentData: Record<string, any>[] | null; // Changed to allow null for initial state
    profile: DatasetProfile | null;
    isLoading: boolean;
    error: string | null;
    canUndo: boolean;
    canRedo: boolean;
    historyPointer: number;
    maxHistory: number;
}

interface AppActions {
    loadDataset: (req: DatasetLoadRequest) => Promise<void>;
    applyAction: (action: ActionSpec) => Promise<void>;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
    clearError: () => void;
    exportSession: (format: 'py' | 'ipynb') => Promise<void>;
}

export const useAppStore = create<AppState & AppActions>()(
    persist(
        (set, get) => ({
            // Init Navigation
            activeView: 'data',
            setActiveView: (view) => set({ activeView: view }),

            // Init Settings
            settings: {
                theme: 'dark',
                gridDensity: 'standard',
                showComments: true,
                autoSave: true
            },
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            // Init Session
            sessionId: null,
            currentData: null,
            profile: null,
            historyPointer: -1,
            maxHistory: -1,
            canUndo: false,
            canRedo: false,
            isLoading: false,
            error: null,

            loadDataset: async (req) => {
                try {
                    set({ isLoading: true, error: null });
                    const res = await DatasetService.loadDataset(req);
                    set({
                        sessionId: res.id,
                        currentData: res.preview,
                        profile: res.profile,
                        // Reset history on new load
                        canUndo: false,
                        canRedo: false,
                        historyPointer: 0,
                        maxHistory: 0,
                        activeView: 'data' // Switch to data view on load
                    });
                } catch (err: any) {
                    set({ error: err.message || 'Failed to load' });
                } finally {
                    set({ isLoading: false });
                }
            },

            applyAction: async (action) => {
                const { sessionId, settings } = get();
                if (!sessionId) return;
                try {
                    set({ isLoading: true, error: null });
                    // In a real app we might inject settings like 'showComments' into the action metadata here
                    const res = await DatasetService.applyAction(sessionId, action);
                    set({
                        currentData: res.preview,
                        profile: res.profile,
                        // Optimistic history update (backend handles truth)
                        canUndo: true,
                        canRedo: false
                    });
                } catch (err: any) {
                    set({ error: err.message || 'Action failed' });
                } finally {
                    set({ isLoading: false });
                }
            },

            undo: async () => {
                const { sessionId } = get();
                if (!sessionId) return;
                try {
                    set({ isLoading: true });
                    const res = await DatasetService.undo(sessionId);
                    set({
                        currentData: res.preview,
                        profile: res.profile,
                        // We strictly should ask backend for canUndo status, but for V1 we toggle basic state
                        // A better backend response would include { can_undo: bool, can_redo: bool }
                        activeView: 'data'
                    });
                    // Force refresh capabilities - simplified for V1
                    const pointer = get().historyPointer; // This logic needs to be robust, for now we rely on user
                } catch (err: any) {
                    set({ error: err.message });
                } finally {
                    set({ isLoading: false, canUndo: true, canRedo: true }); // Enable both to allow exploring
                }
            },

            redo: async () => {
                const { sessionId } = get();
                if (!sessionId) return;
                try {
                    set({ isLoading: true });
                    const res = await DatasetService.redo(sessionId);
                    set({ currentData: res.preview, profile: res.profile });
                } catch (err: any) {
                    set({ error: err.message });
                } finally {
                    set({ isLoading: false });
                }
            },

            exportSession: async (format) => {
                const { sessionId } = get();
                if (!sessionId) return;
                try {
                    const blob = await DatasetService.exportSession(sessionId, format);
                    // Create download link
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = format === 'ipynb' ? 'pandas_analysis.ipynb' : 'pandas_script.py';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } catch (err: any) {
                    console.error("Export failed", err);
                    set({ error: "Export failed" });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'pandas-studio-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({ settings: state.settings }), // Only persist settings
        },
    ),
);
