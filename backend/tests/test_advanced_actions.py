import pandas as pd
import pytest
from engine.actions import ActionRegistry

def test_rename_column():
    df = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})
    new_df = ActionRegistry.execute(df, 'rename_column', {'old_name': 'A', 'new_name': 'Z'})
    assert 'Z' in new_df.columns
    assert 'A' not in new_df.columns
    assert new_df['Z'].tolist() == [1, 2]

def test_drop_na():
    df = pd.DataFrame({'A': [1, None, 3], 'B': [4, 5, 6]})
    # Drop rows where A is NaN
    new_df = ActionRegistry.execute(df, 'drop_na', {'subset': ['A']})
    assert len(new_df) == 2
    assert new_df['A'].tolist() == [1.0, 3.0]

def test_fill_na():
    df = pd.DataFrame({'A': [1, None, 3], 'B': [4, 5, 6]})
    # Fill NaN in A with 99
    new_df = ActionRegistry.execute(df, 'fill_na', {'value': 99, 'columns': ['A']})
    assert len(new_df) == 3
    assert new_df['A'].tolist() == [1.0, 99.0, 3.0]

def test_astype():
    df = pd.DataFrame({'A': ['1', '2', '3']})
    new_df = ActionRegistry.execute(df, 'astype', {'column': 'A', 'dtype': 'int'})
    assert new_df['A'].dtype == 'int64' or new_df['A'].dtype == 'int32'
    assert new_df['A'].sum() == 6

def test_groupby_agg():
    df = pd.DataFrame({
        'Dept': ['IT', 'IT', 'HR', 'HR'],
        'Salary': [5000, 6000, 4000, 3000]
    })
    new_df = ActionRegistry.execute(df, 'groupby_agg', {
        'group_by': ['Dept'],
        'aggregations': {'Salary': 'mean'}
    })
    # Result should have Dept and Salary cols
    assert 'Dept' in new_df.columns
    assert 'Salary' in new_df.columns
    assert len(new_df) == 2
    # Check mean for IT (5500)
    it_salary = new_df[new_df['Dept'] == 'IT']['Salary'].values[0]
    assert it_salary == 5500.0

def test_math_transform():
    df = pd.DataFrame({'A': [1, 4, 9]})
    new_df = ActionRegistry.execute(df, 'math_transform', {
        'target_col': 'A', 'function': 'sqrt', 'new_col_name': 'A_sqrt'
    })
    assert 'A_sqrt' in new_df.columns
    assert new_df['A_sqrt'].tolist() == [1.0, 2.0, 3.0]

def test_conditional():
    df = pd.DataFrame({'Score': [80, 40, 90]})
    new_df = ActionRegistry.execute(df, 'conditional', {
        'column': 'Score', 'operator': '>', 'value': 50, 
        'true_val': 'Pass', 'false_val': 'Fail', 'new_col': 'Status'
    })
    assert 'Status' in new_df.columns
    assert new_df['Status'].tolist() == ['Pass', 'Fail', 'Pass']
