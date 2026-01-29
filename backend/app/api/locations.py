from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db

router = APIRouter()

@router.get("/states", response_model=List[schemas.State])
def read_states(db: Session = Depends(get_db)):
    """Return all states"""
    return crud.get_states(db)

@router.get("/districts/{state_id}", response_model=List[schemas.District])
def read_districts(state_id: int, db: Session = Depends(get_db)):
    """Return districts for a state"""
    districts = crud.get_districts_by_state(db, state_id=state_id)
    return districts

@router.get("/villages/search", response_model=schemas.Village)
def search_village(name: str, db: Session = Depends(get_db)):
    """Search village by name"""
    db_village = crud.get_village_by_name(db, name=name)
    if db_village is None:
        raise HTTPException(status_code=404, detail=f"Village with name '{name}' not found")
    return db_village

@router.get("/villages/{district_id}", response_model=List[schemas.Village])
def read_villages_by_district(district_id: int, db: Session = Depends(get_db)):
    """Return villages for a district"""
    villages = crud.get_villages_by_district(db, district_id=district_id)
    return villages
