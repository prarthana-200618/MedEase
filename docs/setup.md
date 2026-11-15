# MedEase Setup & Deployment Guide

This guide describes how to run and verify the MedEase application locally on Windows.

## Prerequisites

- **Python**: 3.11+
- **Node.js**: v20+ (Tested with v24.11.1 and npm 11.6.2)
- **Virtual Environment**: Located at `backend/.venv`
- **Database**:
  - SQLite (Default zero-config development database)
  - MySQL Server 8.0 (Production or local service)

---

## 1. Running the Backend

Open a terminal in the project directory:

```powershell
cd C:\Users\HP\Documents\MedEase\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The FastAPI backend will start at:
- **API Base**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

---

## 2. Running the Frontend

Open a second terminal:

```powershell
cd C:\Users\HP\Documents\MedEase\frontend
npm run dev
```

The Vite dev server will start at:
- **Web App**: `http://localhost:5173`

---

## 3. Running Automated Tests

To run the backend test suite:

```powershell
cd C:\Users\HP\Documents\MedEase
.\backend\.venv\Scripts\pytest.exe backend\tests
```

To build the frontend bundle:

```powershell
cd C:\Users\HP\Documents\MedEase\frontend
npm run build
```

---

## 4. Configuring MySQL (Optional)

1. Start the MySQL service:
   ```powershell
   net start MySQL80
   ```
2. Create database and user:
   ```sql
   CREATE DATABASE IF NOT EXISTS medease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'medease_user'@'localhost' IDENTIFIED BY 'medease_password';
   GRANT ALL PRIVILEGES ON medease.* TO 'medease_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Update `backend/.env`:
   ```env
   DATABASE_URL="mysql+pymysql://medease_user:medease_password@localhost:3306/medease"
   ```
4. Run migrations:
   ```powershell
   cd C:\Users\HP\Documents\MedEase\backend
   .\.venv\Scripts\alembic.exe upgrade head
   ```

---

## 5. Configuring AI Providers (Gemini / OpenAI)

In `backend/.env`:
- To enable Gemini:
  ```env
  AI_PROVIDER="gemini"
  GEMINI_API_KEY="your-google-gemini-api-key"
  ```
- By default, `AI_PROVIDER="mock"` operates in safe local rule-based mode without requiring any paid API keys.
