from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import ChatSession, ChatMessage, User
from app.schemas import (
    ChatQueryRequest,
    ChatQueryResponse,
    ChatSessionResponse,
    ChatMessageResponse
)
from app.auth import get_optional_user
from app.services.ai_service import generate_chat_response, DEFAULT_SUGGESTIONS, EMERGENCY_DISCLAIMER

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

@router.post("/query", response_model=ChatQueryResponse)
async def chat_query(
    request: ChatQueryRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    session = None
    if request.session_id:
        session = db.query(ChatSession).filter(ChatSession.id == request.session_id).first()

    if not session:
        # Create a new session
        title = request.message[:45] + "..." if len(request.message) > 45 else request.message
        session = ChatSession(
            user_id=current_user.id if current_user else None,
            title=title or "Consultation Inquiry"
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save User message
    user_msg = ChatMessage(
        session_id=session.id,
        sender="user",
        content=request.message
    )
    db.add(user_msg)
    db.commit()

    # Generate Response from AI Service / Local Fallback Engine
    ai_result = await generate_chat_response(request.message, db)

    # Save Assistant message
    bot_msg = ChatMessage(
        session_id=session.id,
        sender="assistant",
        content=ai_result["response"]
    )
    db.add(bot_msg)
    db.commit()

    return {
        "response": ai_result["response"],
        "session_id": session.id,
        "suggested_actions": ai_result.get("suggested_actions", DEFAULT_SUGGESTIONS),
        "is_fallback": ai_result.get("is_fallback", False),
        "disclaimer": EMERGENCY_DISCLAIMER
    }

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_user_sessions(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return []
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.created_at.desc()).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session_history(
    session_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id and current_user and session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return session

@router.get("/suggestions")
def get_suggestions():
    return {
        "suggestions": DEFAULT_SUGGESTIONS,
        "disclaimer": EMERGENCY_DISCLAIMER
    }
