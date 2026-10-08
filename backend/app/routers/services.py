from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import HospitalService
from app.schemas import HospitalServiceResponse

router = APIRouter(prefix="/services", tags=["Hospital Services"])

@router.get("/", response_model=List[HospitalServiceResponse])
def get_hospital_services(
    category: Optional[str] = None,
    featured_only: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    query = db.query(HospitalService)
    if category:
        query = query.filter(HospitalService.category.ilike(f"%{category}%"))
    if featured_only:
        query = query.filter(HospitalService.is_featured == True)
    return query.all()

@router.get("/{service_id}", response_model=HospitalServiceResponse)
def get_service_detail(service_id: int, db: Session = Depends(get_db)):
    srv = db.query(HospitalService).filter(HospitalService.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")
    return srv
