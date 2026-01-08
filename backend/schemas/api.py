from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DatasetLoadRequest(BaseModel):
    file_path: str
    file_type: str

class ColumnProfile(BaseModel):
    name: str
    dtype: str
    missing_count: int
    unique_count: Optional[int] = None
    mean: Optional[float] = None
    min: Optional[Any] = None
    max: Optional[Any] = None

class DatasetProfile(BaseModel):
    rows: int
    columns: int
    column_names: List[str]
    dtypes: Dict[str, str]
    missing_values: Dict[str, int]
    memory_usage_mb: float
    column_details: Dict[str, ColumnProfile] = {}

class DatasetResponse(BaseModel):
    id: str
    preview: List[Dict[str, Any]]
    profile: DatasetProfile

class ActionSpec(BaseModel):
    intent: str
    operations: List[Dict[str, Any]]
