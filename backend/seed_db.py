from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, schemas, crud
from datetime import date, timedelta
import random

# --- Exact Data from Frontend locationData.js ---

LOCATION_DATA = {
    "Tamil Nadu": {
        "code": "TN",
        "districts": {
            "Chennai": ["Kasimedu", "Nochikuppam", "Srinivasapuram", "Pattinapakkam"],
            "Kanyakumari": ["Colachel", "Muttom", "Pallam", "Thoothoor"],
            "Nagapattinam": ["Velankanni", "Poompuhar", "Vedaranyam", "Karaikal"],
            "Cuddalore": ["Parangipettai", "Silver Beach", "Devanampattinam", "Pichavaram"]
        }
    },
    "Kerala": {
        "code": "KL",
        "districts": {
            "Thiruvananthapuram": ["Kovalam", "Varkala", "Shanghumukham", "Vizhinjam"],
            "Kollam": ["Thirumullavaram", "Chavara", "Neendakara", "Paravur"],
            "Alappuzha": ["Mararikulam", "Arthunkal", "Andhakaranazhi", "Purakkad"],
            "Thrissur": ["Nattika", "Chavakkad", "Chettuva", "Methala"]
        }
    },
    "Telangana": {
        "code": "TG",
        "districts": {
            "Hyderabad": ["Hussain Sagar", "Durgam Cheruvu", "Osman Sagar", "Himayat Sagar"],
            "Warangal": ["Pakhal Lake", "Ramappa Lake", "Laknavaram Lake", "Ghanpur"],
            "Nizamabad": ["Pocharam", "Sri Ram Sagar", "Kaddam", "Manjira"],
            "Khammam": ["Kinnerasani", "Wyra", "Paloncha", "Taliperu"]
        }
    },
    "Odisha": {
        "code": "OD",
        "districts": {
            "Puri": ["Konark", "Satapada", "Astaranga", "Baliharchandi"],
            "Ganjam": ["Gopalpur", "Rushikulya", "Chhatrapur", "Bahuda"],
            "Balasore": ["Chandipur", "Talasari", "Dagara", "Udaypur"],
            "Kendrapara": ["Hukitola", "Paradip", "Bhitarkanika", "Kharinasi"]
        }
    }
}

def seed_data():
    # Re-create tables
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    print("Seeding database (0-100 Risk Scale)...")

    for state_name, state_info in LOCATION_DATA.items():
        # Create State
        state_in = schemas.StateCreate(name=state_name, code=state_info["code"])
        state = crud.create_state(db, state_in)
        print(f"Created State: {state.name}")

        for dist_name, villages in state_info["districts"].items():
            # Create District
            dist_code = f"{state.code}_{dist_name[:3].upper()}"
            dist_in = schemas.DistrictCreate(name=dist_name, code=dist_code, state_id=state.id)
            district = crud.create_district(db, dist_in)
            
            # Create Villages
            for v_idx, v_name in enumerate(villages):
                # Generate unique code like TN_CHE_KAS
                v_code_suffix = v_name[:3].upper()
                v_code = f"{dist_code}_{v_code_suffix}"
            
                # Randomized coordinates near a base point
                base_lat = 13.0 if state.code == "TN" else (10.0 if state.code == "KL" else (17.0 if state.code == "TG" else 20.0))
                base_lng = 80.0 if state.code == "TN" else (76.0 if state.code == "KL" else (78.0 if state.code == "TG" else 85.0))
                
                lat = base_lat + random.uniform(-0.5, 0.5)
                lng = base_lng + random.uniform(-0.5, 0.5)

                village_in = schemas.VillageCreate(
                    name=v_name,
                    code=v_code,
                    district_id=district.id,
                    latitude=round(lat, 4),
                    longitude=round(lng, 4)
                )
                village = crud.create_village(db, village_in)

                # --- Create Related Data ---
                today = date.today()

                # 1. Environmental Data (0-10 Scale inputs)
                env_in = schemas.EnvironmentalDataCreate(
                    village_id=village.id,
                    date=today,
                    sea_level_rise=round(random.uniform(1.0, 9.0), 2),
                    cyclone_frequency=round(random.uniform(0.0, 8.0), 2),
                    storm_surge_height=round(random.uniform(0.0, 8.0), 2),
                    erosion_rate=round(random.uniform(0.0, 8.0), 2),
                    extreme_rainfall=round(random.uniform(0.0, 9.0), 1)
                )
                crud.create_environmental_data(db, env_in)

                # 2. Settlement Data (0-10 Scale inputs)
                settlement_in = schemas.SettlementDataCreate(
                    village_id=village.id,
                    date=today,
                    population_density=round(random.uniform(1.0, 9.0), 1), # Scaled 0-10
                    households=random.randint(2, 9), # Scaled 0-10
                    distance_from_shore=round(random.uniform(1.0, 9.0), 1), # Scaled 0-10 (Inverted: 9 is Close/High Risk)
                    infrastructure_score=round(random.uniform(1.0, 9.0), 1) # Scaled 0-10 (Inverted: 9 is Poor/High Risk)
                )
                crud.create_settlement_data(db, settlement_in)

                # 3. Risk Assessment (0-100 Overall, 0-10 Components)
                overall_score = round(random.uniform(15.0, 95.0), 1) # 0-100 Scale
                
                cat = "Low"
                if overall_score > 75: cat = "Extreme"
                elif overall_score > 50: cat = "High"
                elif overall_score > 25: cat = "Moderate"

                risk_in = schemas.RiskAssessmentCreate(
                    village_id=village.id,
                    date=today,
                    overall_risk_score=overall_score,
                    flood_risk=round(random.uniform(1.0, 9.0), 1),     # 0-10
                    cyclone_risk=round(random.uniform(1.0, 9.0), 1),   # 0-10
                    rainfall_risk=round(random.uniform(1.0, 9.0), 1),  # 0-10
                    erosion_risk=round(random.uniform(1.0, 9.0), 1),   # 0-10
                    risk_category=cat
                )
                crud.create_risk_assessment(db, risk_in)

                # 4. Predictions (for next 5 years)
                for year_offset in range(1, 6):
                    # Slight trend up in score
                    pred_score = min(100.0, overall_score + (year_offset * 1.5)) 
                    
                    pred_in = schemas.PredictionCreate(
                        village_id=village.id,
                        prediction_date=today,
                        for_date=today.replace(year=today.year + year_offset),
                        predicted_risk_score=round(pred_score, 1),
                        flood_probability=round(random.uniform(0.1, 0.9), 2),
                        cyclone_probability=round(random.uniform(0.1, 0.9), 2),
                        rainfall_probability=round(random.uniform(0.1, 0.9), 2),
                        erosion_probability=round(random.uniform(0.1, 0.9), 2)
                    )
                    crud.create_prediction(db, pred_in)

    db.close()
    print("Database seeding complete!")

if __name__ == "__main__":
    seed_data()
