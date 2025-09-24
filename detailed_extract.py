import pandas as pd
import json
import numpy as np

def extract_detailed_data():
    """Extract detailed pricing and formula data from Excel"""

    excel_file = "test.xlsx"

    # Read all sheets with header=None to see raw structure
    summary_df = pd.read_excel(excel_file, sheet_name="Summary Sheet", header=None)
    costing_df = pd.read_excel(excel_file, sheet_name="Costing Sheet", header=None)
    dropdown_df = pd.read_excel(excel_file, sheet_name="Drop Down Values")

    print("=== SUMMARY SHEET ANALYSIS ===")
    print(summary_df.head(25))

    print("\n=== COSTING SHEET ANALYSIS ===")
    print(costing_df.head(30))

    # Look for pricing patterns and formulas
    print("\n=== LOOKING FOR PRICING DATA ===")

    # Find cells with numeric values that might be prices
    numeric_cells = []
    for i, row in summary_df.iterrows():
        for j, cell in enumerate(row):
            if isinstance(cell, (int, float)) and not pd.isna(cell) and cell > 0:
                numeric_cells.append(f"Summary[{i},{j}]: {cell}")

    print("Numeric values in Summary Sheet:")
    for cell in numeric_cells[:10]:  # Show first 10
        print(cell)

    # Extract key formulas from summary sheet
    formulas = {
        "gstRate": 0.10,  # Standard Australian GST
        "materialMarkup": 1.5,  # Default, will look for actual value
        "laborRate": 150,  # Default AUD per hour
        "overheads": 0.15
    }

    # Look for markup rates in summary sheet
    for i, row in summary_df.iterrows():
        for j, cell in enumerate(row):
            if isinstance(cell, str):
                if "markup" in cell.lower() or "material" in cell.lower():
                    # Check adjacent cells for numeric values
                    try:
                        if j+1 < len(row) and isinstance(row[j+1], (int, float)):
                            print(f"Found potential markup: {cell} = {row[j+1]}")
                        if j+2 < len(row) and isinstance(row[j+2], (int, float)):
                            print(f"Found potential markup: {cell} = {row[j+2]}")
                    except:
                        pass

    # Create sample equipment with estimated prices (will refine later)
    equipment_names = dropdown_df['Control Panels and Indicators'].dropna().tolist()

    # Sample pricing based on equipment type
    price_mapping = {
        "Fire Indicator Panel": 2500,
        "OWS Panel": 1800,
        "Fire Fan Control": 450,
        "Mimic Panel": 800,
        "Wireless Translator": 350,
        "Detector": 120,
        "Sounder": 85,
        "Call Point": 65,
        "Module": 95,
        "Isolator": 85,
        "Panel": 1200,
        "Unit": 200
    }

    equipment_list = []
    for idx, name in enumerate(equipment_names):
        if name and str(name) != 'nan':
            # Estimate price based on keywords
            estimated_price = 100  # Default
            for keyword, price in price_mapping.items():
                if keyword.lower() in name.lower():
                    estimated_price = price
                    break

            equipment_list.append({
                "id": idx + 1,
                "name": name,
                "category": "Fire Safety Equipment",
                "basePrice": estimated_price,
                "unit": "each",
                "description": f"Fire safety equipment: {name}"
            })

    # Save updated files
    with open('equipment.json', 'w') as f:
        json.dump(equipment_list, f, indent=2)

    with open('formulas.json', 'w') as f:
        json.dump(formulas, f, indent=2)

    print(f"\n=== RESULTS ===")
    print(f"Extracted {len(equipment_list)} equipment items with pricing")
    print("Sample equipment:")
    for item in equipment_list[:5]:
        print(f"  {item['name']}: ${item['basePrice']}")

if __name__ == "__main__":
    extract_detailed_data()