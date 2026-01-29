from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    code = Column(String, unique=True, index=True)

    districts = relationship("District", back_populates="state")

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id"))
    name = Column(String, index=True)
    code = Column(String, index=True)

    state = relationship("State", back_populates="districts")
    villages = relationship("Village", back_populates="district")

class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id"))
    name = Column(String, index=True)
    code = Column(String, unique=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)

    district = relationship("District", back_populates="villages")
    environmental_data = relationship("EnvironmentalData", back_populates="village")
    settlement_data = relationship("SettlementData", back_populates="village")
    risk_assessments = relationship("RiskAssessment", back_populates="village")
    predictions = relationship("Prediction", back_populates="village")

class EnvironmentalData(Base):
    __tablename__ = "environmental_data"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"))
    date = Column(Date, default=datetime.utcnow)
    sea_level_rise = Column(Float)  # e.g., mm/year
    cyclone_frequency = Column(Float) # probability or count
    storm_surge_height = Column(Float) # meters
    erosion_rate = Column(Float) # meters/year
    extreme_rainfall = Column(Float) # mm

    village = relationship("Village", back_populates="environmental_data")

class SettlementData(Base):
    __tablename__ = "settlement_data"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"))
    date = Column(Date, default=datetime.utcnow)
    population_density = Column(Float)
    households = Column(Integer)
    distance_from_shore = Column(Float) # meters
    infrastructure_score = Column(Float) # 0-10 scale

    village = relationship("Village", back_populates="settlement_data")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"))
    date = Column(Date, default=datetime.utcnow)
    overall_risk_score = Column(Float)
    flood_risk = Column(Float)
    cyclone_risk = Column(Float)
    rainfall_risk = Column(Float)
    erosion_risk = Column(Float)
    risk_category = Column(String) # low, moderate, high, extreme

    village = relationship("Village", back_populates="risk_assessments")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"))
    prediction_date = Column(Date, default=datetime.utcnow)
    for_date = Column(Date)
    predicted_risk_score = Column(Float)
    flood_probability = Column(Float)
    cyclone_probability = Column(Float)
    rainfall_probability = Column(Float)
    erosion_probability = Column(Float)

    village = relationship("Village", back_populates="predictions")
