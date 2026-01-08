export interface ColumnProfile {
    total_count: number;
    unique_count: number;
    missing_count: number;
    dtype: string;
    mean?: number | null;
    min?: number | string | null;
    max?: number | string | null;
}

export interface DataSuggestion {
    column: string;
    issue: string;
    suggestion: string;
    confidence: number;
}

export interface DatasetProfile {
    rows: number;
    cols: number;
    column_details: Record<string, ColumnProfile>;
    suggestions?: DataSuggestion[];
}

export interface ActionSpec {
    intent: string;
    operations: Array<{
        action: string;
        params: Record<string, any>;
    }>;
}

export interface DatasetResponse {
    id: string;
    preview: Record<string, any>[];
    profile: DatasetProfile;
    history: ActionSpec[];
}

export interface DatasetLoadRequest {
    file_path: string;
    file_type: 'csv' | 'json' | 'parquet' | 'excel';
}
