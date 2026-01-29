import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_endpoint(name, url, method="GET", data=None):
    print(f"Testing {name}: {method} {url}...")
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{url}")
        else:
            response = requests.post(f"{BASE_URL}{url}", json=data)
        
        if response.status_code == 200:
            print(f"✅ {name} Passed")
            # print(json.dumps(response.json(), indent=2)[:200] + "...")
            return response.json()
        else:
            print(f"❌ {name} Failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ {name} Error: {e}")
        return None

def run_tests():
    # 1. Locations
    states = test_endpoint("Get States", "/states")
    if not states: return

    tn = next((s for s in states if s["code"] == "TN"), states[0])
    districts = test_endpoint("Get Districts", f"/districts/{tn['id']}")
    if not districts: return

    district_id = districts[0]["id"]
    villages = test_endpoint("Get Villages", f"/villages/{district_id}")
    if not villages: return

    village = villages[0]
    vid = village["id"]
    print(f"Selected Village: {village['name']} (ID: {vid})")

    # 2. Risk Assessment
    risk = test_endpoint("Get Risk Profile", f"/risk/village/{vid}")
    if risk:
        print(f"  Overall Score: {risk.get('overall_risk_score')}")
        print(f"  Risk Category: {risk.get('risk_category')}")
        if risk.get('overall_risk_score') > 10 and risk.get('overall_risk_score') <= 100:
             print("  ✅ Score is 0-100 scale")
        else:
             print(f"  ⚠️ Check Score Scale: {risk.get('overall_risk_score')}")

    test_endpoint("Get Risk History", f"/risk/village/{vid}/history")

    # 3. Predictions
    preds = test_endpoint("Get Predictions", f"/predictions/village/{vid}")
    if preds:
        print(f"  Forecast Days: {len(preds.get('forecast', []))}")
        print(f"  Economic Impact: {preds.get('economic_impact_score')}")

    # 4. Calculator
    payload = {
        "environmental": {"sea_level_rise": 8, "cyclone_frequency": 5, "storm_surge_height": 6, "erosion_rate": 4, "extreme_rainfall": 2},
        "settlement": {"population_density": 7, "households": 5, "distance_from_shore": 9, "infrastructure_score": 3}
    }
    calc = test_endpoint("Calculate Custom Risk", "/risk/calculate", "POST", payload)
    if calc:
        print(f"  Calculated Score: {calc.get('overall_risk_score')}")

if __name__ == "__main__":
    run_tests()
