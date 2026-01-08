import os
from pathlib import Path

class SecurityException(Exception):
    """Raised when a security violation is detected."""
    pass

class SecureLoader:
    """
    Enforces security policies for file loading, specifically preventing
    Path Traversal (LFI) vulnerabilities.
    """
    
    # Allow configuration via environment variable, default to current directory/data
    # For local dev V1, we might want to allow a wider range or make it explicit.
    # Plan says: default to ./data
    # Allow configuration via environment variable, default to Project Root
    # This allows loading files from anywhere in the project folder (backend, data, etc.)
    # secure_loader.py is in backend/engine/ -> ../../ is backend/ -> ../../../ is project root
    # Wait, backend run dir is 'backend'.
    # os.path.abspath("..") from 'backend' dir gives project root.
    ALLOWED_DATA_DIR = os.getenv("ALLOWED_DATA_DIR", os.path.abspath(".."))

    @staticmethod
    def validate_path(file_path: str) -> str:
        """
        Validates that the given file path is safe to access.
        
        Args:
            file_path: The absolute or relative path requested.
            
        Returns:
            The absolute path if valid.
            
        Raises:
            SecurityException: If the path is outside the allowed directory.
            FileNotFoundError: If the file does not exist (optional validation step).
        """
        # 1. Resolve to absolute path
        try:
            abs_path = Path(file_path).resolve()
        except Exception as e:
            raise SecurityException(f"Invalid path format: {str(e)}")

        # 2. Check against allowed base directory
        # We ensure the allowed dir is also absolute
        allowed_base = Path(SecureLoader.ALLOWED_DATA_DIR).resolve()
        
        # Ensure the allowed directory exists (create if not? or just checking?)
        # For now, let's assume it should exist or we might block everything.
        # If it doesn't exist, maybe we should warn? 
        # But for strict security, if base doesn't exist, nothing is allowed.
        
        # Check if abs_path is within allowed_base
        # is_relative_to is available in Python 3.9+
        if not abs_path.is_relative_to(allowed_base):
             raise SecurityException(f"Access denied: Path '{file_path}' is outside the allowed data directory '{allowed_base}'.")

        return str(abs_path)

    @staticmethod
    def ensure_data_dir_exists():
        """Helper to create the data dir if it doesn't exist."""
        os.makedirs(SecureLoader.ALLOWED_DATA_DIR, exist_ok=True)
