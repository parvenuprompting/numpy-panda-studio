from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from engine.dataset_loader import DatasetLoader
from engine.profiler import Profiler
from engine.session import Session
from engine.code_generator import CodeGenerator
from engine.secure_loader import SecureLoader, SecurityException
from engine.session_store import FileSessionStore
from schemas.api import DatasetLoadRequest, DatasetResponse, ActionSpec
import uuid
import os
from typing import Dict
import logging

# Setup Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pandas Generator Studio API")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(SecurityException)
async def security_exception_handler(request: Request, exc: SecurityException):
    logger.warning(f"Security violation: {str(exc)}")
    return JSONResponse(status_code=403, content={"detail": str(exc)})

@app.exception_handler(FileNotFoundError)
async def file_not_found_handler(request: Request, exc: FileNotFoundError):
    return JSONResponse(status_code=404, content={"detail": "File not found"})

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {str(exc)}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

# Persistent Session Store
session_store = FileSessionStore()

# Ensure data directory exists on startup
def startup_event():
    SecureLoader.ensure_data_dir_exists()
    logger.info(f"SecureLoader initialized. Allowed dir: {SecureLoader.ALLOWED_DATA_DIR}")

app.add_event_handler("startup", startup_event)

@app.get("/")
async def health_check():
    return {"status": "ok", "service": "pandas-generator-studio-backend"}

@app.post("/dataset/load", response_model=DatasetResponse)
async def load_dataset(request: DatasetLoadRequest):
    """
    Loads a dataset and initializes a new session.
    Enforces security via SecureLoader.
    """
    # 1. Validate Path
    validated_path = SecureLoader.validate_path(request.file_path)
    
    # 2. Load Dataset
    df = DatasetLoader.load_dataset(validated_path, request.file_type)
    session_id = str(uuid.uuid4())
    
    # Create new session
    session = Session(session_id, df, file_path=validated_path, file_type=request.file_type)
    session_store.save(session)
    
    # Get initial view
    current_df = session.get_current_df()
    preview = DatasetLoader.get_preview(current_df)
    profile = Profiler.profile_dataset(current_df)
    
    return DatasetResponse(id=session_id, preview=preview, profile=profile)

@app.get("/dataset/{session_id}/preview")
async def get_preview(session_id: str):
    session = session_store.load(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    df = session.get_current_df()
    return DatasetLoader.get_preview(df)

@app.post("/session/{session_id}/apply", response_model=DatasetResponse)
async def apply_action(session_id: str, action: ActionSpec):
    session = session_store.load(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.apply_action(action)
    session_store.save(session) # Persistence: Save after modification
    
    current_df = session.get_current_df()
    return DatasetResponse(
        id=session_id,
        preview=DatasetLoader.get_preview(current_df),
        profile=Profiler.profile_dataset(current_df)
    )

@app.post("/session/{session_id}/undo", response_model=DatasetResponse)
async def undo_action(session_id: str):
    session = session_store.load(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.undo()
    session_store.save(session)
    
    current_df = session.get_current_df()
    return DatasetResponse(
        id=session_id,
        preview=DatasetLoader.get_preview(current_df),
        profile=Profiler.profile_dataset(current_df)
    )

@app.post("/session/{session_id}/redo", response_model=DatasetResponse)
async def redo_action(session_id: str):
    session = session_store.load(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.redo()
    session_store.save(session)
    
    current_df = session.get_current_df()
    return DatasetResponse(
        id=session_id,
        preview=DatasetLoader.get_preview(current_df),
        profile=Profiler.profile_dataset(current_df)
    )

@app.get("/session/{session_id}/export")
async def export_session_code(session_id: str, format: str = "py"):
    session = session_store.load(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if format == "ipynb":
        content = CodeGenerator.generate_notebook(
            actions=session.history[:session.current_step + 1],
            original_file_path=session.file_path,
            file_type=session.file_type
        )
        media_type = "application/x-ipynb+json"
        filename = "pandas_analysis.ipynb"
    else:
        content = CodeGenerator.generate_script(
            actions=session.history[:session.current_step + 1],
            original_file_path=session.file_path,
            file_type=session.file_type
        )
        media_type = "text/x-python"
        filename = "pandas_script.py"
    
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
