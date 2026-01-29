from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional
from datetime import date, timedelta

# --- Read Operations ---

def get_states(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.State).offset(skip).limit(limit).all()

def get_districts_by_state(db: Session, state_id: int):
    return db.query(models.District).filter(models.District.state_id == state_id).all()

def get_villages_by_district(db: Session, district_id: int):
    return db.query(models.Village).filter(models.Village.district_id == district_id).all()

def get_village(db: Session, village_id: int):
    return db.query(models.Village).filter(models.Village.id == village_id).first()

def get_village_by_code(db: Session, code: str):
    return db.query(models.Village).filter(models.Village.code == code).first()

def get_village_by_name(db: Session, name: str):
    return db.query(models.Village).filter(models.Village.name == name).first()

def get_latest_risk_assessment(db: Session, village_id: int):
    return db.query(models.RiskAssessment)\
             .filter(models.RiskAssessment.village_id == village_id)\
             .order_by(models.RiskAssessment.date.desc())\
             .first()

def get_risk_history(db: Session, village_id: int, days: int = 30):
    start_date = date.today() - timedelta(days=days)
    return db.query(models.RiskAssessment)\
             .filter(models.RiskAssessment.village_id == village_id)\
             .filter(models.RiskAssessment.date >= start_date)\
             .order_by(models.RiskAssessment.date.asc())\
             .all()

def get_latest_environmental_data(db: Session, village_id: int):
    return db.query(models.EnvironmentalData)\
             .filter(models.EnvironmentalData.village_id == village_id)\
             .order_by(models.EnvironmentalData.date.desc())\
             .first()

def get_latest_settlement_data(db: Session, village_id: int):
    return db.query(models.SettlementData)\
             .filter(models.SettlementData.village_id == village_id)\
             .order_by(models.SettlementData.date.desc())\
             .first()

def get_predictions(db: Session, village_id: int, start_date: date, end_date: date):
    return db.query(models.Prediction)\
             .filter(models.Prediction.village_id == village_id)\
             .filter(models.Prediction.for_date >= start_date)\
             .filter(models.Prediction.for_date <= end_date)\
             .order_by(models.Prediction.for_date.asc())\
             .all()

# --- Create Operations ---

def create_state(db: Session, state: schemas.StateCreate):
    db_state = models.State(name=state.name, code=state.code)
    db.add(db_state)
    db.commit()
    db.refresh(db_state)
    return db_state

def create_district(db: Session, district: schemas.DistrictCreate):
    db_district = models.District(**district.dict())
    db.add(db_district)
    db.commit()
    db.refresh(db_district)
    return db_district

def create_village(db: Session, village: schemas.VillageCreate):
    db_village = models.Village(**village.dict())
    db.add(db_village)
    db.commit()
    db.refresh(db_village)
    return db_village

def create_environmental_data(db: Session, data: schemas.EnvironmentalDataCreate):
    db_data = models.EnvironmentalData(**data.dict())
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

def create_settlement_data(db: Session, data: schemas.SettlementDataCreate):
    db_data = models.SettlementData(**data.dict())
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

def create_risk_assessment(db: Session, risk: schemas.RiskAssessmentCreate):
    db_risk = models.RiskAssessment(**risk.dict())
    db.add(db_risk)
    db.commit()
    db.refresh(db_risk)
    return db_risk

def create_prediction(db: Session, prediction: schemas.PredictionCreate):
    db_prediction = models.Prediction(**prediction.dict())
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction
