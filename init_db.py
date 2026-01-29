import sqlite3
import random

def init_db():
    conn = sqlite3.connect('coastal_risk.db')
    cursor = conn.cursor()

    # Create Tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS villages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        district TEXT NOT NULL,
        state TEXT DEFAULT 'Tamil Nadu'
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS environmental_data (
        village_id INTEGER,
        year INTEGER,
        sea_level_rise REAL,
        wind_speed REAL,
        humidity_level REAL,
        cyclone_frequency INTEGER,
        flood_frequency INTEGER,
        storm_surge_height REAL,
        erosion_rate REAL,
        extreme_rainfall REAL,
        FOREIGN KEY (village_id) REFERENCES villages (id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS settlement_data (
        village_id INTEGER,
        year INTEGER,
        population_density REAL,
        households INTEGER,
        distance_from_shore REAL,
        infrastructure_score REAL,
        FOREIGN KEY (village_id) REFERENCES villages (id)
    )
    ''')

    # Village Data
    villages = [
        # Chennai
        ("Urur Kuppam", 12.9984, 80.2642, "Chennai"),
        ("Nochikuppam", 13.0333, 80.2785, "Chennai"),
        ("Foreshore Estate", 13.0300, 80.2800, "Chennai"),
        ("Kasimedu", 13.1236, 80.2998, "Chennai"),
        # Nagapattinam
        ("Akkaraipettai", 10.7429, 79.8490, "Nagapattinam"),
        ("Keechankuppam", 10.7429, 79.8490, "Nagapattinam"),
        ("Velankanni", 10.6819, 79.8437, "Nagapattinam"),
        ("Nagore", 10.8162, 79.8422, "Nagapattinam"),
        # Cuddalore
        ("Devanampattinam", 11.7467, 79.7834, "Cuddalore"),
        ("Silver Beach", 11.7395, 79.7863, "Cuddalore"),
        ("Pichavaram", 11.4333, 79.7833, "Cuddalore"),
        ("Samiyarpettai", 11.6934, 79.7788, "Cuddalore"),
        # Kanchipuram / Chengalpattu (Coastal)
        ("Kovalam", 12.7936, 80.2285, "Chengalpattu"),
        ("Kalpakkam", 12.5576, 80.1754, "Chengalpattu"),
        ("Sadras", 12.5250, 80.1622, "Chengalpattu"),
        ("Mahabalipuram", 12.6269, 80.1920, "Chengalpattu")
    ]

    cursor.executemany('INSERT INTO villages (name, latitude, longitude, district) VALUES (?, ?, ?, ?)', villages)
    conn.commit()

    # Get village IDs
    cursor.execute('SELECT id, name, district FROM villages')
    village_list = cursor.fetchall()

    years = list(range(2017, 2027))

    for vid, name, district in village_list:
        # Base values for realistic trends
        # Nagapattinam and Cuddalore are more vulnerable to cyclones and erosion
        vulnerability_factor = 1.2 if district in ["Nagapattinam", "Cuddalore"] else 1.0
        
        base_slr = 0 # Sea level rise starts at 0 for 2017 reference
        base_pop_density = random.uniform(800, 1500) if district == "Chennai" else random.uniform(300, 600)
        
        for year in years:
            # Environmental Data Generation
            # Sea level rise increases roughly 3-4mm per year
            slr = (year - 2017) * random.uniform(3.0, 4.5)
            # Wind speed fluctuates, higher in cyclone years
            wind_speed = random.uniform(15, 25) + (5 if random.random() > 0.8 else 0)
            humidity = random.uniform(70, 85)
            
            # Cyclone and Flood frequencies (higher for Nagapattinam/Cuddalore)
            cyclone_freq = 1 if (random.random() > (0.7 / vulnerability_factor)) else 0
            if year in [2018, 2021, 2023]: # Major cyclone years in TN
                cyclone_freq = max(cyclone_freq, 1)
            
            flood_freq = 1 if (random.random() > (0.6 / vulnerability_factor)) else 0
            if year in [2015, 2021, 2023, 2025]: # Notable flood years
                flood_freq = max(flood_freq, 1)

            storm_surge = random.uniform(0.5, 2.5) * vulnerability_factor if cyclone_freq > 0 else random.uniform(0.1, 0.5)
            erosion = random.uniform(0.5, 3.0) * vulnerability_factor
            extreme_rainfall = random.uniform(150, 400) if flood_freq > 0 else random.uniform(50, 150)

            cursor.execute('''
            INSERT INTO environmental_data VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (vid, year, slr, wind_speed, humidity, cyclone_freq, flood_freq, storm_surge, erosion, extreme_rainfall))

            # Settlement Data Generation
            pop_density = base_pop_density * (1 + (year - 2017) * 0.015) # 1.5% annual growth
            households = int(pop_density * 0.5) 
            distance_from_shore = max(50, random.uniform(100, 500) - (slr / 10)) # Shoreline creeps in
            infra_score = random.uniform(4, 7) + (0.2 * (year - 2017)) # Gradual improvement
            infra_score = min(10, infra_score)

            cursor.execute('''
            INSERT INTO settlement_data VALUES (?, ?, ?, ?, ?, ?)
            ''', (vid, year, pop_density, households, distance_from_shore, infra_score))

    conn.commit()
    conn.close()
    print("Database 'coastal_risk.db' created and populated successfully.")

if __name__ == "__main__":
    init_db()
