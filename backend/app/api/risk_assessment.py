from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter()

@router.get("/{village_id}", response_model=schemas.RiskAssessment)
def read_risk_assessment(village_id: int, db: Session = Depends(get_db)):
    assessment = crud.get_latest_risk_assessment(db, village_id=village_id)
    if assessment is None:
        raise HTTPException(status_code=404, detail="Risk Assessment not found for this village")
    return assessment
