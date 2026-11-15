from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ChatMessageCreate(BaseModel):
    document_id: Optional[int] = None
    content: str
    language: Optional[str] = "ml"

class ChatMessageResponse(BaseModel):
    id: int
    user_id: int
    document_id: Optional[int] = None
    sender: str
    content: str
    language: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
