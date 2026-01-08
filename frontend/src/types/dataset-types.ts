export interface ColumnProfile {
    name: string;
    dtype: string;
    missing_count: number;
    unique_count?: number;
    mean?: number;
    min?: any;
    max?: any;
}

export interface DatasetProfile {
    rows: number;
    columns: number;
    column_names: string[];
    dtypes: Record<string, string>;
    missing_values: Record<string, number>;
    memory_usage_mb: number;
    column_details: Record<string, ColumnProfile>;
}

export interface DatasetResponse {
    id: string; // Session ID
    preview: Record<string, any>[];
    profile: DatasetProfile;
}

export interface ActionSpec {
    intent: string;
    operations: { action: string; params: Record<string, any> }[];
}

export interface DatasetLoadRequest {
    file_path: string;
    file_type: string;
}
