from typing import Dict, Any, List
import pandas as pd
from schemas.api import ActionSpec

class ActionInterpreter:
    """
    Interprets and executes a list of operations defined in an ActionSpec.
    This is the core deterministic engine.
    """
    
    @staticmethod
    def execute(df: pd.DataFrame, action_spec: ActionSpec) -> pd.DataFrame:
        """
        Executes the operations on the dataframe sequentially.
        """
        result_df = df.copy()
        
        for op in action_spec.operations:
            op_type = op.get("type")
            params = op.get("params", {})
            
            if op_type == "filter":
                result_df = ActionInterpreter._apply_filter(result_df, params)
            elif op_type == "sort":
                result_df = ActionInterpreter._apply_sort(result_df, params)
            elif op_type == "drop_columns":
                result_df = ActionInterpreter._apply_drop_columns(result_df, params)
            # Add more operations here
            else:
                raise ValueError(f"Unknown operation type: {op_type}")
                
        return result_df

    @staticmethod
    def _apply_filter(df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        column = params["column"]
        value = params["value"]
        operator = params["operator"]
        
        if operator == "==":
            return df[df[column] == value]
        elif operator == ">":
            return df[df[column] > value]
        elif operator == "<":
            return df[df[column] < value]
        # Add more operators
        return df

    @staticmethod
    def _apply_sort(df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        column = params["column"]
        ascending = params.get("ascending", True)
        return df.sort_values(by=column, ascending=ascending)

    @staticmethod
    def _apply_drop_columns(df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        columns = params["columns"]
        return df.drop(columns=columns)
