from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, CaregiverAccess, CaregiverAccessStatus
from app.schemas.caregiver import CaregiverInviteRequest, CaregiverResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/caregivers", tags=["Caregivers"])

@router.get("", response_model=List[CaregiverResponse])
def get_caregivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    caregivers = db.query(CaregiverAccess).filter(
        CaregiverAccess.patient_user_id == current_user.id
    ).all()
    return [CaregiverResponse.model_validate(c) for c in caregivers]

@router.post("/invite", response_model=CaregiverResponse, status_code=status.HTTP_201_CREATED)
def invite_caregiver(
    invite_in: CaregiverInviteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if invite_in.caregiver_email == current_user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot invite yourself as a caregiver."
        )

    # Check if existing invite
    existing = db.query(CaregiverAccess).filter(
        CaregiverAccess.patient_user_id == current_user.id,
        CaregiverAccess.caregiver_email == invite_in.caregiver_email
    ).first()
    if existing and existing.status != CaregiverAccessStatus.REVOKED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An invitation or access grant already exists for this email."
        )

    expires_at = None
    if invite_in.expires_in_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=invite_in.expires_in_days)

    caregiver_access = CaregiverAccess(
        patient_user_id=current_user.id,
        caregiver_email=invite_in.caregiver_email,
        status=CaregiverAccessStatus.PENDING,
        permissions=invite_in.permissions,
        expires_at=expires_at
    )
    db.add(caregiver_access)
    db.commit()
    db.refresh(caregiver_access)
    return CaregiverResponse.model_validate(caregiver_access)

@router.delete("/{caregiver_id}", status_code=status.HTTP_200_OK)
def revoke_caregiver(
    caregiver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    access = db.query(CaregiverAccess).filter(
        CaregiverAccess.id == caregiver_id,
        CaregiverAccess.patient_user_id == current_user.id
    ).first()
    if not access:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver access grant not found.")

    access.status = CaregiverAccessStatus.REVOKED
    db.commit()
    return {"message": "Caregiver access revoked successfully."}
