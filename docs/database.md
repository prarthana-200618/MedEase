# MedEase Database Schema

MedEase utilizes SQLAlchemy ORM with Alembic migrations.

## Tables Overview

1. `users`:
   - `id` (INT, PK)
   - `email` (VARCHAR(255), UNIQUE, INDEX)
   - `hashed_password` (VARCHAR(255))
   - `full_name` (VARCHAR(255))
   - `phone` (VARCHAR(50), NULL)
   - `preferred_language` (VARCHAR(10), DEFAULT 'ml')
   - `is_active` (BOOLEAN, DEFAULT TRUE)
   - `created_at`, `updated_at` (DATETIME)

2. `documents`:
   - `id` (INT, PK)
   - `user_id` (INT, FK -> users.id, ON DELETE CASCADE)
   - `title` (VARCHAR(255))
   - `original_filename` (VARCHAR(255))
   - `stored_filename` (VARCHAR(255))
   - `file_type` (VARCHAR(50))
   - `file_size` (INT)
   - `status` (ENUM: pending, processing, completed, failed)
   - `created_at`, `updated_at` (DATETIME)

3. `extracted_text`:
   - `id` (INT, PK)
   - `document_id` (INT, FK -> documents.id, ON DELETE CASCADE)
   - `page_number` (INT)
   - `raw_text` (TEXT)
   - `confidence_score` (FLOAT)
   - `created_at` (DATETIME)

4. `medications`:
   - `id` (INT, PK)
   - `document_id` (INT, FK -> documents.id, ON DELETE CASCADE)
   - `name` (VARCHAR(255))
   - `dosage` (VARCHAR(100), NULL)
   - `frequency` (VARCHAR(100), NULL)
   - `timing` (VARCHAR(100), NULL)
   - `duration` (VARCHAR(100), NULL)
   - `raw_line` (TEXT, NULL)
   - `confidence_score` (FLOAT)
   - `status` (ENUM: extracted, needs_review, patient_confirmed, clinician_verified)
   - `user_notes` (TEXT, NULL)
   - `created_at`, `updated_at` (DATETIME)

5. `flags`:
   - `id` (INT, PK)
   - `document_id` (INT, FK -> documents.id, ON DELETE CASCADE)
   - `medication_id` (INT, FK -> medications.id, ON DELETE SET NULL)
   - `flag_type` (VARCHAR(100))
   - `description` (TEXT)
   - `severity` (ENUM: info, warning, high)
   - `created_at` (DATETIME)

6. `explanations`:
   - `id` (INT, PK)
   - `document_id` (INT, FK -> documents.id, ON DELETE CASCADE)
   - `malayalam_summary` (TEXT)
   - `english_summary` (TEXT, NULL)
   - `terminology_breakdown` (JSON, NULL)
   - `audio_url` (VARCHAR(500), NULL)
   - `created_at`, `updated_at` (DATETIME)

7. `reminders`:
   - `id` (INT, PK)
   - `user_id` (INT, FK -> users.id, ON DELETE CASCADE)
   - `document_id` (INT, FK -> documents.id, ON DELETE SET NULL)
   - `medication_name` (VARCHAR(255))
   - `dosage` (VARCHAR(100), NULL)
   - `frequency` (VARCHAR(100))
   - `time_of_day` (VARCHAR(100))
   - `start_date`, `end_date` (DATETIME, NULL)
   - `is_active` (BOOLEAN, DEFAULT TRUE)
   - `created_at`, `updated_at` (DATETIME)

8. `chat_messages`:
   - `id` (INT, PK)
   - `user_id` (INT, FK -> users.id, ON DELETE CASCADE)
   - `document_id` (INT, FK -> documents.id, ON DELETE SET NULL)
   - `sender` (VARCHAR(20): user, assistant)
   - `content` (TEXT)
   - `language` (VARCHAR(10), DEFAULT 'ml')
   - `created_at` (DATETIME)

9. `caregiver_access`:
   - `id` (INT, PK)
   - `patient_user_id` (INT, FK -> users.id, ON DELETE CASCADE)
   - `caregiver_email` (VARCHAR(255))
   - `caregiver_user_id` (INT, FK -> users.id, ON DELETE SET NULL)
   - `status` (ENUM: pending, accepted, revoked)
   - `permissions` (JSON, NULL)
   - `expires_at` (DATETIME, NULL)
   - `created_at`, `updated_at` (DATETIME)

10. `audit_log`:
    - `id` (INT, PK)
    - `user_id` (INT, FK -> users.id, ON DELETE CASCADE)
    - `action` (VARCHAR(100))
    - `resource_type` (VARCHAR(100))
    - `resource_id` (INT)
    - `details` (JSON)
    - `timestamp` (DATETIME)
