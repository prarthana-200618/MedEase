import os
import shutil
import uuid
import secrets
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import (
    User, Document, DocumentStatus, ExtractedText, Medication, 
    MedicationStatus, Flag, Explanation, AuditLog
)
from app.schemas.document import (
    DocumentResponse, DocumentDetailResponse, MedicationResponse,
    MedicationUpdate, ExplanationResponse, ConfirmMedicationRequest, FlagResponse
)
from app.services.document_processor import process_document_pipeline
from app.api.deps import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents"])

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(Path(settings.STORAGE_DIR) / "public", exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

# ==========================================
# PUBLIC PRESCRIPTION TRANSLATION ENDPOINTS
# (No registration or login required)
# ==========================================

@router.post("/public-upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_public_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed formats: PDF, JPG, JPEG, PNG."
        )

    file_bytes = await file.read()
    file_size = len(file_bytes)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Secure unguessable access token
    access_token = secrets.token_urlsafe(32)
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    public_storage_dir = Path(settings.STORAGE_DIR) / "public"
    public_storage_dir.mkdir(parents=True, exist_ok=True)
    file_path = public_storage_dir / unique_filename

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    doc_title = title if title and title.strip() else (file.filename or "Prescription Document")

    document = Document(
        user_id=None,
        is_public=True,
        access_token=access_token,
        title=doc_title,
        original_filename=file.filename or "unknown",
        stored_filename=str(Path("public") / unique_filename),
        file_type=ext.replace(".", "").upper(),
        file_size=file_size,
        status=DocumentStatus.PENDING
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Trigger background document processing pipeline
    background_tasks.add_task(process_document_pipeline, document.id)

    return DocumentResponse.model_validate(document)


@router.get("/public/{access_token}", response_model=DocumentDetailResponse)
def get_public_document(
    access_token: str,
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.access_token == access_token,
        Document.is_public == True
    ).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Prescription document not found or access token invalid."
        )

    raw_texts = [et.raw_text for et in document.extracted_texts]
    explanation = db.query(Explanation).filter(Explanation.document_id == document.id).first()

    return DocumentDetailResponse(
        id=document.id,
        user_id=document.user_id,
        access_token=document.access_token,
        is_public=document.is_public,
        title=document.title,
        original_filename=document.original_filename,
        file_type=document.file_type,
        file_size=document.file_size,
        status=document.status,
        created_at=document.created_at,
        updated_at=document.updated_at,
        raw_texts=raw_texts,
        medications=[MedicationResponse.model_validate(m) for m in document.medications],
        flags=[FlagResponse.model_validate(f) for f in document.flags],
        explanation=ExplanationResponse.model_validate(explanation) if explanation else None
    )


@router.get("/public/{access_token}/status")
def get_public_document_status(
    access_token: str,
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.access_token == access_token,
        Document.is_public == True
    ).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Document not found or access token invalid."
        )
    return {
        "id": document.id,
        "access_token": document.access_token,
        "status": document.status
    }


# ==========================================
# AUTHENTICATED USER DOCUMENT ENDPOINTS
# ==========================================

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed formats: PDF, JPG, JPEG, PNG."
        )

    file_bytes = await file.read()
    file_size = len(file_bytes)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    user_storage_dir = Path(settings.STORAGE_DIR) / str(current_user.id)
    user_storage_dir.mkdir(parents=True, exist_ok=True)
    file_path = user_storage_dir / unique_filename

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    doc_title = title if title and title.strip() else (file.filename or "Medical Document")

    document = Document(
        user_id=current_user.id,
        is_public=False,
        access_token=None,
        title=doc_title,
        original_filename=file.filename or "unknown",
        stored_filename=str(Path(str(current_user.id)) / unique_filename),
        file_type=ext.replace(".", "").upper(),
        file_size=file_size,
        status=DocumentStatus.PENDING
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    audit = AuditLog(
        user_id=current_user.id,
        action="upload_document",
        resource_type="document",
        resource_id=document.id,
        details={"filename": file.filename, "size": file_size}
    )
    db.add(audit)
    db.commit()

    background_tasks.add_task(process_document_pipeline, document.id)

    return DocumentResponse.model_validate(document)


@router.get("", response_model=List[DocumentResponse])
def get_documents(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.is_public == False
    )
    if search:
        query = query.filter(Document.title.ilike(f"%{search}%"))
    documents = query.order_by(Document.created_at.desc()).all()
    return [DocumentResponse.model_validate(d) for d in documents]


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    raw_texts = [et.raw_text for et in document.extracted_texts]
    explanation = db.query(Explanation).filter(Explanation.document_id == document.id).first()

    return DocumentDetailResponse(
        id=document.id,
        user_id=document.user_id,
        access_token=document.access_token,
        is_public=document.is_public,
        title=document.title,
        original_filename=document.original_filename,
        file_type=document.file_type,
        file_size=document.file_size,
        status=document.status,
        created_at=document.created_at,
        updated_at=document.updated_at,
        raw_texts=raw_texts,
        medications=[MedicationResponse.model_validate(m) for m in document.medications],
        flags=[FlagResponse.model_validate(f) for f in document.flags],
        explanation=ExplanationResponse.model_validate(explanation) if explanation else None
    )


@router.get("/{document_id}/status")
def get_document_status(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return {"id": document.id, "status": document.status}


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    try:
        full_path = Path(settings.STORAGE_DIR) / document.stored_filename
        if full_path.exists():
            full_path.unlink()
    except Exception:
        pass

    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully."}


@router.get("/{document_id}/fields", response_model=List[MedicationResponse])
def get_document_fields(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return [MedicationResponse.model_validate(m) for m in document.medications]


@router.patch("/{document_id}/fields/{medication_id}", response_model=MedicationResponse)
def update_medication_field(
    document_id: int,
    medication_id: int,
    update_data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    medication = db.query(Medication).join(Document).filter(
        Medication.id == medication_id,
        Medication.document_id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not medication:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication record not found.")

    if update_data.name is not None:
        medication.name = update_data.name
    if update_data.dosage is not None:
        medication.dosage = update_data.dosage
    if update_data.frequency is not None:
        medication.frequency = update_data.frequency
    if update_data.timing is not None:
        medication.timing = update_data.timing
    if update_data.duration is not None:
        medication.duration = update_data.duration
    if update_data.user_notes is not None:
        medication.user_notes = update_data.user_notes
    if update_data.status is not None:
        medication.status = update_data.status

    db.commit()
    db.refresh(medication)
    return MedicationResponse.model_validate(medication)


@router.post("/{document_id}/confirm", response_model=MedicationResponse)
def confirm_medication_field(
    document_id: int,
    confirm_req: ConfirmMedicationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    medication = db.query(Medication).join(Document).filter(
        Medication.id == confirm_req.medication_id,
        Medication.document_id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not medication:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication record not found.")

    medication.status = MedicationStatus.PATIENT_CONFIRMED
    if confirm_req.notes:
        medication.user_notes = confirm_req.notes

    db.commit()
    db.refresh(medication)
    return MedicationResponse.model_validate(medication)


@router.get("/{document_id}/explanation", response_model=ExplanationResponse)
def get_explanation(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    explanation = db.query(Explanation).filter(Explanation.document_id == document_id).first()
    if not explanation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Explanation not yet generated for this document.")

    return ExplanationResponse.model_validate(explanation)
