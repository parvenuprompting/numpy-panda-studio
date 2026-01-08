import pandas as pd
from typing import Dict, Any, Optional

def inspect_dataset(df: pd.DataFrame, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Returns detailed inspection data for a dataset.
    """
    # Logic for deep inspection, e.g. value counts for specific columns, etc.
    # For V1, we return the head of the dataframe and simple stats.
    return {
        "head": df.head(10).to_dict(orient='records'),
        "columns": list(df.columns),
        "shape": df.shape
    }
