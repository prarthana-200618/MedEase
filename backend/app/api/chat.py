from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, ChatMessage, Document
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Chat Assistant"])

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    document_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    if document_id:
        query = query.filter(ChatMessage.document_id == document_id)
    messages = query.order_by(ChatMessage.created_at.asc()).all()
    return [ChatMessageResponse.model_validate(m) for m in messages]

@router.post("", response_model=ChatMessageResponse)
def send_chat_message(
    chat_in: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Store user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        document_id=chat_in.document_id,
        sender="user",
        content=chat_in.content,
        language=chat_in.language or "ml"
    )
    db.add(user_msg)
    db.commit()

    # Generate assistant answer
    doc_context = ""
    if chat_in.document_id:
        doc = db.query(Document).filter(
            Document.id == chat_in.document_id,
            Document.user_id == current_user.id
        ).first()
        if doc and doc.extracted_texts:
            doc_context = "\n".join([et.raw_text for et in doc.extracted_texts])

    # In Phase 1/mock mode, provide safe contextual assistance with clear healthcare disclaimer
    reply_content = (
        "ഈ വിവരങ്ങൾ നൽകിയിരിക്കുന്നത് സഹായത്തിന് മാത്രമാണ്. ഒരു ഡോക്ടറുടെ നിർദ്ദേശത്തിന് പകരമല്ല. "
        "റിപ്പോർട്ട് വിശദമായി പരിശോധിച്ചതിനു ശേഷം കൂടുതൽ കൃത്യമായ വിവരങ്ങൾ പങ്കുവെക്കാം."
    )
    if "tds" in chat_in.content.lower():
        reply_content = "TDS എന്നാൽ 'Ter Die Sumendum' (ദിവസത്തിൽ 3 തവണ കഴിക്കുക) എന്നാണ് അർത്ഥം."
    elif "bd" in chat_in.content.lower():
        reply_content = "BD അല്ലെങ്കിൽ BID എന്നാൽ 'Bis in Die' (ദിവസത്തിൽ 2 തവണ കഴിക്കുക) എന്നാണ് അർത്ഥം."
    elif "od" in chat_in.content.lower():
        reply_content = "OD എന്നാൽ 'Once Daily' (ദിവസത്തിൽ ഒരു തവണ കഴിക്കുക) എന്നാണ് അർത്ഥം."

    bot_msg = ChatMessage(
        user_id=current_user.id,
        document_id=chat_in.document_id,
        sender="assistant",
        content=reply_content,
        language=chat_in.language or "ml"
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return ChatMessageResponse.model_validate(bot_msg)
