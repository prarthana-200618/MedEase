# MedEase (മെഡ്ഈസ്)

> **മെഡിക്കൽ രേഖകൾ ലളിതമായ മലയാളത്തിൽ**  
> AI-powered medical document understanding web application designed for patients, elderly people, and caregivers in Kerala.

---

## 🌟 Key Features

1. **Smart Medical Document Upload**: Support for PDF, JPG, JPEG, and PNG prescriptions and lab reports.
2. **OpenCV Document Enhancement**: Deskewing, denoising, CLAHE contrast enhancement, and adaptive binarization.
3. **Medical Information Extraction**: Extracts medication names, dosages (`500mg`, `40mg`), frequencies (`OD`, `BD`, `TDS`, `1-0-1`, `1-1-1`), and timings (`AC`, `PC`).
4. **Uncertainty & Safety Detection**: Automatically flags unreadable handwriting, missing dosages, and ambiguous abbreviations.
5. **Malayalam Explanation Engine**: Summarizes medical reports in accessible Malayalam while strictly preserving exact medicine names and dosages.
6. **Patient Review & Confirmation**: Users can inspect, edit transcription errors, and confirm medication instructions.
7. **Safe Medicine Reminders**: Creates medication alerts strictly after explicit patient review and confirmation.
8. **AI Medical Assistant**: Interactive question answering in Malayalam, Manglish, or English.
9. **Spoken Voice Output**: Audio playback capability for elderly accessibility.
10. **Caregiver Access**: Granular permission sharing with family members and caregivers.

---

## 🚀 Quick Start

### 1. Backend Server
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Development Server
```powershell
cd frontend
npm run dev
```
Web Application: `http://localhost:5173`

### 3. Run Automated Tests
```powershell
.\backend\.venv\Scripts\pytest.exe backend\tests
```

---

## 🔒 Security & Privacy

- Sensitive patient data is protected behind JWT authentication and per-user database constraints.
- Uploaded files are isolated per user with random UUID filenames.
- Pluggable AI engine operates with local mock fallback so no sensitive medical records leave the machine unless explicitly configured.
- MedEase is an information-understanding platform and explicitly clarifies to users that it is not a medical diagnosis or prescribing tool.

---

## 📚 Documentation
- [Architecture](docs/architecture.md)
- [Database Schema](docs/database.md)
- [REST API Reference](docs/api.md)
- [Setup & Deployment](docs/setup.md)
