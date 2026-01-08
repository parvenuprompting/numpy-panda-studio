import os
import uuid
import shutil
import logging
from fastapi import UploadFile
from pathlib import Path
from typing import Tuple

logger = logging.getLogger(__name__)

class UploadManager:
    """
    Manages secure file uploads.
    - Stores files with UUID filenames to prevent collision and unsafe characters.
    - Cleans up old uploads on startup.
    """
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

    @classmethod
    def ensure_upload_dir(cls):
        os.makedirs(cls.UPLOAD_DIR, exist_ok=True)

    @classmethod
    def clear_uploads(cls):
        """Removes all files in the upload directory on startup."""
        if os.path.exists(cls.UPLOAD_DIR):
            try:
                shutil.rmtree(cls.UPLOAD_DIR)
                cls.ensure_upload_dir()
                logger.info(f"Cleared upload directory: {cls.UPLOAD_DIR}")
            except Exception as e:
                logger.error(f"Failed to clear upload directory: {e}")

    @classmethod
    async def save_upload(cls, file: UploadFile) -> Tuple[str, str]:
        """
        Saves the uploaded file with a secure UUID filename.
        Returns (file_id, original_filename).
        """
        cls.ensure_upload_dir()
        
        file_id = str(uuid.uuid4())
        original_name = file.filename or "unknown"
        
        # Preserve extension for convenience/logic, but validate it if needed
        # safely extract extension
        ext = "".join(Path(original_name).suffixes) # .csv, .tar.gz
        if not ext:
            ext = ".csv" # Default fallback
            
        save_name = f"{file_id}{ext}"
        save_path = os.path.join(cls.UPLOAD_DIR, save_name)

        try:
            with open(save_path, "wb") as f:
                # Stream copy
                content = await file.read()
                f.write(content)
                
            logger.info(f"Saved upload {original_name} as {save_name}")
            return file_id, original_name
        except Exception as e:
            logger.error(f"Failed to save upload: {e}")
            raise e

    @classmethod
    def get_path(cls, file_id: str) -> str:
        """
        Resolves a file_id (UUID) to a local path.
        Searches for any extension matching the ID.
        """
        # We need to find the file because we didn't store the extension in the ID map (stateless attempt)
        # Or we should enforce that file_id includes extension? 
        # Better: Implementation Plan said load by ID. 
        # Let's search directory for file beginning with ID.
        
        if not os.path.exists(cls.UPLOAD_DIR):
             raise FileNotFoundError("Upload directory does not exist")

        # Sanity check ID
        try:
            uuid.UUID(file_id)
        except ValueError:
            # If it's not a UUID, it might be a malicious path attempt if we are naive
            # But we are searching, not joining directly.
            raise ValueError("Invalid File ID format")

        for f in os.listdir(cls.UPLOAD_DIR):
            if f.startswith(file_id):
                return os.path.join(cls.UPLOAD_DIR, f)
        
        raise FileNotFoundError(f"File ID {file_id} not found")
