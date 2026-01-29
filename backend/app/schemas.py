from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# --- Base Models ---

class StateBase(BaseModel):
    name: str
    code: str

class DistrictBase(BaseModel):
    name: str
    code: str

class VillageBase(BaseModel):
    name: str
    code: str
    latitude: float
    longitude: float

class EnvironmentalDataBase(BaseModel):
    date: date
    sea_level_rise: float
    cyclone_frequency: float
    storm_surge_height: float
    erosion_rate: float
    extreme_rainfall: float

class SettlementDataBase(BaseModel):
    date: date
    population_density: float
    households: int
    distance_from_shore: float
    infrastructure_score: float

class RiskAssessmentBase(BaseModel):
    date: date
    overall_risk_score: float
    flood_risk: float
    cyclone_risk: float
    rainfall_risk: float
    erosion_risk: float
    risk_category: str

class PredictionBase(BaseModel):
    prediction_date: date
    for_date: date
    predicted_risk_score: float
    flood_probability: float
    cyclone_probability: float
    rainfall_probability: float
    erosion_probability: float

# --- Create Models ---

class StateCreate(StateBase):
    pass

class DistrictCreate(DistrictBase):
    state_id: int

class VillageCreate(VillageBase):
    district_id: int

class EnvironmentalDataCreate(EnvironmentalDataBase):
    village_id: int

class SettlementDataCreate(SettlementDataBase):
    village_id: int

class RiskAssessmentCreate(RiskAssessmentBase):
    village_id: int

class PredictionCreate(PredictionBase):
    village_id: int

# --- Response Models ---

class EnvironmentalData(EnvironmentalDataBase):
    id: int
    village_id: int
    class Config:
        from_attributes = True

class SettlementData(SettlementDataBase):
    id: int
    village_id: int
    class Config:
        from_attributes = True

class RiskAssessment(RiskAssessmentBase):
    id: int
    village_id: int
    class Config:
        from_attributes = True

class Prediction(PredictionBase):
    id: int
    village_id: int
    class Config:
        from_attributes = True

class PredictionForecast(BaseModel):
    # Specialized model for the 10-14 day forecast response
    prediction_date: date
    forecast: List[Prediction]
    economic_impact_score: float
    community_impact_score: float
    high_risk_days: int

class Village(VillageBase):
    id: int
    district_id: int
    class Config:
        from_attributes = True

class District(DistrictBase):
    id: int
    state_id: int
    class Config:
        from_attributes = True

class State(StateBase):
    id: int
    class Config:
        from_attributes = True

class DetailedRiskProfile(BaseModel):
    village: Village
    district: str
    state: str
    overall_risk_score: float
    risk_scores: dict  # {flood, cyclone, rainfall, erosion}
    risk_category: str
    environmental: Optional[EnvironmentalData]
    settlement: Optional[SettlementData]
    last_updated: date
