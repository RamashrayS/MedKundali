from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- PROFILE SCHEMAS ---
class MedicalProfileBase(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None

class MedicalProfileUpdate(MedicalProfileBase):
    pass

class MedicalProfileResponse(MedicalProfileBase):
    user_id: str

    class Config:
        from_attributes = True

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    profile: Optional[MedicalProfileBase] = None

    class Config:
        from_attributes = True

# --- REPORT SCHEMAS ---
class ReportBase(BaseModel):
    file_name: str
    storage_url: str
    report_type: Optional[str] = "Medical Report"

class ReportResponse(ReportBase):
    id: int
    user_id: str
    upload_date: datetime

    class Config:
        from_attributes = True

# --- AI SUMMARY SCHEMAS ---
class AiSummaryBase(BaseModel):
    summary: str

class AiSummaryResponse(AiSummaryBase):
    id: int
    report_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ReportWithSummaryResponse(ReportResponse):
    ai_summary: Optional[AiSummaryResponse] = None

    class Config:
        from_attributes = True

# --- CHAT SCHEMAS ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatHistoryItem(BaseModel):
    id: int
    message: str
    response: str
    timestamp: datetime

    class Config:
        from_attributes = True
