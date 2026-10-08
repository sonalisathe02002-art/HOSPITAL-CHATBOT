from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Department, Doctor
from app.schemas import DepartmentResponse, DoctorResponse

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=List[DepartmentResponse])
def get_departments(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Department)
    if search:
        query = query.filter(Department.name.ilike(f"%{search}%") | Department.description.ilike(f"%{search}%"))
    return query.all()

@router.get("/{dept_id}", response_model=DepartmentResponse)
def get_department_detail(dept_id: int, db: Session = Depends(get_db)):
    department = db.query(Department).filter(Department.id == dept_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.get("/{dept_id}/doctors", response_model=List[DoctorResponse])
def get_department_doctors(dept_id: int, db: Session = Depends(get_db)):
    doctors = db.query(Doctor).filter(Doctor.department_id == dept_id).all()
    return doctors
