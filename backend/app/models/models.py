import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, 
    Text, Float, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    preferred_language = Column(String(10), default="ml")  # "ml" or "en"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    caregiver_grants = relationship(
        "CaregiverAccess", 
        foreign_keys="CaregiverAccess.patient_user_id", 
        back_populates="patient", 
        cascade="all, delete-orphan"
    )
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    access_token = Column(String(64), unique=True, index=True, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    title = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="documents")
    extracted_texts = relationship("ExtractedText", back_populates="document", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="document", cascade="all, delete-orphan")
    flags = relationship("Flag", back_populates="document", cascade="all, delete-orphan")
    explanations = relationship("Explanation", back_populates="document", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="document")
    chat_messages = relationship("ChatMessage", back_populates="document")


class ExtractedText(Base):
    __tablename__ = "extracted_text"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, default=1)
    raw_text = Column(Text, nullable=False)
    confidence_score = Column(Float, default=1.0)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    document = relationship("Document", back_populates="extracted_texts")


class MedicationStatus(str, enum.Enum):
    EXTRACTED = "extracted"
    NEEDS_REVIEW = "needs_review"
    PATIENT_CONFIRMED = "patient_confirmed"
    CLINICIAN_VERIFIED = "clinician_verified"


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)  # e.g., "1-0-1", "BD", "TDS"
    timing = Column(String(100), nullable=True)     # e.g., "After food / ഭക്ഷണത്തിന് ശേഷം"
    duration = Column(String(100), nullable=True)   # e.g., "5 days"
    raw_line = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.0)
    status = Column(SQLEnum(MedicationStatus), default=MedicationStatus.NEEDS_REVIEW, nullable=False)
    user_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    document = relationship("Document", back_populates="medications")
    flags = relationship("Flag", back_populates="medication")


class FlagSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    HIGH = "high"


class Flag(Base):
    __tablename__ = "flags"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id", ondelete="SET NULL"), nullable=True, index=True)
    flag_type = Column(String(100), nullable=False)  # uncertain_handwriting, dosage_unclear, etc.
    description = Column(Text, nullable=False)
    severity = Column(SQLEnum(FlagSeverity), default=FlagSeverity.WARNING, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    document = relationship("Document", back_populates="flags")
    medication = relationship("Medication", back_populates="flags")


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    malayalam_summary = Column(Text, nullable=False)
    english_summary = Column(Text, nullable=True)
    terminology_breakdown = Column(JSON, nullable=True)  # List of {term, malayalam_meaning, simple_explanation}
    audio_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    document = relationship("Document", back_populates="explanations")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    medication_name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=False)
    time_of_day = Column(String(100), nullable=False)  # e.g., "08:00 AM, 08:00 PM"
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="reminders")
    document = relationship("Document", back_populates="reminders")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    sender = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    language = Column(String(10), default="ml")  # "ml", "en", "manglish"
    created_at = Column(DateTime, default=utcnow, nullable=False)

    user = relationship("User", back_populates="chat_messages")
    document = relationship("Document", back_populates="chat_messages")


class CaregiverAccessStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REVOKED = "revoked"


class CaregiverAccess(Base):
    __tablename__ = "caregiver_access"

    id = Column(Integer, primary_key=True, index=True)
    patient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    caregiver_email = Column(String(255), nullable=False, index=True)
    caregiver_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(SQLEnum(CaregiverAccessStatus), default=CaregiverAccessStatus.PENDING, nullable=False)
    permissions = Column(JSON, nullable=True)  # {"can_view_documents": true, "can_view_reminders": true}
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    patient = relationship("User", foreign_keys=[patient_user_id], back_populates="caregiver_grants")
    caregiver = relationship("User", foreign_keys=[caregiver_user_id])


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # "upload_document", "view_explanation", "confirm_medication"
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")
