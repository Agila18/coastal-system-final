import math
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app import crud, schemas
from app.database import get_db
from app.core.risk_calculator import RiskCalculator

router = APIRouter()

@router.get("/village/{village_id}", response_model=schemas.PredictionForecast)
def get_prediction_forecast(
    village_id: int, 
    db: Session = Depends(get_db),
    slr: float = None,
    rainfall: float = None,
    population: float = None,
    surge: float = None
):
    """
    Return 10-14 day forecast with daily risk scores and impact analysis.
    If no pre-calculated predictions exist, generate a dynamic simulation.
    Supports manual overrides for "What-If" scenarios.
    """
    start_date = date.today()
    end_date = start_date + timedelta(days=14)
    
    # If simulation parameters are provided, we ALWAYS generate a dynamic forecast
    # instead of pulling from historical records.
    is_simulation = any(v is not None for v in [slr, rainfall, population, surge])
    
    predictions = [] if is_simulation else crud.get_predictions(db, village_id=village_id, start_date=start_date, end_date=end_date)
    
    if not predictions:
        # Generate dynamic predictions based on latest village data
        env_data = crud.get_latest_environmental_data(db, village_id=village_id)
        settlement_data = crud.get_latest_settlement_data(db, village_id=village_id)
        
        if not env_data or not settlement_data:
            raise HTTPException(status_code=404, detail="Village baseline data not found to generate predictions")
        
        # Apply Simulation Overrides
        base_slr = slr if slr is not None else env_data.sea_level_rise
        base_rainfall = rainfall if rainfall is not None else env_data.extreme_rainfall
        base_surge = surge if surge is not None else env_data.storm_surge_height
        base_population = population if population is not None else settlement_data.population_density

        predictions = []
        for i in range(15): # 14-day forecast + today
            for_date = start_date + timedelta(days=i)
            
            # Simulate environmental fluctuations (sinusoidal + noise)
            variation = math.sin(i / 2.0) * 1.5 + (random.random() - 0.5) * 1.0
            
            simulated_env = {
                "sea_level_rise": max(1, min(10, base_slr + variation * 0.2)),
                "cyclone_frequency": max(1, min(10, env_data.cyclone_frequency + (variation if i % 4 == 0 else 0))),
                "storm_surge_height": max(1, min(10, base_surge + variation * 0.5)),
                "erosion_rate": max(1, min(10, env_data.erosion_rate + variation * 0.1)),
                "extreme_rainfall": max(1, min(10, base_rainfall + variation * 1.2))
            }
            
            simulated_settlement = {
                "population_density": base_population,
                "households": settlement_data.households,
                "distance_from_shore": settlement_data.distance_from_shore,
                "infrastructure_score": settlement_data.infrastructure_score
            }
            
            risk_profile = RiskCalculator.calculate_risk_profile(simulated_env, simulated_settlement)
            
            predictions.append({
                "id": 999000 + i, # Mock ID for dynamic generation
                "village_id": village_id,
                "prediction_date": start_date,
                "for_date": for_date,
                "predicted_risk_score": risk_profile["overall_risk_score"],
                "flood_probability": risk_profile["flood_risk"] / 10.0,
                "cyclone_probability": risk_profile["cyclone_risk"] / 10.0,
                "rainfall_probability": risk_profile["rainfall_risk"] / 10.0,
                "erosion_probability": risk_profile["erosion_risk"] / 10.0
            })

    # Calculate impact scores based on average risk in forecast
    avg_risk = sum(p["predicted_risk_score"] if isinstance(p, dict) else p.predicted_risk_score for p in predictions) / len(predictions)
    
    high_risk_days = sum(1 for p in predictions if (p["predicted_risk_score"] if isinstance(p, dict) else p.predicted_risk_score) > 60)
    
    # Impact calculation (normalized 0-10)
    eco_impact = min(10.0, avg_risk / 8.0)
    comm_impact = min(10.0, avg_risk / 9.0)

    return {
        "prediction_date": start_date,
        "forecast": predictions,
        "economic_impact_score": round(eco_impact, 1),
        "community_impact_score": round(comm_impact, 1),
        "high_risk_days": high_risk_days
    }
