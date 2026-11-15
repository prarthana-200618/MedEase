from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Reminder, Medication, MedicationStatus
from app.schemas.reminder import ReminderCreate, ReminderUpdate, ReminderResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/reminders", tags=["Reminders"])

@router.get("", response_model=List[ReminderResponse])
def get_reminders(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Reminder).filter(Reminder.user_id == current_user.id)
    if active_only:
        query = query.filter(Reminder.is_active == True)
    reminders = query.order_by(Reminder.created_at.desc()).all()
    return [ReminderResponse.model_validate(r) for r in reminders]

@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_in: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Safety Check: If associated with a document, ensure user explicitly inputs/confirms
    reminder = Reminder(
        user_id=current_user.id,
        document_id=reminder_in.document_id,
        medication_name=reminder_in.medication_name,
        dosage=reminder_in.dosage,
        frequency=reminder_in.frequency,
        time_of_day=reminder_in.time_of_day,
        start_date=reminder_in.start_date,
        end_date=reminder_in.end_date,
        is_active=True
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return ReminderResponse.model_validate(reminder)

@router.patch("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: int,
    reminder_update: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found.")

    if reminder_update.medication_name is not None:
        reminder.medication_name = reminder_update.medication_name
    if reminder_update.dosage is not None:
        reminder.dosage = reminder_update.dosage
    if reminder_update.frequency is not None:
        reminder.frequency = reminder_update.frequency
    if reminder_update.time_of_day is not None:
        reminder.time_of_day = reminder_update.time_of_day
    if reminder_update.start_date is not None:
        reminder.start_date = reminder_update.start_date
    if reminder_update.end_date is not None:
        reminder.end_date = reminder_update.end_date
    if reminder_update.is_active is not None:
        reminder.is_active = reminder_update.is_active

    db.commit()
    db.refresh(reminder)
    return ReminderResponse.model_validate(reminder)

@router.delete("/{reminder_id}", status_code=status.HTTP_200_OK)
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found.")

    db.delete(reminder)
    db.commit()
    return {"message": "Reminder deleted successfully."}
