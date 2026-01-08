from engine.code_generator import CodeGenerator
from schemas.api import ActionSpec

def test_generate_script():
    actions = [
        ActionSpec(intent="Drop age", operations=[{"action": "drop_column", "params": {"column": "age"}}]),
        ActionSpec(intent="Filter adults", operations=[{"action": "filter_rows", "params": {"column": "age", "operator": ">", "value": 18}}]),
         # Test string value quoting
        ActionSpec(intent="Filter name", operations=[{"action": "filter_rows", "params": {"column": "name", "operator": "==", "value": "Alice"}}])
    ]
    
    script = CodeGenerator.generate_script(actions, "/data/dataset.csv", "csv")
    
    print(script)
    
    assert "import pandas as pd" in script
    assert "pd.read_csv('/data/dataset.csv')" in script
    assert "df = df.drop(columns=['age'])" in script
    assert "df = df[df['age'] > 18]" in script
    assert "df = df[df['name'] == 'Alice']" in script
