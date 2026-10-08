import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Appointment, Doctor, Department, User, Notification
from app.schemas import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentReschedule,
    AppointmentStatusUpdate
)
from app.auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

def generate_appointment_code() -> str:
    year = datetime.now().year
    random_digits = "".join(random.choices(string.digits, k=4))
    return f"APT-{year}-{random_digits}"

@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    apt_in: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == apt_in.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Selected doctor was not found.")

    # Check for double booking!
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == apt_in.doctor_id,
        Appointment.appointment_date == apt_in.appointment_date,
        Appointment.appointment_time == apt_in.appointment_time,
        Appointment.status.in_(["confirmed", "pending"])
    ).first()

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Dr. {doctor.name} already has a confirmed appointment at {apt_in.appointment_time} on {apt_in.appointment_date}. Please choose another available slot."
        )

    # Unique code
    code = generate_appointment_code()
    while db.query(Appointment).filter(Appointment.appointment_code == code).first():
        code = generate_appointment_code()

    new_apt = Appointment(
        appointment_code=code,
        patient_id=current_user.id,
        doctor_id=apt_in.doctor_id,
        department_id=apt_in.department_id,
        appointment_date=apt_in.appointment_date,
        appointment_time=apt_in.appointment_time,
        status="confirmed",
        reason=apt_in.reason,
        notes=apt_in.notes
    )

    db.add(new_apt)
    db.commit()
    db.refresh(new_apt)

    # Generate Notification for the patient
    dept = db.query(Department).filter(Department.id == apt_in.department_id).first()
    dept_name = dept.name if dept else "General"
    notification = Notification(
        user_id=current_user.id,
        title="Appointment Confirmed",
        message=f"Your appointment ({code}) with Dr. {doctor.name} ({dept_name}) is confirmed for {apt_in.appointment_date} at {apt_in.appointment_time}.",
        type="success"
    )
    db.add(notification)
    db.commit()

    return new_apt

@router.get("/my", response_model=List[AppointmentResponse])
def get_my_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(
        Appointment.patient_id == current_user.id
    ).order_by(Appointment.appointment_date.desc(), Appointment.id.desc()).all()
    return appointments

@router.get("/{apt_id}", response_model=AppointmentResponse)
def get_appointment(
    apt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == apt_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    # Restrict to owner or admin
    if appointment.patient_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this appointment.")

    return appointment

@router.put("/{apt_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(
    apt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == apt_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    if appointment.patient_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to modify this appointment.")

    appointment.status = "cancelled"
    db.commit()
    db.refresh(appointment)

    # Notification
    doctor_name = appointment.doctor.name if appointment.doctor else "Doctor"
    notification = Notification(
        user_id=appointment.patient_id,
        title="Appointment Cancelled",
        message=f"Your appointment {appointment.appointment_code} with Dr. {doctor_name} has been cancelled.",
        type="warning"
    )
    db.add(notification)
    db.commit()

    return appointment

@router.put("/{apt_id}/reschedule", response_model=AppointmentResponse)
def reschedule_appointment(
    apt_id: int,
    reschedule_data: AppointmentReschedule,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == apt_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    if appointment.patient_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to modify this appointment.")

    # Check for slot conflict
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == appointment.doctor_id,
        Appointment.appointment_date == reschedule_data.appointment_date,
        Appointment.appointment_time == reschedule_data.appointment_time,
        Appointment.id != appointment.id,
        Appointment.status.in_(["confirmed", "pending"])
    ).first()

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The requested slot is already booked. Please choose a different time."
        )

    appointment.appointment_date = reschedule_data.appointment_date
    appointment.appointment_time = reschedule_data.appointment_time
    appointment.status = "confirmed"
    if reschedule_data.notes:
        appointment.notes = f"{appointment.notes or ''} [Rescheduled: {reschedule_data.notes}]".strip()

    db.commit()
    db.refresh(appointment)

    # Notification
    doctor_name = appointment.doctor.name if appointment.doctor else "Doctor"
    notification = Notification(
        user_id=appointment.patient_id,
        title="Appointment Rescheduled",
        message=f"Appointment {appointment.appointment_code} with Dr. {doctor_name} was rescheduled to {reschedule_data.appointment_date} at {reschedule_data.appointment_time}.",
        type="info"
    )
    db.add(notification)
    db.commit()

    return appointment
