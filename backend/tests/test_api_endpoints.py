import io
import pytest

@pytest.fixture
def auth_headers(client):
    user_payload = {
        "email": "test_patient@example.com",
        "password": "Password123!",
        "full_name": "Sujith Nair",
        "preferred_language": "ml"
    }
    reg_res = client.post("/api/auth/register", json=user_payload)
    token = reg_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_document_upload_and_listing(client, auth_headers):
    file_content = b"Medical Prescription\nRx:\nParacetamol 500mg 1-0-1 TDS"
    files = {"file": ("prescription.png", io.BytesIO(file_content), "image/png")}
    data = {"title": "Doctor Visit Prescription"}

    upload_res = client.post("/api/documents/upload", files=files, data=data, headers=auth_headers)
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    assert doc_data["title"] == "Doctor Visit Prescription"
    doc_id = doc_data["id"]

    # List documents
    list_res = client.get("/api/documents", headers=auth_headers)
    assert list_res.status_code == 200
    docs = list_res.json()
    assert len(docs) == 1
    assert docs[0]["id"] == doc_id

    # Retrieve single document
    get_res = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Doctor Visit Prescription"

def test_reminder_crud(client, auth_headers):
    reminder_payload = {
        "medication_name": "Metformin 500mg",
        "dosage": "500mg",
        "frequency": "BD (രാവിലെയും വൈകുന്നേരവും)",
        "time_of_day": "08:00 AM, 08:00 PM"
    }
    res = client.post("/api/reminders", json=reminder_payload, headers=auth_headers)
    assert res.status_code == 201
    reminder = res.json()
    assert reminder["medication_name"] == "Metformin 500mg"
    rem_id = reminder["id"]

    list_res = client.get("/api/reminders", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    patch_res = client.patch(f"/api/reminders/{rem_id}", json={"dosage": "1000mg"}, headers=auth_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["dosage"] == "1000mg"

    del_res = client.delete(f"/api/reminders/{rem_id}", headers=auth_headers)
    assert del_res.status_code == 200

def test_chat_assistant(client, auth_headers):
    msg_res = client.post("/api/chat", json={"content": "TDS എന്നതിന്റെ അർത്ഥം എന്താണ്?", "language": "ml"}, headers=auth_headers)
    assert msg_res.status_code == 200
    reply = msg_res.json()
    assert reply["sender"] == "assistant"
    assert "3 തവണ" in reply["content"]

def test_caregiver_invite(client, auth_headers):
    invite_res = client.post(
        "/api/caregivers/invite",
        json={"caregiver_email": "caregiver@example.com"},
        headers=auth_headers
    )
    assert invite_res.status_code == 201
    assert invite_res.json()["caregiver_email"] == "caregiver@example.com"
