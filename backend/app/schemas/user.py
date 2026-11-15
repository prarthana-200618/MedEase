from datetime import datetime
from typing import Optional
import email_validator
from pydantic import BaseModel, EmailStr, ConfigDict

# Disable offline/sandbox DNS deliverability lookups
email_validator.CHECK_DELIVERABILITY = False

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    preferred_language: str = "ml"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
