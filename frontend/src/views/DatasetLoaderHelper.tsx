import React from 'react';
import { UploadCloud } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';


const DatasetLoaderHelper: React.FC = () => {
    const { loadDataset, isLoading, error } = useAppStore();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // In a real implementation we would actually use the File object.
        // But our backend currently expects a file PATH path string for local loading.
        // Since we cannot get the full path from browser for security reasons,
        // and this is a local app, we will assume for V1 the user puts files in a known "data" folder
        // OR we just send the name and backend tries to find it.
        // WAIT: The backend explicitly takes "file_path".
        // For this demo to work cleanly without a real file picker dialog that returns paths (which electron/tauri has),
        // we might need to fake it or rely on the user typing the path?
        // Let's assume for this "Portfolio Demo" we just pass a test string or we use a hardcoded path for now to show it working,
        // OR we implement a simple text input for "Path".

        // BETTER: Implementation Plan said "Load a CSV".
        // Let's implement a text input for "Absolute File Path" to be strictly correct with backend.

        await loadDataset({ file_path: file.name, file_type: 'csv' }); // This won't work for real files unless in root.
    };

    // Changing UI to accept Path Input for V1 local compatibility
    const [path, setPath] = React.useState("/Users/T/Documents/Code/1-jan/week-2/pandas-generator-studio/backend/test_dataset.csv"); // Default for demo

    const handleLoad = async () => {
        await loadDataset({ file_path: path, file_type: 'csv' });
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center max-w-lg w-full shadow-2xl">
                <div className="bg-blue-500/20 p-4 rounded-full inline-flex mb-6 text-blue-400">
                    <UploadCloud className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Load Dataset</h2>
                <p className="text-slate-400 mb-8">Enter the absolute path to your local CSV file.</p>

                {error && <div className="mb-4 text-red-400 bg-red-900/20 p-2 rounded">{error}</div>}

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="/path/to/file.csv"
                    />
                    <button
                        onClick={handleLoad}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all px-6 py-3 rounded-xl font-semibold text-white"
                    >
                        {isLoading ? 'Loading...' : 'Load'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatasetLoaderHelper;
