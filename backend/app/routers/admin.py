from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Doctor, Department, Appointment, HospitalService
from app.schemas import (
    AdminStatsResponse,
    UserResponse,
    DoctorCreate,
    DoctorUpdate,
    DoctorResponse,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    AppointmentResponse,
    AppointmentStatusUpdate,
    HospitalServiceCreate,
    HospitalServiceUpdate,
    HospitalServiceResponse
)
from app.auth import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin_user)])

# --- Dashboard Overview Statistics ---
@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(db: Session = Depends(get_db)):
    today_str = date.today().strftime("%Y-%m-%d")
    
    total_patients = db.query(User).filter(User.role == "patient").count()
    total_doctors = db.query(Doctor).count()
    total_departments = db.query(Department).count()
    total_appointments = db.query(Appointment).count()
    
    todays_appointments = db.query(Appointment).filter(Appointment.appointment_date == today_str).count()
    pending_appointments = db.query(Appointment).filter(Appointment.status == "pending").count()
    confirmed_appointments = db.query(Appointment).filter(Appointment.status == "confirmed").count()
    completed_appointments = db.query(Appointment).filter(Appointment.status == "completed").count()

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_departments": total_departments,
        "total_appointments": total_appointments,
        "todays_appointments": todays_appointments,
        "pending_appointments": pending_appointments,
        "confirmed_appointments": confirmed_appointments,
        "completed_appointments": completed_appointments
    }

# --- Patients Management ---
@router.get("/patients", response_model=List[UserResponse])
def get_all_patients(db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == "patient").order_by(User.created_at.desc()).all()

# --- Appointments Management ---
@router.get("/appointments", response_model=List[AppointmentResponse])
def get_all_appointments(
    status: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    if status:
        query = query.filter(Appointment.status == status)
    if date:
        query = query.filter(Appointment.appointment_date == date)
    return query.order_by(Appointment.appointment_date.desc(), Appointment.id.desc()).all()

@router.put("/appointments/{apt_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    apt_id: int,
    status_update: AppointmentStatusUpdate,
    db: Session = Depends(get_db)
):
    apt = db.query(Appointment).filter(Appointment.id == apt_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    apt.status = status_update.status
    db.commit()
    db.refresh(apt)
    return apt

# --- Doctors Management ---
@router.post("/doctors", response_model=DoctorResponse)
def create_doctor(doctor_in: DoctorCreate, db: Session = Depends(get_db)):
    existing = db.query(Doctor).filter(Doctor.email == doctor_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Doctor with this email already exists.")
    dept = db.query(Department).filter(Department.id == doctor_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department does not exist.")

    new_doc = Doctor(**doctor_in.dict())
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@router.put("/doctors/{doctor_id}", response_model=DoctorResponse)
def update_doctor(doctor_id: int, doctor_in: DoctorUpdate, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")

    for key, value in doctor_in.dict(exclude_unset=True).items():
        setattr(doc, key, value)

    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/doctors/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(doc)
    db.commit()
    return {"message": f"Doctor {doc.name} deleted successfully"}

# --- Departments Management ---
@router.post("/departments", response_model=DepartmentResponse)
def create_department(dept_in: DepartmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Department).filter(Department.name == dept_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department name already exists.")

    new_dept = Department(**dept_in.dict())
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

@router.put("/departments/{dept_id}", response_model=DepartmentResponse)
def update_department(dept_id: int, dept_in: DepartmentUpdate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    for key, value in dept_in.dict(exclude_unset=True).items():
        setattr(dept, key, value)

    db.commit()
    db.refresh(dept)
    return dept

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    return {"message": f"Department {dept.name} deleted successfully"}

# --- Hospital Services Management ---
@router.post("/services", response_model=HospitalServiceResponse)
def create_service(srv_in: HospitalServiceCreate, db: Session = Depends(get_db)):
    new_srv = HospitalService(**srv_in.dict())
    db.add(new_srv)
    db.commit()
    db.refresh(new_srv)
    return new_srv

@router.put("/services/{service_id}", response_model=HospitalServiceResponse)
def update_service(service_id: int, srv_in: HospitalServiceUpdate, db: Session = Depends(get_db)):
    srv = db.query(HospitalService).filter(HospitalService.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")

    for key, value in srv_in.dict(exclude_unset=True).items():
        setattr(srv, key, value)

    db.commit()
    db.refresh(srv)
    return srv

@router.delete("/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    srv = db.query(HospitalService).filter(HospitalService.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(srv)
    db.commit()
    return {"message": "Service deleted successfully"}
