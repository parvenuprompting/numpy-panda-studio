from fastapi.testclient import TestClient
from main import app
import os
import pandas as pd

client = TestClient(app)

# Create a dummy CSV for testing
TEST_CSV = "test_dataset.csv"
def setup_module(module):
    df = pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6]})
    df.to_csv(TEST_CSV, index=False)

def teardown_module(module):
    if os.path.exists(TEST_CSV):
        os.remove(TEST_CSV)

def test_full_flow():
    # 1. Load Dataset
    response = client.post("/dataset/load", json={"file_path": TEST_CSV, "file_type": "csv"})
    assert response.status_code == 200
    data = response.json()
    session_id = data["id"]
    assert "preview" in data
    assert "profile" in data
    assert len(data["preview"]) == 3
    
    # 2. Apply Action (Drop B)
    action = {
        "intent": "Drop column B",
        "operations": [{"action": "drop_column", "params": {"column": "B"}}]
    }
    response = client.post(f"/session/{session_id}/apply", json=action)
    assert response.status_code == 200
    data = response.json()
    # Verify B is gone in the preview
    assert "B" not in data["preview"][0]
    
    # 3. Undo
    response = client.post(f"/session/{session_id}/undo")
    assert response.status_code == 200
    data = response.json()
    # Verify B is back
    assert "B" in data["preview"][0]
    
    # 4. Redo
    response = client.post(f"/session/{session_id}/redo")
    assert response.status_code == 200
    data = response.json()
    # Verify B is gone again
    assert "B" not in data["preview"][0]
