from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "patient"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    address: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Department Schemas ---
class DepartmentBase(BaseModel):
    name: str
    description: str
    icon: Optional[str] = "Activity"
    head_doctor: Optional[str] = None
    location_floor: str = "Ground Floor"
    phone: Optional[str] = None
    is_emergency: Optional[bool] = False

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    head_doctor: Optional[str] = None
    location_floor: Optional[str] = None
    phone: Optional[str] = None
    is_emergency: Optional[bool] = None

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Doctor Schemas ---
class DoctorBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    department_id: int
    specialization: str
    qualification: str
    experience_years: int = 5
    consultation_fee: float = Field(default=100.0, ge=100, le=500)
    bio: Optional[str] = None
    available_days: str = "Mon, Tue, Wed, Thu, Fri"
    time_slots: str = "09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM, 04:00 PM"
    image_url: Optional[str] = None
    rating: Optional[float] = 4.9

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = Field(default=None, ge=100, le=500)
    bio: Optional[str] = None
    available_days: Optional[str] = None
    time_slots: Optional[str] = None
    image_url: Optional[str] = None
    rating: Optional[float] = None

class DoctorResponse(DoctorBase):
    id: int
    created_at: datetime
    department: Optional[DepartmentResponse] = None

    class Config:
        from_attributes = True

# --- Appointment Schemas ---
class AppointmentBase(BaseModel):
    doctor_id: int
    department_id: int
    appointment_date: str  # YYYY-MM-DD
    appointment_time: str  # e.g., 10:00 AM
    reason: Optional[str] = None
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentReschedule(BaseModel):
    appointment_date: str
    appointment_time: str
    notes: Optional[str] = None

class AppointmentStatusUpdate(BaseModel):
    status: str  # "pending", "confirmed", "completed", "cancelled"

class AppointmentResponse(BaseModel):
    id: int
    appointment_code: str
    patient_id: int
    doctor_id: int
    department_id: int
    appointment_date: str
    appointment_time: str
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    doctor: Optional[DoctorResponse] = None
    department: Optional[DepartmentResponse] = None
    patient: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- Hospital Service Schemas ---
class HospitalServiceBase(BaseModel):
    name: str
    description: str
    category: str = "General"
    price_range: str = "Covered by Insurance / Varies"
    availability: str = "24/7"
    icon: str = "Heart"
    is_featured: bool = False

class HospitalServiceCreate(HospitalServiceBase):
    pass

class HospitalServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price_range: Optional[str] = None
    availability: Optional[str] = None
    icon: Optional[str] = None
    is_featured: Optional[bool] = None

class HospitalServiceResponse(HospitalServiceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Chat Schemas ---
class ChatMessageCreate(BaseModel):
    content: str
    session_id: Optional[int] = None

class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    created_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class ChatQueryRequest(BaseModel):
    message: str
    session_id: Optional[int] = None

class ChatQueryResponse(BaseModel):
    response: str
    session_id: int
    suggested_actions: List[str] = []
    is_fallback: bool = False
    disclaimer: str

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Admin Stats Schemas ---
class AdminStatsResponse(BaseModel):
    total_patients: int
    total_doctors: int
    total_departments: int
    total_appointments: int
    todays_appointments: int
    pending_appointments: int
    confirmed_appointments: int
    completed_appointments: int
