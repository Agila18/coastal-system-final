from typing import Dict, Any

class RiskCalculator:
    """
    Risk Assessment Engine for Hydro Hub.
    Calculates detailed risk profiles based on environmental and settlement indicators.
    """

    @staticmethod
    def calculate_risk_profile(
        environmental: Dict[str, float], 
        settlement: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Calculate full risk profile including sub-categorical risks and overall score.
        
        Args:
            environmental: Dict with keys (0-10 scale):
                - sea_level_rise
                - cyclone_frequency
                - storm_surge_height
                - erosion_rate
                - extreme_rainfall
            
            settlement: Dict with keys (0-10 scale):
                - population_density
                - households
                - distance_from_shore (inverted: 10=close/high risk, 0=far/low risk)
                - infrastructure_score (inverted: 10=poor/high risk, 0=good/low risk)
                
        Returns:
            Dict containing calculated scores and risk category.
        """
        
        # 1. Component Risk Calculations (0-10 scale)
        
        # Flood Risk: Weighted mainly by SLR and Surge, then Rainfall
        flood_risk = (
            (environmental.get("sea_level_rise", 0) * 0.4) +
            (environmental.get("storm_surge_height", 0) * 0.3) +
            (environmental.get("extreme_rainfall", 0) * 0.3)
        )
        
        # Cyclone Risk: Cyclone Frequency and Surge Height
        cyclone_risk = (
            (environmental.get("cyclone_frequency", 0) * 0.6) +
            (environmental.get("storm_surge_height", 0) * 0.4)
        )
        
        # Rainfall Risk: Purely Extreme Rainfall
        rainfall_risk = environmental.get("extreme_rainfall", 0)
        
        # Erosion Risk: Erosion Rate and Proximity to Shore
        erosion_risk = (
            (environmental.get("erosion_rate", 0) * 0.6) +
            (settlement.get("distance_from_shore", 0) * 0.4)
        )

        # 2. Category Aggregates (0-100 scale)
        
        # Environmental Aggregate (Average of factors * 10)
        env_sum = sum([
            environmental.get("sea_level_rise", 0),
            environmental.get("cyclone_frequency", 0),
            environmental.get("storm_surge_height", 0),
            environmental.get("erosion_rate", 0),
            environmental.get("extreme_rainfall", 0)
        ])
        environmental_score = (env_sum / 5) * 10
        
        # Settlement Aggregate (Average of factors * 10)
        # Note: distance_from_shore and infrastructure_score should already be passed as risk values (inverted if needed before calling)
        # However, if the caller passes raw values, we assume they are already normalized to "Higher is Riskier"
        settlement_sum = sum([
            settlement.get("population_density", 0),
            settlement.get("households", 0),
            settlement.get("distance_from_shore", 0),
            settlement.get("infrastructure_score", 0)
        ])
        settlement_score = (settlement_sum / 4) * 10

        # 3. Overall Risk Score (Weighted 60/40)
        overall_score = (environmental_score * 0.60) + (settlement_score * 0.40)
        
        # Rounding for UI
        result = {
            "flood_risk": round(flood_risk, 1),
            "cyclone_risk": round(cyclone_risk, 1),
            "rainfall_risk": round(rainfall_risk, 1),
            "erosion_risk": round(erosion_risk, 1),
            "overall_risk_score": round(overall_score, 1),
            "environmental_score": round(environmental_score, 1),
            "settlement_score": round(settlement_score, 1),
            "risk_category": RiskCalculator.categorize_risk(overall_score)
        }
        
        return result

    @staticmethod
    def categorize_risk(score: float) -> str:
        if score <= 25:
            return "Low"
        elif score <= 50:
            return "Moderate"
        elif score <= 75:
            return "High"
        else:
            return "Extreme"

    @staticmethod
    def normalize_input(value: float, min_val: float, max_val: float, inverted: bool = False) -> float:
        """
        Helper to normalize raw data (e.g., mm of rain) to 0-10 scale.
        """
        if max_val == min_val:
            return 5.0
            
        normalized = ((value - min_val) / (max_val - min_val)) * 10
        
        # Clamp to 0-10
        normalized = max(0.0, min(10.0, normalized))
        
        if inverted:
            return 10.0 - normalized
        return normalized
