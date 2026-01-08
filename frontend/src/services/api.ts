import axios from 'axios';
import type { ActionSpec, DatasetLoadRequest, DatasetResponse } from '../types/dataset-types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const DatasetService = {
    loadDataset: async (request: DatasetLoadRequest): Promise<DatasetResponse> => {
        const response = await api.post<DatasetResponse>('/dataset/load', request);
        return response.data;
    },

    getPreview: async (sessionId: string): Promise<Record<string, any>[]> => {
        const response = await api.get<Record<string, any>[]>(`/dataset/${sessionId}/preview`);
        return response.data;
    },

    applyAction: async (sessionId: string, action: ActionSpec): Promise<DatasetResponse> => {
        const response = await api.post<DatasetResponse>(`/session/${sessionId}/apply`, action);
        return response.data;
    },

    undo: async (sessionId: string): Promise<DatasetResponse> => {
        const response = await api.post<DatasetResponse>(`/session/${sessionId}/undo`);
        return response.data;
    },

    redo: async (sessionId: string): Promise<DatasetResponse> => {
        const response = await api.post<DatasetResponse>(`/session/${sessionId}/redo`);
        return response.data;
    },

    exportSession: async (sessionId: string, format: 'py' | 'ipynb' = 'py'): Promise<Blob> => {
        const response = await api.get(`/session/${sessionId}/export`, {
            params: { format },
            responseType: 'blob'
        });
        return response.data;
    }
};
