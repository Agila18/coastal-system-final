import sqlite3

def verify_db():
    conn = sqlite3.connect('coastal_risk.db')
    cursor = conn.cursor()

    print("--- Database Verification ---")
    
    # Check Villages
    cursor.execute('SELECT COUNT(*) FROM villages')
    village_count = cursor.fetchone()[0]
    print(f"Total Villages: {village_count} (Expected: 16)")

    # Check Environmental Data
    cursor.execute('SELECT COUNT(*) FROM environmental_data')
    env_count = cursor.fetchone()[0]
    print(f"Total Environmental Records: {env_count} (Expected: 16 * 10 = 160)")

    # Check Settlement Data
    cursor.execute('SELECT COUNT(*) FROM settlement_data')
    sett_count = cursor.fetchone()[0]
    print(f"Total Settlement Records: {sett_count} (Expected: 16 * 10 = 160)")

    # Check for 2026 data
    cursor.execute('SELECT COUNT(*) FROM environmental_data WHERE year = 2026')
    year_2026_count = cursor.fetchone()[0]
    print(f"Records for 2026: {year_2026_count} (Expected: 16)")

    # Sample Records for Nagapattinam (Request requirement)
    print("\n--- Sample Records for Nagapattinam District ---")
    cursor.execute('''
    SELECT v.name, e.year, e.sea_level_rise, e.cyclone_frequency, s.population_density
    FROM villages v
    JOIN environmental_data e ON v.id = e.village_id
    JOIN settlement_data s ON v.id = s.village_id AND e.year = s.year
    WHERE v.district = 'Nagapattinam' AND e.year IN (2017, 2026)
    LIMIT 10
    ''')
    
    rows = cursor.fetchall()
    print(f"{'Village':<15} | {'Year':<4} | {'SLR(mm)':<7} | {'Cyclone':<7} | {'Pop Density':<12}")
    print("-" * 65)
    for row in rows:
        print(f"{row[0]:<15} | {row[1]:<4} | {row[2]:<7.2f} | {row[3]:<7} | {row[4]:<12.2f}")

    conn.close()

if __name__ == "__main__":
    verify_db()
