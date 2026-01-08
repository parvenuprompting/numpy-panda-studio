import pandas as pd
from typing import Optional, Dict, Any, List
import os

class DatasetLoader:
    """
    Handles loading of datasets from various file formats safely.
    """
    @staticmethod
    def load_dataset(file_path: str, file_type: str, encoding: str = 'utf-8') -> pd.DataFrame:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            if file_type == 'csv':
                return pd.read_csv(file_path, encoding=encoding)
            elif file_type == 'json':
                return pd.read_json(file_path)
            elif file_type in ['xls', 'xlsx']:
                return pd.read_excel(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            raise RuntimeError(f"Failed to load dataset: {str(e)}")

    @staticmethod
    def get_preview(df: pd.DataFrame, n: int = 5) -> List[Dict[str, Any]]:
        """
        Returns a preview of the dataset with JSON-serializable data.
        """
        return df.head(n).to_dict(orient='records')
