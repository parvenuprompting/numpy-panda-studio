from schemas.api import ActionSpec
import re
from typing import Dict, Any, List

class AIAssistant:
    @staticmethod
    def generate_action_spec(prompt: str, columns: List[str]) -> ActionSpec:
        """
        Mock AI logic to convert natural language to ActionSpec.
        In a real app, this would call an LLM (Gemini/OpenAI).
        """
        p = prompt.lower().strip()
        
        # 1. Sort
        # "sort by salary", "sort salary desc"
        if "sort" in p:
            is_asc = "desc" not in p
            # Find column
            col = next((c for c in columns if c.lower() in p), None)
            if col:
                return ActionSpec(
                    intent=f"Sort by {col} {'Asc' if is_asc else 'Desc'} (AI)",
                    operations=[{
                        "action": "sort_values",
                        "params": {"column": col, "ascending": is_asc}
                    }]
                )

        # 2. Filter
        # "filter where age > 30", "show only if department is IT"
        if "filter" in p or "where" in p or "show" in p:
            # Simple heuristic regex for "col > val"
            # match "col > val", "col == val"
            # allow words for col
            
            # Try to match operator
            ops = {">=": ">=", "<=": "<=", "==": "==", ">": ">", "<": "<", "=": "==", "is": "=="} // order matters, >= before >
            found_op = None
            for op_str, op_code in ops.items():
                if f" {op_str} " in p:
                    found_op = op_code
                    break
            
            if found_op:
                parts = p.split(found_op if found_op in p else "dummy") # simplified
                # Actually let's use the matched key
                # This is tricky without strict parsing.
                # Let's try to find a column name
                target_col = next((c for c in columns if c.lower() in p), None)
                
                if target_col:
                    # try to find value
                    # value is usually after the op/col
                    # "filter where salary > 5000"
                    # "salary" index vs "5000" index
                    
                    # EXTRACT NUMBER
                    import re
                    nums = re.findall(r'-?\d+\.?\d*', p)
                    val = None
                    if nums:
                        val = float(nums[-1]) if '.' in nums[-1] else int(nums[-1])
                    else:
                        # Extract string value? "dept is IT"
                        # Assume last word?
                        val = p.split()[-1]
                    
                    # infer raw op from text if we didn't match via splitting
                    final_op = "=="
                    if ">" in p: final_op = ">"
                    if "<" in p: final_op = "<"
                    if ">=" in p: final_op = ">="
                    if "<=" in p: final_op = "<="
                    if "not" in p or "!=" in p: final_op = "!="

                    return ActionSpec(
                        intent=f"Filter {target_col} {final_op} {val} (AI)",
                        operations=[{
                            "action": "filter_rows",
                            "params": {"column": target_col, "operator": final_op, "value": val}
                        }]
                    )
        
        # 3. Drop
        # "drop col1", "remove id"
        if "drop" in p or "remove" in p or "delete" in p:
            col = next((c for c in columns if c.lower() in p), None)
            if col:
                 return ActionSpec(
                    intent=f"Drop {col} (AI)",
                    operations=[{
                        "action": "drop_column",
                        "params": {"column": col}
                    }]
                )
        
        # 4. Rename
        # "rename id to user_id"
        if "rename" in p:
            col = next((c for c in columns if c.lower() in p), None)
            # find "to"
            if col and " to " in p:
                new_name = p.split(" to ")[-1].strip()
                # clean punctuation
                new_name = new_name.strip(".'\"")
                return ActionSpec(
                    intent=f"Rename {col} to {new_name} (AI)",
                    operations=[{
                        "action": "rename_column",
                        "params": {"old_name": col, "new_name": new_name}
                    }]
                )
        
        # Default fallback
        return ActionSpec(
            intent="Unknown Command",
            operations=[]
        )
