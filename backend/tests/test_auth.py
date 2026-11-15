import pytest

def test_home_and_health(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "operational"

    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_user_registration_and_login(client):
    # 1. Register a new user
    user_payload = {
        "email": "malayalam_patient@example.com",
        "password": "SecurePassword123!",
        "full_name": "Ramesh Kumar",
        "phone": "+91 9876543210",
        "preferred_language": "ml"
    }
    reg_res = client.post("/api/auth/register", json=user_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "malayalam_patient@example.com"
    assert data["user"]["full_name"] == "Ramesh Kumar"

    token = data["access_token"]

    # 2. Duplicate registration should fail
    dup_res = client.post("/api/auth/register", json=user_payload)
    assert dup_res.status_code == 400

    # 3. Login with credentials
    login_res = client.post("/api/auth/login", json={
        "email": "malayalam_patient@example.com",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Login with invalid password should fail
    bad_login = client.post("/api/auth/login", json={
        "email": "malayalam_patient@example.com",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # 5. Access /api/auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "malayalam_patient@example.com"

def test_unauthorized_access(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
