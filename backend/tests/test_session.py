import pandas as pd
import pytest
from engine.session import Session
from schemas.api import ActionSpec

def test_session_time_travel():
    # Setup
    data = {"A": [1, 2, 3, 4, 5], "B": [10, 20, 30, 40, 50]}
    df = pd.DataFrame(data)
    session = Session(session_id="test-1", initial_df=df)
    
    # 1. Apply Action: Drop column B
    action1 = ActionSpec(
        intent="Drop column B",
        operations=[{"action": "drop_column", "params": {"column": "B"}}]
    )
    session.apply_action(action1)
    
    current = session.get_current_df()
    assert "B" not in current.columns
    assert "A" in current.columns
    assert session.current_step == 0
    
    # 2. Apply Action: Filter A > 2
    action2 = ActionSpec(
        intent="Filter A > 2",
        operations=[{"action": "filter_rows", "params": {"column": "A", "operator": ">", "value": 2}}]
    )
    session.apply_action(action2)
    
    current = session.get_current_df()
    assert len(current) == 3 # 3, 4, 5
    assert session.current_step == 1
    
    # 3. Undo (Back to after action 1)
    session.undo()
    current = session.get_current_df()
    assert len(current) == 5 # Filter removed
    assert "B" not in current.columns # Column B still gone
    assert session.current_step == 0
    
    # 4. Undo (Back to initial)
    session.undo()
    current = session.get_current_df()
    assert "B" in current.columns
    assert session.current_step == -1
    
    # 5. Redo (Forward to action 1)
    session.redo()
    current = session.get_current_df()
    assert "B" not in current.columns
    assert session.current_step == 0

    # 6. Branching History: Apply new action from step 0
    # Current state: Step 0 (Drop B). History has 2 items.
    # We apply a DIFFERENT action now.
    action3 = ActionSpec(
        intent="Filter A < 4",
        operations=[{"action": "filter_rows", "params": {"column": "A", "operator": "<", "value": 4}}]
    )
    session.apply_action(action3)
    
    assert session.current_step == 1
    assert len(session.history) == 2 # Old action2 should be gone
    assert session.history[1].intent == "Filter A < 4"
    
    current = session.get_current_df()
    assert len(current) == 3 # 1, 2, 3 (values < 4)
    assert "B" not in current.columns
