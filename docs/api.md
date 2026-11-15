# MedEase REST API Specification

Base URL: `http://localhost:8000/api`

## Authentication (`/api/auth`)
- `POST /api/auth/register`: Create user account. Returns JWT access token & user profile.
- `POST /api/auth/login`: Authenticate email/password. Returns JWT access token.
- `POST /api/auth/logout`: Invalidate session.
- `GET /api/auth/me`: Retrieve currently authenticated user.

## Profile (`/api/profile`)
- `GET /api/profile`: Retrieve user profile.
- `PATCH /api/profile`: Update user name, phone, language preference.
- `DELETE /api/profile`: Complete user account and personal data deletion.

## Documents (`/api/documents`)
- `POST /api/documents/upload`: Multipart upload (PDF, JPG, PNG). Triggers background OCR & explanation pipeline.
- `GET /api/documents`: List user's documents (supports `?search=...`).
- `GET /api/documents/{id}`: Retrieve detailed document info with extracted text, medications, flags, and explanation.
- `GET /api/documents/{id}/status`: Check processing status (`pending`, `processing`, `completed`, `failed`).
- `DELETE /api/documents/{id}`: Permanently delete document and underlying stored file.
- `GET /api/documents/{id}/fields`: List extracted medications.
- `PATCH /api/documents/{id}/fields/{med_id}`: Correct or edit OCR extracted medication fields.
- `POST /api/documents/{id}/confirm`: Mark medication as `patient_confirmed`.
- `GET /api/documents/{id}/explanation`: Retrieve Malayalam summary & terminology breakdown.

## Medicine Reminders (`/api/reminders`)
- `GET /api/reminders`: List all user reminders (`?active_only=true`).
- `POST /api/reminders`: Create reminder with user-confirmed dosage and schedule.
- `PATCH /api/reminders/{id}`: Update schedule, dosage, or active status.
- `DELETE /api/reminders/{id}`: Delete reminder.

## AI Assistant (`/api/chat`)
- `POST /api/chat`: Send query in Malayalam, Manglish, or English. Returns contextual document-supported answers.
- `GET /api/chat/history`: List conversation history.

## Caregivers (`/api/caregivers`)
- `POST /api/caregivers/invite`: Invite caregiver by email with specified permissions.
- `GET /api/caregivers`: List caregiver access grants.
- `DELETE /api/caregivers/{id}`: Revoke caregiver access grant.
