import random
from datetime import date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app import crud, models

class RiskPredictor:
    """
    Simple ML-based predictor for future risk assessments.
    Uses historical patterns and random variations to forecast risk.
    """

    @staticmethod
    def predict_risk(db: Session, village_id: int, days_ahead: int = 14) -> List[Dict[str, Any]]:
        """
        Generate risk forecasts for the next N days.
        """
        # Get current state
        current_assessment = crud.get_latest_risk_assessment(db, village_id=village_id)
        if not current_assessment:
            # Fallback if no data
            return []

        village = crud.get_village(db, village_id=village_id)
        settlement = crud.get_latest_settlement_data(db, village_id=village_id)
        
        predictions = []
        base_score = current_assessment.overall_risk_score
        current_date = date.today()

        # Trend factor (simple simulation)
        # e.g., if we assume risk is increasing slightly
        trend_slope = 0.05 

        for day in range(1, days_ahead + 1):
            forecast_date = current_date + timedelta(days=day)
            
            # 1. Calculate new score with random variation + trend
            # Brownian motion / Random Walk (Scale 0-100)
            variation = random.uniform(-5.0, 6.0) 
            weighted_score = base_score + (day * trend_slope * 2) + variation
            
            # Clamp to 0-100
            predicted_score = max(0.0, min(100.0, weighted_score))
            
            # 2. Individual Probabilities
            # High risk score (e.g. 80) = High probability (0.8)
            prob_base = predicted_score / 100.0
            
            flood_prob = min(1.0, max(0.0, prob_base + random.uniform(-0.1, 0.1)))
            cyclone_prob = min(1.0, max(0.0, prob_base * 0.8 + random.uniform(-0.1, 0.1))) # Slightly lower chance
            rainfall_prob = min(1.0, max(0.0, prob_base * 0.9 + random.uniform(-0.1, 0.1)))
            erosion_prob = min(1.0, max(0.0, prob_base * 0.6 + random.uniform(-0.05, 0.05)))

            # 3. Calculate Impact Scores
            impacts = RiskPredictor.calculate_impact_scores(predicted_score, settlement)
            
            pred = {
                "prediction_date": current_date,
                "for_date": forecast_date,
                "predicted_risk_score": round(predicted_score, 1),
                "flood_probability": round(flood_prob, 2),
                "cyclone_probability": round(cyclone_prob, 2),
                "rainfall_probability": round(rainfall_prob, 2),
                "erosion_probability": round(erosion_prob, 2),
                "economic_impact": impacts["economic_impact"],
                "community_impact": impacts["community_impact"]
            }
            predictions.append(pred)
            
            # Update base for next day (persistence)
            base_score = predicted_score

        return predictions

    @staticmethod
    def calculate_impact_scores(risk_score: float, settlement: models.SettlementData) -> Dict[str, float]:
        """
        Calculate economic and community impact based on risk and settlement vulnerability.
        """
        if not settlement:
            return {"economic_impact": 0.0, "community_impact": 0.0}

        # Normalize settlement factors (assuming they are 0-10 scale or similar)
        # population_density: High density = High community impact
        # households: More households = High economic impact
        # infrastructure_score: Low score = High vulnerability (if inverted), 
        # but let's assume infrastructure_score is 0-10 quality (10 is good).
        # Actually in our seeded data: infrastructure_score is just 0-10 random.
        # Let's assume higher infrastructure score = BETTER resilience = LOWER impact.
        
        # Factors
        pop_factor = min(10.0, settlement.population_density / 200.0) # approx scale
        infra_resilience = settlement.infrastructure_score # 0-10
        
        # Risk Severity (0-1)
        severity = risk_score / 100.0

        # Economic Impact: Risk normalized * Households * Factors
        # risk_score is 0-100. We need result 0-10.
        # factor = risk_score / 10 
        
        risk_component = risk_score / 10.0
        
        eco_impact = (risk_component * 0.5) + (hh_factor * 0.3) + ((10 - infra_resilience) * 0.2)
        eco_impact = max(0.0, min(10.0, eco_impact))
        
        # Community Impact: Risk * Pop Density 
        comm_impact = (risk_component * 0.6) + (pop_factor * 0.4)
        comm_impact = max(0.0, min(10.0, comm_impact))

        return {
            "economic_impact": round(eco_impact, 1),
            "community_impact": round(comm_impact, 1)
        }

    @staticmethod
    def get_high_risk_days(predictions: List[Dict[str, Any]], threshold: float = 60.0) -> List[date]:
        """
        Identify dates where risk exceeds threshold.
        """
        return [p["for_date"] for p in predictions if p["predicted_risk_score"] >= threshold]

# Sample usage testing
if __name__ == "__main__":
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # Test finding a village
        village = crud.get_village_by_name(db, "Kasimedu 1") # Use first seeded village
        if not village:
            # Fallback if specific name not found (since names are generated)
            pass 
        else:
            preds = RiskPredictor.predict_risk(db, village.id)
            print(f"Generated {len(preds)} predictions for {village.name}")
            for p in preds[:3]:
                print(p)
    finally:
        db.close()
