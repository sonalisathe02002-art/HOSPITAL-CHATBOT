from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from app.database import get_db
from app.models import Doctor, Appointment
from app.schemas import DoctorResponse

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/", response_model=List[DoctorResponse])
def get_doctors(
    department_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Doctor)
    if department_id:
        query = query.filter(Doctor.department_id == department_id)
    if search:
        search_filter = (
            Doctor.name.ilike(f"%{search}%") |
            Doctor.specialization.ilike(f"%{search}%") |
            Doctor.qualification.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    return query.all()

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@router.get("/{doctor_id}/available-slots")
def get_doctor_slots(doctor_id: int, date: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Split configured slots
    all_slots = [s.strip() for s in doctor.time_slots.split(",") if s.strip()]

    # Query already booked slots for this doctor on this date that are not cancelled
    booked_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == date,
        Appointment.status.in_(["confirmed", "pending"])
    ).all()

    booked_times = set(apt.appointment_time.strip() for apt in booked_appointments)

    slot_statuses = []
    for slot in all_slots:
        slot_statuses.append({
            "time": slot,
            "available": slot not in booked_times
        })

    return {
        "doctor_id": doctor.id,
        "doctor_name": doctor.name,
        "date": date,
        "slots": slot_statuses
    }
