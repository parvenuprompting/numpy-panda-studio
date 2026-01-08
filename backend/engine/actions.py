import pandas as pd
from typing import Dict, Any, Callable, Optional

class ActionRegistry:
    """
    Registry for all available data manipulation actions and their code generation templates.
    """
    _actions: Dict[str, Callable] = {}
    _templates: Dict[str, str] = {}

    @classmethod
    def register(cls, name: str, template: str):
        def decorator(func: Callable):
            cls._actions[name] = func
            cls._templates[name] = template
            return func
        return decorator

    @classmethod
    def get_action(cls, name: str) -> Callable:
        if name not in cls._actions:
            raise ValueError(f"Action '{name}' not found.")
        return cls._actions[name]
    
    @classmethod
    def get_template(cls, name: str) -> str:
        if name not in cls._templates:
            raise ValueError(f"Template for action '{name}' not found.")
        return cls._templates[name]

    @classmethod
    def execute(cls, df: pd.DataFrame, action: str, params: Dict[str, Any]) -> pd.DataFrame:
        func = cls.get_action(action)
        return func(df, **params)

# Define basic actions

@ActionRegistry.register("drop_column", "df = df.drop(columns=['{column}'])")
def drop_column(df: pd.DataFrame, column: str) -> pd.DataFrame:
    if column not in df.columns:
        raise ValueError(f"Column '{column}' not found.")
    return df.drop(columns=[column])

@ActionRegistry.register(
    "filter_rows", 
    "df = df[df['{column}'] {operator} {value}]" # Note: Value might need quoting if string, handled in generator or simple repr()
)
def filter_rows(df: pd.DataFrame, column: str, operator: str, value: Any) -> pd.DataFrame:
    if column not in df.columns:
        raise ValueError(f"Column '{column}' not found.")
    
    if operator == "==":
        return df[df[column] == value]
    elif operator == "!=":
        return df[df[column] != value]
    elif operator == ">":
        return df[df[column] > value]
    elif operator == "<":
        return df[df[column] < value]
    elif operator == ">=":
        return df[df[column] >= value]
    elif operator == "<=":
        return df[df[column] <= value]
    else:
        raise ValueError(f"Unsupported operator: {operator}")
