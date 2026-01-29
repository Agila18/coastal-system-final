from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas, models
from app.database import get_db
from app.core.risk_calculator import RiskCalculator

router = APIRouter()

@router.get("/village/{village_id}", response_model=schemas.DetailedRiskProfile)
def get_village_risk_profile(village_id: int, db: Session = Depends(get_db)):
    """
    Return current risk assessment with detailed breakdown.
    Includes overall score, component scores, environmental factors, and settlement data.
    """
    village = crud.get_village(db, village_id=village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    assessment = crud.get_latest_risk_assessment(db, village_id=village_id)
    env_data = crud.get_latest_environmental_data(db, village_id=village_id)
    settlement_data = crud.get_latest_settlement_data(db, village_id=village_id)

    if not assessment:
        raise HTTPException(status_code=404, detail="Risk assessment data unavailable")

    return {
        "village": village,
        "district": village.district.name if village.district else "N/A",
        "state": village.district.state.name if village.district and village.district.state else "N/A",
        "overall_risk_score": assessment.overall_risk_score,
        "risk_scores": {
            "flood": assessment.flood_risk,
            "cyclone": assessment.cyclone_risk,
            "rainfall": assessment.rainfall_risk,
            "erosion": assessment.erosion_risk
        },
        "risk_category": assessment.risk_category,
        "environmental": env_data,
        "settlement": settlement_data,
        "last_updated": assessment.date
    }

@router.get("/village/{village_id}/history", response_model=List[schemas.RiskAssessment])
def get_village_risk_history(village_id: int, db: Session = Depends(get_db)):
    """Return historical risk data (last 30 days)"""
    history = crud.get_risk_history(db, village_id=village_id, days=30)
    return history

@router.post("/calculate")
def calculate_custom_risk(
    environmental: dict = Body(..., example={"sea_level_rise": 5, "cyclone_frequency": 2, "storm_surge_height": 3, "erosion_rate": 4, "extreme_rainfall": 6}),
    settlement: dict = Body(..., example={"population_density": 8, "households": 7, "distance_from_shore": 9, "infrastructure_score": 5})
):
    """
    Calculate risk for custom input data (testing endpoint).
    """
    return RiskCalculator.calculate_risk_profile(environmental, settlement)
