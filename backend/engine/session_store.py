from abc import ABC, abstractmethod
from typing import Optional
import os
import pickle
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
    Stores sessions as pickled files on disk.
    Allows for persistence across restarts and sharing between workers (with limitations).
    For true robust multi-worker, Redis is recommended, but this satisfies V1 requirement.
    """
    def __init__(self, storage_dir: str = None):
        if storage_dir is None:
            # Default to ../sessions relative to this file (backend/engine/session_store.py -> backend/sessions)
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.storage_dir = os.path.join(base_dir, "sessions")
        else:
            self.storage_dir = storage_dir
        
        os.makedirs(self.storage_dir, exist_ok=True)

    def _get_path(self, session_id: str) -> str:
        return os.path.join(self.storage_dir, f"{session_id}.pickle")

    def save(self, session: Session) -> None:
        try:
            path = self._get_path(session.session_id)
            # Atomic write pattern: write to temp, then rename
            temp_path = f"{path}.tmp"
            with open(temp_path, "wb") as f:
                pickle.dump(session, f)
            os.replace(temp_path, path)
        except Exception as e:
            logger.error(f"Failed to save session {session.session_id}: {e}")
            raise e

    def load(self, session_id: str) -> Optional[Session]:
        path = self._get_path(session_id)
        if not os.path.exists(path):
            return None
        
        try:
            with open(path, "rb") as f:
                return pickle.load(f)
        except Exception as e:
            logger.error(f"Failed to load session {session_id}: {e}")
            return None

    def delete(self, session_id: str) -> None:
        path = self._get_path(session_id)
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception as e:
                logger.error(f"Failed to delete session {session_id}: {e}")
