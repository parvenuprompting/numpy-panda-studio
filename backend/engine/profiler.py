from schemas.api import DatasetProfile, ColumnProfile
import pandas as pd
import numpy as np

class Profiler:
    """
    Analyzes dataset metadata and statistics.
    """
    @staticmethod
    def profile_dataset(df: pd.DataFrame) -> DatasetProfile:
        columns_details = {}
        for col in df.columns:
            dtype = str(df[col].dtype)
            missing = int(df[col].isnull().sum())
            unique = int(df[col].nunique())
            
            # Basic stats for numeric
            mean_val = None
            min_val = None
            max_val = None
            
            if pd.api.types.is_numeric_dtype(df[col]):
                try:
                    mean_val = float(df[col].mean())
                    min_val = float(df[col].min())
                    max_val = float(df[col].max())
                except:
                    pass
            
            columns_details[col] = ColumnProfile(
                name=col,
                dtype=dtype,
                missing_count=missing,
                unique_count=unique,
                mean=mean_val,
                min=min_val,
                max=max_val
            )

        return DatasetProfile(
            rows=len(df),
            columns=len(df.columns),
            column_names=list(df.columns),
            dtypes=df.dtypes.astype(str).to_dict(),
            missing_values=df.isnull().sum().to_dict(),
            memory_usage_mb=float(df.memory_usage(deep=True).sum() / (1024 * 1024)),
            column_details=columns_details
        )

