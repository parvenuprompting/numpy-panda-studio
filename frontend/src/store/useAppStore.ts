import { create } from 'zustand';
import { DatasetService } from '../services/api';
import { ActionSpec, DatasetProfile, DatasetLoadRequest } from '../types/dataset-types';

interface AppState {
    sessionId: string | null;
    currentData: Record<string, any>[];
    profile: DatasetProfile | null;
    isLoading: boolean;
    error: string | null;
    canUndo: boolean;
    canRedo: boolean;
    historyPointer: number;
    maxHistory: number;

    // Actions
    loadDataset: (request: DatasetLoadRequest) => Promise<void>;
    applyAction: (action: ActionSpec) => Promise<void>;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
    exportSession: () => Promise<void>;
    clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    sessionId: null,
    currentData: [],
    profile: null,
    isLoading: false,
    error: null,
    canUndo: false,
    canRedo: false,
    historyPointer: -1,
    maxHistory: -1,

    loadDataset: async (request: DatasetLoadRequest) => {
        set({ isLoading: true, error: null });
        try {
            const response = await DatasetService.loadDataset(request);
            set({
                sessionId: response.id,
                currentData: response.preview,
                profile: response.profile,
                isLoading: false,
                historyPointer: -1,
                maxHistory: -1,
                canUndo: false,
                canRedo: false
            });
        } catch (err: any) {
            set({ error: err.message || 'Failed to load dataset', isLoading: false });
        }
    },

    applyAction: async (action: ActionSpec) => {
        const { sessionId, historyPointer } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await DatasetService.applyAction(sessionId, action);
            const newPointer = historyPointer + 1;
            set({
                currentData: response.preview,
                profile: response.profile,
                isLoading: false,
                historyPointer: newPointer,
                maxHistory: newPointer,
                canUndo: true,
                canRedo: false
            });
        } catch (err: any) {
            set({ error: err.message || 'Failed to apply action', isLoading: false });
        }
    },

    undo: async () => {
        const { sessionId, historyPointer } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await DatasetService.undo(sessionId);
            const newPointer = historyPointer - 1;
            set({
                currentData: response.preview,
                profile: response.profile,
                isLoading: false,
                historyPointer: newPointer,
                canUndo: newPointer > -1,
                canRedo: true
            });
        } catch (err: any) {
            set({ error: err.message || 'Failed to undo', isLoading: false });
        }
    },

    redo: async () => {
        const { sessionId, historyPointer, maxHistory } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await DatasetService.redo(sessionId);
            const newPointer = historyPointer + 1;
            set({
                currentData: response.preview,
                profile: response.profile,
                isLoading: false,
                historyPointer: newPointer,
                canUndo: true,
                canRedo: newPointer < maxHistory
            });
        } catch (err: any) {
            set({ error: err.message || 'Failed to redo', isLoading: false });
        }
    },

    exportSession: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
            const blob = await DatasetService.exportSession(sessionId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'pandas_script.py');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            set({ isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to export session', isLoading: false });
        }
    },

    clearError: () => set({ error: null })
}));
