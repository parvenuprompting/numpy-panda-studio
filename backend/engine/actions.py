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

@ActionRegistry.register("drop_column", "df = df.drop(columns=[{column}])")
def drop_column(df: pd.DataFrame, column: str) -> pd.DataFrame:
    if column not in df.columns:
        raise ValueError(f"Column '{column}' not found.")
    return df.drop(columns=[column])

@ActionRegistry.register(
    "filter_rows", 
    "df = df[df[{column}] {operator} {value}]" 
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

@ActionRegistry.register("rename_column", "df = df.rename(columns={{{old_name}: {new_name}}})")
def rename_column(df: pd.DataFrame, old_name: str, new_name: str) -> pd.DataFrame:
    if old_name not in df.columns:
        raise ValueError(f"Column '{old_name}' not found.")
    return df.rename(columns={old_name: new_name})

@ActionRegistry.register("drop_na", "df = df.dropna(subset={subset})")
def drop_na(df: pd.DataFrame, subset: list) -> pd.DataFrame:
    # validate columns
    missing = [c for c in subset if c not in df.columns]
    if missing:
        raise ValueError(f"Columns not found: {missing}")
    return df.dropna(subset=subset)

@ActionRegistry.register("fill_na", "df[{columns}] = df[{columns}].fillna({value})")
def fill_na(df: pd.DataFrame, value: Any, columns: list) -> pd.DataFrame:
    # validate columns
    missing = [c for c in columns if c not in df.columns]
    if missing:
        raise ValueError(f"Columns not found: {missing}")
    
    # We apply to specific columns
    # Optimization: Pandas copy warning handling
    df = df.copy() 
    df[columns] = df[columns].fillna(value)
    return df

@ActionRegistry.register("astype", "df[{column}] = df[{column}].astype({dtype})")
def astype(df: pd.DataFrame, column: str, dtype: str) -> pd.DataFrame:
    if column not in df.columns:
        raise ValueError(f"Column '{column}' not found.")
    
    # Whitelist safety
    ALLOWED_TYPES = ['int', 'float', 'str', 'bool']
    if dtype not in ALLOWED_TYPES:
         # Map some common aliases if needed, or strict
         if dtype == 'integer': dtype = 'int'
         elif dtype == 'string': dtype = 'str'
         elif dtype == 'boolean': dtype = 'bool'
         else:
            raise ValueError(f"Unsupported dtype: {dtype}. Allowed: {ALLOWED_TYPES}")
    
    df = df.copy()
    try:
        df[column] = df[column].astype(dtype)
    except ValueError as e:
        raise ValueError(f"Conversion failed: {str(e)}")
    return df

@ActionRegistry.register("groupby_agg", "df = df.groupby({group_by}).agg({aggregations}).reset_index()")
def groupby_agg(df: pd.DataFrame, group_by: list, aggregations: Dict[str, str]) -> pd.DataFrame:
    # Validate group cols
    missing = [c for c in group_by if c not in df.columns]
    if missing:
        raise ValueError(f"Group columns not found: {missing}")
    
    # Validate agg targets
    for col in aggregations.keys():
        if col not in df.columns:
             raise ValueError(f"Aggregation target column '{col}' not found.")
             
    # Validate agg funcs
    ALLOWED_FUNCS = ['sum', 'mean', 'count', 'min', 'max', 'first', 'last']
    for func in aggregations.values():
        if func not in ALLOWED_FUNCS:
            raise ValueError(f"Aggregation function '{func}' not allowed.")

    return df.groupby(group_by).agg(aggregations).reset_index()

import numpy as np

@ActionRegistry.register("math_transform", "df[{new_col_name}] = np.{function}(df[{target_col}])")
def math_transform(df: pd.DataFrame, target_col: str, function: str, new_col_name: str) -> pd.DataFrame:
    if target_col not in df.columns:
        raise ValueError(f"Column '{target_col}' not found")
        
    if not pd.api.types.is_numeric_dtype(df[target_col]):
        raise ValueError(f"Column '{target_col}' must be numeric")

    ALLOWED_FUNCS = {
        'log': np.log,
        'sqrt': np.sqrt,
        'ceil': np.ceil,
        'round': np.round,
        'abs': np.abs
    }
    
    if function not in ALLOWED_FUNCS:
        raise ValueError(f"Function '{function}' not allowed. Whitelist: {list(ALLOWED_FUNCS.keys())}")
    
    df = df.copy()
    try:
        # Avoid log(0) issues if possible or let numpy warn/inf
        df[new_col_name] = ALLOWED_FUNCS[function](df[target_col])
    except Exception as e:
        raise ValueError(f"Math transform failed: {e}")
        
    return df

@ActionRegistry.register("conditional", "df[{new_col}] = np.where(df[{column}] {operator} {value}, {true_val}, {false_val})")
def conditional(df: pd.DataFrame, column: str, operator: str, value: Any, true_val: Any, false_val: Any, new_col: str) -> pd.DataFrame:
    if column not in df.columns:
        raise ValueError(f"Column '{column}' not found")

    df = df.copy()
    
    # Construct mask safely
    # We strictly limit operators to basic ones
    if operator == '>':
        mask = df[column] > value
    elif operator == '<':
        mask = df[column] < value
    elif operator == '>=':
        mask = df[column] >= value
    elif operator == '<=':
        mask = df[column] <= value
    elif operator == '==':
        mask = df[column] == value
    elif operator == '!=':
        mask = df[column] != value
    else:
        raise ValueError(f"Unsupported operator: {operator}")
        
    df[new_col] = np.where(mask, true_val, false_val)
    return df
