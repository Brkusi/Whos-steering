"""Refresh the storefront's year/model lookup from NHTSA vPIC.

Run from the repository root: python3 scripts/refresh_vehicle_models.py
Source: https://vpic.nhtsa.dot.gov/api/ (GetModelsForMakeYear)
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
import json
from pathlib import Path
import re
import time
from urllib.parse import quote
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "whos-steering/frontend/src/lib/vehicleModels.json"
BASE = "https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear"
SPECS = {
    "BMW": ("BMW", 2010, 2025),
    "AUDI": ("AUDI", 2011, 2025),
    "MERCEDES": ("MERCEDES-BENZ", 2010, 2025),
    "TOYOTA": ("TOYOTA", 2020, date.today().year),
}
TYPES = ("passenger car", "Multipurpose Passenger Vehicle (MPV)")


def natural_key(value):
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", value)]


def fetch_models(make, year, vehicle_type):
    url = (
        f"{BASE}/make/{quote(make)}/modelyear/{year}"
        f"/vehicletype/{quote(vehicle_type)}?format=json"
    )
    for attempt in range(3):
        try:
            with urlopen(url, timeout=30) as response:
                payload = json.load(response)
            if not isinstance(payload.get("Results"), list):
                raise ValueError(f"Unexpected vPIC response: {url}")
            return {row["Model_Name"].strip() for row in payload["Results"]
                    if row.get("Make_Name", "").upper() == make
                    and isinstance(row.get("Model_Name"), str)
                    and row["Model_Name"].strip()}
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def main():
    jobs = {}
    by_make = {key: {} for key in SPECS}
    with ThreadPoolExecutor(max_workers=6) as pool:
        for key, (make, first, last) in SPECS.items():
            for year in range(first, last + 1):
                for vehicle_type in TYPES:
                    jobs[pool.submit(fetch_models, make, year, vehicle_type)] = (key, year)
        for future in as_completed(jobs):
            key, year = jobs[future]
            by_make[key].setdefault(year, set()).update(future.result())

    result = {
        "source": "https://vpic.nhtsa.dot.gov/api/",
        "retrievedOn": date.today().isoformat(),
        "makes": {},
    }
    for key, (_, first, last) in SPECS.items():
        years = by_make[key]
        for year in range(first, last + 1):
            if not years.get(year):
                raise ValueError(f"No {key} passenger-vehicle models for {year}")
        result["makes"][key] = {
            "firstYear": first,
            "lastYear": last,
            "modelsByYear": {str(year): sorted(years[year], key=natural_key)
                             for year in range(first, last + 1)},
        }
    OUTPUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    for key, data in result["makes"].items():
        print(f"{key}: {data['firstYear']}-{data['lastYear']}, "
              f"{sum(map(len, data['modelsByYear'].values()))} year/model pairs")


if __name__ == "__main__":
    main()
