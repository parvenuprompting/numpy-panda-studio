import pandas as pd
from typing import List, Optional
from schemas.api import ActionSpec
from engine.actions import ActionRegistry
from engine.dataset_loader import DatasetLoader
from engine.profiler import Profiler
from schemas.api import DatasetResponse

class Session:
    """
    Manages the state of a user session, including the dataset history (Time Travel).
    """
    def __init__(self, session_id: str, initial_df: pd.DataFrame, file_path: str = "", file_type: str = "csv"):
        self.session_id = session_id
        self.initial_df = initial_df.copy()
        self.file_path = file_path
        self.file_type = file_type
        
        # History tracks the actions applied
        self.history: List[ActionSpec] = []
        
        # Pointer to the current step in history (indices into self.history)
        # -1 means initial state (no actions appied)
        # 0 means after first action, etc.
        self.current_step: int = -1
        
        # Cache the current state DataFrame to avoid recomputing from scratch every time
        # In a real heavy app, we might want to cache every step or use checkpoints.
        # For V1, simple recompute or single-step update is fine. 
        # But to support Undo/Redo efficiently, we can recompute from initial if needed, 
        # or keep a cache of the current valid DF.
        self._current_df_cache: Optional[pd.DataFrame] = self.initial_df.copy()

    def get_current_df(self) -> pd.DataFrame:
        if self._current_df_cache is None:
            self._recompute_current_state()
        return self._current_df_cache # type: ignore

    def apply_action(self, action: ActionSpec):
        # If we are in the middle of history and apply a new action, 
        # we discard all future redo-able actions (branching time not supported in V1)
        if self.current_step < len(self.history) - 1:
            self.history = self.history[:self.current_step + 1]
        
        self.history.append(action)
        self.current_step += 1
        
        # Optimization: Apply directly to current cache instead of full recompute
        # This is strictly valid only if operations are purely deterministic and sequential.
        new_df = self._apply_single_action(self.get_current_df(), action)
        self._current_df_cache = new_df

    def undo(self):
        if self.current_step >= 0:
            self.current_step -= 1
            self._recompute_current_state()

    def redo(self):
        if self.current_step < len(self.history) - 1:
            self.current_step += 1
            # Optimization: We can just apply the next action to the current state
            action_to_apply = self.history[self.current_step]
            self._current_df_cache = self._apply_single_action(self.get_current_df(), action_to_apply)

    def _recompute_current_state(self):
        """
        Rebuilds the current dataframe from initial_df by applying all actions up to current_step.
        """
        df = self.initial_df.copy()
        for i in range(self.current_step + 1):
            action = self.history[i]
            df = self._apply_single_action(df, action)
        self._current_df_cache = df

    def _apply_single_action(self, df: pd.DataFrame, action: ActionSpec) -> pd.DataFrame:
        """
        Executes a single high-level action (which might contain multiple operations, but V1 assumes 1 op = 1 action usually)
        """
        # We process the list of operations in the ActionSpec
        current_df = df
        for op in action.operations:
             # Assuming op has 'type' and 'params' (Schema needs to be flexible or we define it)
             # Our ActionSpec schema said: operations: List[Dict[str, Any]]
             # START_FIX: Let's assume op has "action" (name) and "params".
             action_name = op.get("action")
             params = op.get("params", {})
             if action_name:
                 current_df = ActionRegistry.execute(current_df, action_name, params)
        return current_df
