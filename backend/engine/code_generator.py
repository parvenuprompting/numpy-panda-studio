from typing import List, Dict, Any
from schemas.api import ActionSpec
from engine.actions import ActionRegistry
import json

class CodeGenerator:
    """
    Generates a Python script from a list of actions.
    """
    @staticmethod
    def generate_script(actions: List[ActionSpec], original_file_path: str, file_type: str) -> str:
        script = []
        
        # Imports
        script.append("import pandas as pd")
        script.append("")
        
        # Load Data
        # Escape path for windows/special chars safety if needed, 
        # but for V1 we just use repr() to get a quoted string representation.
        script.append(f"# Load dataset")
        if file_type == 'csv':
             script.append(f"df = pd.read_csv({repr(original_file_path)})")
        elif file_type == 'json':
             script.append(f"df = pd.read_json({repr(original_file_path)})")
        elif file_type in ['xls', 'xlsx']:
             script.append(f"df = pd.read_excel({repr(original_file_path)})")
        else:
             script.append(f"# Unsupported file type: {file_type}, please load manually")
             script.append(f"df = pd.DataFrame() # Placeholder")

        script.append("")
        script.append("# Apply Transformations")
        
        for action_spec in actions:
            script.append(f"# {action_spec.intent}")
            for op in action_spec.operations:
                action_name = op.get("action")
                params = op.get("params", {})
                
                try:
                    template = ActionRegistry.get_template(action_name)
                    # We need to handle parameter formatting. 
                    # If a param is a string, it should arguably be quoted in the template 
                    # OR we pass repr(value) to the template.
                    # The template for drop_column is "df = df.drop(columns=['{column}'])"
                    # Here {column} expects the raw string name, because the template adds quotes.
                    # But what if value is complex?
                    # Robust way: Render params.
                    
                    # Let's simple format for V1.
                    # We need to be careful about {value} in filter_rows.
                    # Template: "df = df[df['{column}'] {operator} {value}]"
                    # If value is string 'foo', we want "df['col'] == 'foo'"
                    # If we pass raw 'foo', we get "df['col'] == foo" (variable name) -> Error.
                    
                    # Logic: Pre-process params to be safe for code insertion
                    safe_params = {}
                    for k, v in params.items():
                        if k == 'operator': # Operators shouldn't be quoted
                            safe_params[k] = v
                        elif isinstance(v, str) and k != 'column': # Column names in my template are already quoted usually, wait.
                            # My drop_column template: "df = df.drop(columns=['{column}'])" -> Expects column name raw.
                            # My filter template: "df['{column}']" -> Expects column name raw.
                            # My filter value: "{value}" -> Needs to be quoted if string.
                            safe_params[k] = repr(v)
                        else:
                            # Numbers, etc.
                            safe_params[k] = v
                            
                    # Special fix for my templates:
                    # drop_column: '{column}' -> if I pass column="Age", it becomes 'Age'. Correct.
                    # filter_rows: '{value}' -> if I pass value="Mall", safe_params becomes "'Mall'".
                    # Template becomes: ... == 'Mall'. Correct.
                    # But wait, my safe_params logic applied repr to STRINGS.
                    # If column name is string, I DON'T want repr if the template already has quotes.
                    # In my templates:
                    # drop_column: columns=['{column}'] -> Quotes present. So param should be raw string.
                    # filter: df['{column}'] -> Quotes present. Param raw string.
                    
                    # Refined Logic:
                    # If key is 'column', use raw string.
                    # If key is otherwise string, use repr().
                    
                    render_params = {}
                    for k, v in params.items():
                        if k == 'column' or k == 'operator':
                            render_params[k] = v
                        elif isinstance(v, str):
                            render_params[k] = repr(v)
                        else:
                            render_params[k] = v

                    code_line = template.format(**render_params)
                    script.append(code_line)
                    
                except Exception as e:
                    script.append(f"# Error generating code for {action_name}: {e}")
        
        script.append("")
        script.append("# Result Preview")
        script.append("print(df.head())")
        
        return "\n".join(script)
