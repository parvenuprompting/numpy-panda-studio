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

class DataSuggestion(BaseModel):
    type: str # 'astype', 'drop_column', 'fill_na'
    column: str
    description: str
    action_params: Dict[str, Any] # Params to pass to apply_action
    confidence: float # 0.0 to 1.0

class DatasetProfile(BaseModel):
    rows: int
    columns: int
    column_names: List[str]
    dtypes: Dict[str, str]
    missing_values: Dict[str, int]
    memory_usage_mb: float
    column_details: Dict[str, ColumnProfile] = {}
    suggestions: List[DataSuggestion] = []

class DatasetResponse(BaseModel):
    id: str
    preview: List[Dict[str, Any]]
    profile: DatasetProfile
    history: List[ActionSpec] = []

class ActionSpec(BaseModel):
    intent: str
    operations: List[Dict[str, Any]]
