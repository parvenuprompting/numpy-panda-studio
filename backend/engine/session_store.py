from abc import ABC, abstractmethod
from typing import Optional
import os
import json
import pandas as pd
from engine.session import Session
import logging

logger = logging.getLogger(__name__)

class SessionStore(ABC):
    @abstractmethod
    def save(self, session: Session) -> None:
        pass

    @abstractmethod
    def load(self, session_id: str) -> Optional[Session]:
        pass

    @abstractmethod
    def delete(self, session_id: str) -> None:
        pass

class FileSessionStore(SessionStore):
    """
    Stores sessions using JSON for metadata and Parquet for data.
    Secure replacement for Pickle.
    """
    def __init__(self, storage_dir: str = None):
        if storage_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.storage_dir = os.path.join(base_dir, "sessions")
        else:
            self.storage_dir = storage_dir
        
        os.makedirs(self.storage_dir, exist_ok=True)

    def _get_json_path(self, session_id: str) -> str:
        return os.path.join(self.storage_dir, f"{session_id}.json")

    def _get_parquet_path(self, session_id: str) -> str:
        return os.path.join(self.storage_dir, f"{session_id}.parquet")

    def save(self, session: Session) -> None:
        try:
            # 1. Save Metadata (JSON)
            metadata = {
                "session_id": session.session_id,
                "file_path": session.file_path,
                "file_type": session.file_type,
                "current_step": session.current_step,
                "history": [action.dict() for action in session.history] # Ensure ActionSpec is serializable
            }
            
            json_path = self._get_json_path(session.session_id)
            with open(json_path, "w") as f:
                json.dump(metadata, f, indent=2)

            # 2. Save Data (Parquet) - We store the INITIAL dataframe to allow full replay
            # We only save it if it doesn't exist to save IO? 
            # Or always overwrite? Always overwrite is safer contextually but slower.
            # Actually, initial_df never changes for a session ID. 
            # But let's verify if parquet exists first.
            parquet_path = self._get_parquet_path(session.session_id)
            if not os.path.exists(parquet_path):
                # Ensure string columns are consistent (Parquet strictness)
                # But to_parquet handles most.
                session.initial_df.to_parquet(parquet_path, index=False)
            
        except Exception as e:
            logger.error(f"Failed to save session {session.session_id}: {e}")
            raise e

    def load(self, session_id: str) -> Optional[Session]:
        json_path = self._get_json_path(session_id)
        parquet_path = self._get_parquet_path(session_id)
        
        if not os.path.exists(json_path) or not os.path.exists(parquet_path):
            return None
        
        try:
            # 1. Load Metadata
            with open(json_path, "r") as f:
                metadata = json.load(f)
            
            # 2. Load Data
            initial_df = pd.read_parquet(parquet_path)
            
            # 3. Reconstruct Session
            session = Session(
                session_id=metadata["session_id"],
                initial_df=initial_df,
                file_path=metadata.get("file_path", ""),
                file_type=metadata.get("file_type", "csv")
            )
            
            # Restore state
            # We need to reconstruct ActionSpecs from dicts
            from schemas.api import ActionSpec
            session.history = [ActionSpec(**h) for h in metadata.get("history", [])]
            session.current_step = metadata.get("current_step", -1)
            
            return session
            
        except Exception as e:
            logger.error(f"Failed to load session {session_id}: {e}")
            return None

    def delete(self, session_id: str) -> None:
        json_path = self._get_json_path(session_id)
        parquet_path = self._get_parquet_path(session_id)
        
        try:
            if os.path.exists(json_path):
                os.remove(json_path)
            if os.path.exists(parquet_path):
                os.remove(parquet_path)
        except Exception as e:
            logger.error(f"Failed to delete session {session_id}: {e}")
