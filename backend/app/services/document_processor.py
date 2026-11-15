import logging
from typing import Optional
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.config import settings
from app.models.models import (
    Document, DocumentStatus, ExtractedText, Medication, 
    MedicationStatus, Flag, Explanation, AuditLog
)
from app.services.ocr_service import DocumentOCRService
from app.services.medical_extractor import MedicalExtractor
from app.services.explanation_engine import get_explanation_provider

logger = logging.getLogger(__name__)

def process_document_pipeline(document_id: int, db: Optional[Session] = None):
    """
    Background worker that runs the complete document processing pipeline:
    1. Validation
    2. OCR extraction
    3. Medical entities extraction
    4. Uncertainty & flag detection
    5. Malayalam & English explanation generation
    6. Database persistence
    """
    own_session = False
    if db is None:
        db = SessionLocal()
        own_session = True
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.error(f"Document {document_id} not found in background processor.")
            return

        doc.status = DocumentStatus.PROCESSING
        db.commit()

        # Full path on disk
        full_file_path = Path(settings.STORAGE_DIR) / doc.stored_filename
        if not full_file_path.exists():
            doc.status = DocumentStatus.FAILED
            db.commit()
            return

        # 1. OCR Extraction
        ocr_results = DocumentOCRService.process_document(str(full_file_path))
        all_raw_text = []

        for res in ocr_results:
            et = ExtractedText(
                document_id=doc.id,
                page_number=res.page_number,
                raw_text=res.raw_text,
                confidence_score=res.confidence_score
            )
            db.add(et)
            all_raw_text.append(res.raw_text)

        combined_text = "\n\n".join(all_raw_text)

        # 2. Medical Information & Uncertainty Extraction
        medications_data, flags_data = MedicalExtractor.extract_medications_and_flags(combined_text)

        for med in medications_data:
            med_obj = Medication(
                document_id=doc.id,
                name=med["name"],
                dosage=med["dosage"],
                frequency=med["frequency"],
                timing=med["timing"],
                duration=med["duration"],
                raw_line=med["raw_line"],
                confidence_score=med["confidence_score"],
                status=med["status"]
            )
            db.add(med_obj)

        for flg in flags_data:
            flg_obj = Flag(
                document_id=doc.id,
                flag_type=flg["flag_type"],
                description=flg["description"],
                severity=flg["severity"]
            )
            db.add(flg_obj)

        # 3. Malayalam Explanation Generation
        provider = get_explanation_provider()
        explanation_data = provider.generate_explanation(
            medications=medications_data,
            flags=flags_data,
            raw_text=combined_text
        )

        exp_obj = Explanation(
            document_id=doc.id,
            malayalam_summary=explanation_data["malayalam_summary"],
            english_summary=explanation_data.get("english_summary"),
            terminology_breakdown=explanation_data.get("terminology_breakdown")
        )
        db.add(exp_obj)

        # 4. Finalize Document Status
        doc.status = DocumentStatus.COMPLETED
        db.commit()
        logger.info(f"Document {document_id} processed successfully.")

    except Exception as e:
        logger.exception(f"Pipeline error processing document {document_id}: {str(e)}")
        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc.status = DocumentStatus.FAILED
                db.commit()
        except Exception:
            pass
    finally:
        if own_session:
            db.close()
