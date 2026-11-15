from datetime import datetime
from typing import Optional, Any
import email_validator
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.models import CaregiverAccessStatus

email_validator.CHECK_DELIVERABILITY = False

class CaregiverInviteRequest(BaseModel):
    caregiver_email: EmailStr
    permissions: Optional[Any] = {"can_view_documents": True, "can_view_reminders": True}
    expires_in_days: Optional[int] = 30

class CaregiverResponse(BaseModel):
    id: int
    patient_user_id: int
    caregiver_email: str
    caregiver_user_id: Optional[int] = None
    status: CaregiverAccessStatus
    permissions: Optional[Any] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
