from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models
from app.database import engine
from app.api import villages, risk_assessment, predictions, locations, risk

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hydro Hub API", description="Coastal Risk Assessment Platform Backend")

# CORS middleware configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "*" # For development convenience, restrict in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(locations.router, prefix="/api", tags=["Locations"])
app.include_router(risk.router, prefix="/api/risk", tags=["Risk Analysis"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])

# Legacy/Specific routers if needed, or deprecate/merge
app.include_router(villages.router, prefix="/api/villages-legacy", tags=["Villages (Legacy)"]) 

@app.get("/")
def read_root():
    return {"message": "Welcome to Hydro Hub API"}
