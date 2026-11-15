# MedEase Architecture Specification

MedEase is an AI-powered medical document understanding platform designed primarily for patients, elderly people, and caregivers in Kerala.

## 1. High-Level Architecture

```
+-------------------------------------------------------------+
|                      React Frontend (Vite)                  |
|    - Malayalam-first UI with Noto Sans Malayalam            |
|    - Patient & Caregiver dashboards, Audio playback         |
|    - Drag-and-drop Upload, Explicit Medication Review       |
+------------------------------+------------------------------+
                               | REST API / JSON
                               v
+-------------------------------------------------------------+
|                     FastAPI Backend Service                 |
|    - JWT Authentication & Per-User Isolation                |
|    - Document Storage & File Safety Validation              |
|    - Background Processing Tasks                            |
+------------------------------+------------------------------+
                               |
       +-----------------------+-----------------------+
       |                                               |
       v                                               v
+---------------+                            +---------------------+
| Document      |                            | Relational Database |
| Pipeline      |                            | (SQLAlchemy /       |
| - OpenCV Prep |                            |  Alembic / MySQL /  |
| - OCR Engine  |                            |  SQLite Fallback)   |
| - Med Rules   |                            +---------------------+
| - Malayalam   |                                      |
|   Explanation |                                      v
|   Engine      |                            +---------------------+
+---------------+                            | Upload File Storage |
                                             | (Per-user UUIDs)    |
                                             +---------------------+
```

## 2. Document Processing Pipeline

```
[ Uploaded PDF / Image ]
           |
           v
[ File Validation & Safety Checks ]
           |
           v
[ OpenCV Enhancement (CLAHE, Denoising, Deskewing, Thresholding) ]
           |
           v
[ OCR Text Extraction (PyMuPDF / Tesseract / OCR Engine) ]
           |
           v
[ Rule-Based Medical Extraction (OD, BD, TDS, Timing, Dosages) ]
           |
           v
[ Uncertainty & Ambiguity Detection (Flags generated) ]
           |
           v
[ Malayalam Explanation Engine (Preserving exact medicine names) ]
           |
           v
[ User Review & Patient Confirmation Interface ]
```

## 3. Pluggable External Adapters

- **AI Explanation Engine**:
  - `MockMalayalamExplanationProvider` (Default local development)
  - `GeminiExplanationProvider` (Configurable via `GEMINI_API_KEY`)
  - `OpenAIExplanationProvider` (Configurable via `OPENAI_API_KEY`)
- **Speech Service**:
  - Browser SpeechSynthesis API & Server-side Malayalam TTS adapters.
