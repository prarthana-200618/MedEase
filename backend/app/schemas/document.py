from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from app.models.models import DocumentStatus, MedicationStatus, FlagSeverity

class FlagResponse(BaseModel):
    id: int
    flag_type: str
    description: str
    severity: FlagSeverity
    medication_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MedicationBase(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    duration: Optional[str] = None
    raw_line: Optional[str] = None
    user_notes: Optional[str] = None

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    duration: Optional[str] = None
    user_notes: Optional[str] = None
    status: Optional[MedicationStatus] = None

class MedicationResponse(MedicationBase):
    id: int
    document_id: int
    confidence_score: float
    status: MedicationStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ExplanationResponse(BaseModel):
    id: int
    document_id: int
    malayalam_summary: str
    english_summary: Optional[str] = None
    terminology_breakdown: Optional[Any] = None
    audio_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    access_token: Optional[str] = None
    is_public: bool = False
    title: str
    original_filename: str
    file_type: str
    file_size: int
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentDetailResponse(DocumentResponse):
    raw_texts: List[str] = []
    medications: List[MedicationResponse] = []
    flags: List[FlagResponse] = []
    explanation: Optional[ExplanationResponse] = None

class ConfirmMedicationRequest(BaseModel):
    medication_id: int
    notes: Optional[str] = None
