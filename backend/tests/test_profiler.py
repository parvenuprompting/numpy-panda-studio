import pandas as pd
from engine.profiler import Profiler
from schemas.api import DatasetProfile

def test_profiler_basic():
    data = {
        "A": [1, 2, 3, 4, 5],
        "B": ["a", "b", "c", "d", "e"],
        "C": [1.1, 2.2, None, 4.4, 5.5]
    }
    df = pd.DataFrame(data)
    
    profile = Profiler.profile_dataset(df)
    
    assert isinstance(profile, DatasetProfile)
    assert profile.rows == 5
    assert profile.columns == 3
    assert profile.column_names == ["A", "B", "C"]
    assert profile.column_details["A"].mean == 3.0
    assert profile.column_details["C"].missing_count == 1
