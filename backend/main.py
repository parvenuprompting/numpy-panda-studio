from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from engine.dataset_loader import DatasetLoader
from engine.profiler import Profiler
from engine.session import Session
from engine.code_generator import CodeGenerator
from schemas.api import DatasetLoadRequest, DatasetResponse, ActionSpec
import uuid
import os
from typing import Dict

app = FastAPI(title="Pandas Generator Studio API")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active sessions
# Key: Session ID, Value: Session object
active_sessions: Dict[str, Session] = {}

@app.get("/")
async def health_check():
    return {"status": "ok", "service": "pandas-generator-studio-backend"}

@app.post("/dataset/load", response_model=DatasetResponse)
async def load_dataset(request: DatasetLoadRequest):
    """
    Loads a dataset and initializes a new session.
    """
    try:
        df = DatasetLoader.load_dataset(request.file_path, request.file_type)
        session_id = str(uuid.uuid4())
        
        # Create new session
        session = Session(session_id, df, file_path=request.file_path, file_type=request.file_type)
        active_sessions[session_id] = session
        
        # Get initial view
        current_df = session.get_current_df()
        preview = DatasetLoader.get_preview(current_df)
        profile = Profiler.profile_dataset(current_df)
        
        return DatasetResponse(id=session_id, preview=preview, profile=profile)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/dataset/{session_id}/preview")
async def get_preview(session_id: str):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    df = session.get_current_df()
    return DatasetLoader.get_preview(df)

@app.post("/session/{session_id}/apply", response_model=DatasetResponse)
async def apply_action(session_id: str, action: ActionSpec):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        session = active_sessions[session_id]
        session.apply_action(action)
        
        current_df = session.get_current_df()
        return DatasetResponse(
            id=session_id,
            preview=DatasetLoader.get_preview(current_df),
            profile=Profiler.profile_dataset(current_df)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/session/{session_id}/undo", response_model=DatasetResponse)
async def undo_action(session_id: str):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        session = active_sessions[session_id]
        session.undo()
        
        current_df = session.get_current_df()
        return DatasetResponse(
            id=session_id,
            preview=DatasetLoader.get_preview(current_df),
            profile=Profiler.profile_dataset(current_df)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/session/{session_id}/redo", response_model=DatasetResponse)
async def redo_action(session_id: str):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        session = active_sessions[session_id]
        session.redo()
        
        current_df = session.get_current_df()
        return DatasetResponse(
            id=session_id,
            preview=DatasetLoader.get_preview(current_df),
            profile=Profiler.profile_dataset(current_df)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/session/{session_id}/export")
async def export_session_code(session_id: str):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    script = CodeGenerator.generate_script(
        actions=session.history[:session.current_step + 1],
        original_file_path=session.file_path,
        file_type=session.file_type
    )
    
    return Response(
        content=script,
        media_type="text/x-python",
        headers={"Content-Disposition": "attachment; filename=pandas_script.py"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
