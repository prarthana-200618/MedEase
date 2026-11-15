import io
import pytest
from pathlib import Path
from app.services.document_processor import process_document_pipeline
from app.models.models import Document, DocumentStatus, Explanation

def test_public_prescription_upload_and_token_access(client, db_session):
    file_content = b"Prescription\nRx:\nTab. Paracetamol 650mg 1-0-1 TDS x 3 days PC"
    files = {"file": ("rx_public.png", io.BytesIO(file_content), "image/png")}
    data = {"title": "Public Walk-in Prescription"}

    # 1. Upload without any Authorization header
    res = client.post("/api/documents/public-upload", files=files, data=data)
    assert res.status_code == 201
    doc_info = res.json()
    assert doc_info["is_public"] is True
    assert doc_info["user_id"] is None
    assert "access_token" in doc_info
    access_token = doc_info["access_token"]
    assert len(access_token) > 20
    doc_id = doc_info["id"]

    # Run the background pipeline synchronously for testing
    process_document_pipeline(doc_id, db=db_session)

    # 2. Access via access_token
    detail_res = client.get(f"/api/documents/public/{access_token}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["title"] == "Public Walk-in Prescription"
    assert detail["is_public"] is True
    assert detail["status"] == "completed"
    assert detail["explanation"] is not None
    # Verify bilingual explanation fields
    assert "Prescription Summary" in detail["explanation"]["english_summary"]
    assert "സംഗ്രഹം" in detail["explanation"]["malayalam_summary"]

    # 3. Access with invalid token should fail
    bad_res = client.get("/api/documents/public/invalid-token-123")
    assert bad_res.status_code == 404

    # 4. Status check
    status_res = client.get(f"/api/documents/public/{access_token}/status")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "completed"

def test_public_document_privacy_isolation(client):
    # Register an authenticated user
    user_payload = {
        "email": "private_user@example.com",
        "password": "Password123!",
        "full_name": "Private User"
    }
    reg_res = client.post("/api/auth/register", json=user_payload)
    token = reg_res.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # Upload public prescription
    file_content = b"Rx:\nTab. Amoxicillin 500mg TDS x 5 days"
    files = {"file": ("rx_anon.png", io.BytesIO(file_content), "image/png")}
    pub_res = client.post("/api/documents/public-upload", files=files)
    assert pub_res.status_code == 201
    pub_id = pub_res.json()["id"]

    # Authenticated user should NOT see the anonymous document in their document list
    list_res = client.get("/api/documents", headers=auth_headers)
    assert list_res.status_code == 200
    user_docs = list_res.json()
    assert not any(d["id"] == pub_id for d in user_docs)

    # Authenticated user querying /api/documents/{pub_id} should get 404 because user_id does not match
    sec_res = client.get(f"/api/documents/{pub_id}", headers=auth_headers)
    assert sec_res.status_code == 404
