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
        
        # Analyze Quality Suggestions
        suggestions = Profiler.analyze_quality(df)

        return DatasetProfile(
            rows=len(df),
            columns=len(df.columns),
            column_names=list(df.columns),
            dtypes=df.dtypes.astype(str).to_dict(),
            missing_values=df.isnull().sum().to_dict(),
            memory_usage_mb=float(df.memory_usage(deep=True).sum() / (1024 * 1024)),
            column_details=columns_details,
            suggestions=suggestions
        )

    @staticmethod
    def analyze_quality(df: pd.DataFrame) -> List['DataSuggestion']:
        from schemas.api import DataSuggestion
        suggestions = []
        
        for col in df.columns:
            # 1. Constant Column -> Drop
            if df[col].nunique() <= 1:
                suggestions.append(DataSuggestion(
                    type='drop_column',
                    column=col,
                    description=f"Column '{col}' has constant value.",
                    action_params={'column': col},
                    confidence=1.0
                ))
                continue # Skip other checks
            
            # 2. All Null -> Drop
            # (Handled by unique=0 usually, depending on dropna)
            if df[col].isnull().all():
                 suggestions.append(DataSuggestion(
                    type='drop_column',
                    column=col,
                    description=f"Column '{col}' is empty.",
                    action_params={'column': col},
                    confidence=1.0
                ))
                 continue

            # 3. Numeric as Object -> Astype
            if df[col].dtype == 'object':
                # Try converting to numeric
                try:
                    num_series = pd.to_numeric(df[col], errors='coerce')
                    # If valid count is high (e.g. > 90% of non-nulls)
                    non_null_original = df[col].dropna().count()
                    non_null_numeric = num_series.dropna().count()
                    
                    if non_null_original > 0 and (non_null_numeric / non_null_original) > 0.95:
                         suggestions.append(DataSuggestion(
                            type='astype',
                            column=col,
                            description=f"Column '{col}' looks numeric.",
                            action_params={'column': col, 'dtype': 'float'}, # Safe default
                            confidence=0.9
                        ))
                except:
                    pass
            
            # 4. Missing Values -> Drop NA or Fill NA (Contextual)
            missing = df[col].isnull().sum()
            if missing > 0:
                 pct_missing = missing / len(df)
                 if pct_missing < 0.1:
                      # Low missing -> Suggest Drop
                       suggestions.append(DataSuggestion(
                            type='drop_na',
                            column=col,
                            description=f"Remove {missing} missing rows in '{col}'",
                            action_params={'subset': [col]},
                            confidence=0.7
                        ))
                 else:
                     # High missing -> Suggest Fill
                     pass # Fill is harder to automate without context (mean? 0?)
        
        return suggestions

