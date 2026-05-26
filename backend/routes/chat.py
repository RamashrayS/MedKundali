from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import User, ChatHistory, Report
from backend.routes.auth import get_current_user
from backend.schemas.schemas import ChatRequest
from backend.services.gemini import chat_with_aarog

router = APIRouter(tags=["Aarog Assistant Chat"])

@router.post("/chat")
def chat_with_aarog_endpoint(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Fetch user's historical chat messages (for conversation memory)
        history = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.timestamp.asc()).all()
        
        # 2. Fetch user's uploaded medical records (for diagnostic context)
        reports = db.query(Report).filter(Report.user_id == current_user.id).all()
        
        # 3. Request reply from Aarog clinical assistant
        aarog_response = chat_with_aarog(
            message=request.message,
            chat_history=history,
            user_reports=reports
        )
        
        # 4. Save exchange record into chat_history table
        new_exchange = ChatHistory(
            user_id=current_user.id,
            message=request.message,
            response=aarog_response
        )
        db.add(new_exchange)
        db.commit()
        db.refresh(new_exchange)
        
        return {
            "response": new_exchange.response,
            "timestamp": new_exchange.timestamp
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assistant failed to generate a response: {str(e)}"
        )

@router.get("/chat/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.timestamp.asc()).all()
    
    result = []
    for exchange in history:
        result.append({
            "id": exchange.id,
            "message": exchange.message,
            "response": exchange.response,
            "timestamp": exchange.timestamp
        })
    return result
