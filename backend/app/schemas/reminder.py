from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ReminderCreate(BaseModel):
    document_id: Optional[int] = None
    medication_name: str
    dosage: Optional[str] = None
    frequency: str
    time_of_day: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class ReminderUpdate(BaseModel):
    medication_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    time_of_day: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class ReminderResponse(BaseModel):
    id: int
    user_id: int
    document_id: Optional[int] = None
    medication_name: str
    dosage: Optional[str] = None
    frequency: str
    time_of_day: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
