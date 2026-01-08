import React from 'react';
import { UploadCloud } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';


const DatasetLoaderHelper: React.FC = () => {
    const { loadDataset, isLoading, error } = useAppStore();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // 1. Determine type
            let type = 'csv';
            if (file.name.endsWith('.json')) type = 'json';
            else if (file.name.match(/\.xlsx?$/)) type = 'xlsx';

            // 2. Upload via API (Returns ID)
            // Ideally we move this logic to the store, but calling service directly is okay for now
            // Or better: update loadDataset to support file upload?
            // Existing store loadDataset calls service.loadDataset.
            // We can add a specialized action in store, but let's do it here for V1.

            // We need to import the service dynamically or add it to store?
            // Since store only exposes loadDataset (by path/id), let's use the service here.
            // But we need to update store state (loading).
            // Actually, `loadDataset` in store expects a path.
            // We will pass the UUID as the path.

            // First, manual upload.
            const { DatasetService } = await import('../services/api');

            // We can set loading state via a hack or just rely on the loadDataset loading state later?
            // User feedback is better if we show "Uploading".
            // Since we don't have an upload action in store, we'll just await the service.
            const { file_id } = await DatasetService.uploadDataset(file);

            // 3. Load Session via ID
            await loadDataset({ file_path: file_id, file_type: type });

        } catch (err) {
            console.error("Upload failed", err);
            // Store handles error setting for loadDataset, but upload might fail outside it.
            // Ideally we'd trigger setError.
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center max-w-lg w-full shadow-2xl">
                <div className="bg-blue-500/20 p-4 rounded-full inline-flex mb-6 text-blue-400">
                    <UploadCloud className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Load Dataset</h2>
                <p className="text-slate-400 mb-8">Upload a CSV or Excel file to begin analysis.</p>

                {error && <div className="mb-4 text-red-400 bg-red-900/20 p-2 rounded text-sm">{error}</div>}

                <div className="flex flex-col gap-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-2xl cursor-pointer hover:bg-slate-800/50 hover:border-blue-500/50 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="mb-2 text-sm text-slate-400 group-hover:text-blue-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-slate-500">CSV, XLSX, JSON</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept=".csv,.xlsx,.xls,.json"
                            onChange={handleFileUpload}
                            disabled={isLoading}
                        />
                    </label>

                    {isLoading && (
                        <div className="text-sm text-blue-400 animate-pulse">
                            Processing secure upload...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatasetLoaderHelper;
