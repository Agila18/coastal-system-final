# Hydro Hub - Coastal Risk Assessment System

Hydro Hub is a comprehensive platform for coastal risk prediction and assessment in Tamil Nadu. It provides AI-driven insights, environmental data monitoring, and settlement safety modules.

## Features

- **AI Risk Analysis**: Predictive modeling for coastal risks (0-100 scale).
- **Interactive Map**: GIS-based visualization of village-specific risk levels.
- **Environmental Dashboard**: Real-time tracking of wave height, sea levels, and storms.
- **Safety Modules**: Settlement and structural safety assessments.

---

## 🚀 Getting Started on a New Device

Follow these steps to clone and set up the project on your machine.


### 1. Clone the Repository

Open your terminal (PowerShell, CMD, or Bash) and run:

```bash
git clone https://github.com/YOUR_USERNAME/Aqua-4.git
cd Aqua-4
```

### 2. Backend Setup (Python/FastAPI)

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Set up a virtual environment** (recommended):
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Seed the Database** (Initial data setup):
    ```bash
    python seed_db.py
    ```
5.  **Run the Backend server**:
    ```bash
    python run.py
    ```
    *The API will be available at http://localhost:8000*

### 3. Frontend Setup (React)

1.  **Open a NEW terminal window** and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the React application**:
    ```bash
    npm start
    ```
    *The dashboard will open at http://localhost:3000*

---

## Project Structure

- `/frontend`: React application (UI/UX)
- `/backend`: FastAPI application (API & Logic)
- `hydro_hub.db`: SQLite database file

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, Leaflet, Recharts
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Python
- **Database**: SQLite

---

## Verification

To ensure everything is working correctly:
- Run the backend tests: `python backend/test_api.py`
- Check API Docs: `http://localhost:8000/docs`
- Verify the Frontend map displays village markers correctly.
