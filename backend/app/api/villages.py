from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Village])
def read_villages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    villages = crud.get_villages(db, skip=skip, limit=limit)
    return villages

@router.get("/{village_id}", response_model=schemas.Village)
def read_village(village_id: int, db: Session = Depends(get_db)):
    db_village = crud.get_village(db, village_id=village_id)
    if db_village is None:
        raise HTTPException(status_code=404, detail="Village not found")
    return db_village

@router.get("/code/{village_code}", response_model=schemas.Village)
def read_village_by_code(village_code: str, db: Session = Depends(get_db)):
    db_village = crud.get_village_by_code(db, code=village_code)
    if db_village is None:
        raise HTTPException(status_code=404, detail="Village not found")
    return db_village

@router.get("/search/", response_model=schemas.Village)
def search_village(name: str, db: Session = Depends(get_db)):
    db_village = crud.get_village_by_name(db, name=name)
    if db_village is None:
        raise HTTPException(status_code=404, detail=f"Village with name '{name}' not found")
    return db_village
