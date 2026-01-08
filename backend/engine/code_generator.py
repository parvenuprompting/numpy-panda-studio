from typing import List, Dict, Any
from schemas.api import ActionSpec
from engine.actions import ActionRegistry
import json

class CodeGenerator:
    """
    Generates a Python script or Jupyter Notebook from a list of actions.
    """
    @staticmethod
    def generate_notebook(actions: List[ActionSpec], original_file_path: str, file_type: str) -> str:
        """
        Generates a Jupyter Notebook JSON string (v4).
        """
        cells = []
        
        # 1. Header Markdown
        cells.append({
            "cell_type": "markdown",
            "metadata": {},
            "source": ["# Pandas Studio Analysis\n", "Generated automatically by Pandas Studio."]
        })
        
        # 2. Imports
        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": ["import pandas as pd\n", "import numpy as np"]
        })
        
        # 3. Load Data
        load_code = ["# Load dataset\n"]
        if file_type == 'csv':
             load_code.append(f"df = pd.read_csv({repr(original_file_path)})")
        elif file_type == 'json':
             load_code.append(f"df = pd.read_json({repr(original_file_path)})")
        elif file_type in ['xls', 'xlsx']:
             load_code.append(f"df = pd.read_excel({repr(original_file_path)})")
        else:
             load_code.append(f"# Unsupported file type: {file_type}\n")
             load_code.append(f"df = pd.DataFrame()")
        
        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": load_code
        })
        
        # 4. Actions
        for action_spec in actions:
            # We reuse the logic from generate_script to render the python code line
            # But we wrap it in its own cell
            cell_source = [f"# {action_spec.intent}\n"]
            
            for op in action_spec.operations:
                action_name = op.get("action")
                params = op.get("params", {})
                try:
                    template = ActionRegistry.get_template(action_name)
                    # Use same param rendering logic as script generator
                    render_params = {}
                    for k, v in params.items():
                        if k == 'column' or k == 'operator':
                            render_params[k] = v
                        elif isinstance(v, str):
                            render_params[k] = repr(v)
                        else:
                            render_params[k] = v
                    
                    code_line = template.format(**render_params)
                    cell_source.append(code_line + "\n")
                except Exception as e:
                    cell_source.append(f"# Error: {e}\n")
            
            cells.append({
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": cell_source
            })
            
        # 5. Summary
        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": ["# Analysis Summary\n", "print(df.info())\n", "df.head()"]
        })

        notebook = {
            "cells": cells,
            "metadata": {
                "kernelspec": {
                    "display_name": "Python 3",
                    "language": "python",
                    "name": "python3"
                },
                "language_info": {
                    "codemirror_mode": {"name": "ipython", "version": 3},
                    "file_extension": ".py",
                    "mimetype": "text/x-python",
                    "name": "python",
                    "nbconvert_exporter": "python",
                    "pygments_lexer": "ipython3",
                    "version": "3.8.5"
                }
            },
            "nbformat": 4,
            "nbformat_minor": 4
        }
        
        return json.dumps(notebook, indent=2)

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
                    
                    # Robust Logic:
                    # All parameters are passed through repr() if they are strings.
                    # This ensures correct quoting and escaping (' -> \'), preventing code injection.
                    # Since templates now have NO internal quotes, this is the only quoting source.
                    
                    render_params = {}
                    for k, v in params.items():
                        if k == 'operator': # Operators are code-safe whitelist (e.g. '>') 
                            render_params[k] = v
                        elif isinstance(v, str):
                            render_params[k] = repr(v) # Safe! 'foo' -> "'foo'", "inject')" -> "'inject\')'"
                        elif isinstance(v, list):
                            # Lists like subset=['a', 'b']. repr(list) handles quotes recursively.
                            render_params[k] = repr(v) 
                        elif isinstance(v, dict):
                            # Dicts like aggs={'a':'sum'}. repr(dict) handles quotes.
                            render_params[k] = repr(v)
                        else:
                            # Numbers, etc.
                            render_params[k] = v
                            
                    code_line = template.format(**render_params)
                    script.append(code_line)
                    
                except Exception as e:
                    script.append(f"# Error generating code for {action_name}: {e}")
        
        script.append("")
        script.append("# Result Preview")
        script.append("print(df.head())")
        
        return "\n".join(script)
