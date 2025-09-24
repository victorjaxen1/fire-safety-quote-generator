import pandas as pd
import json
import re
from pathlib import Path

def extract_equipment_data():
    """Extract equipment data from the Excel file and convert to JSON"""

    # Read the Excel file
    excel_file = "test.xlsx"

    # Extract Drop Down Values (Equipment Categories)
    dropdown_df = pd.read_excel(excel_file, sheet_name="Drop Down Values")
    equipment_list = []

    # Clean up the equipment names and create basic structure
    for idx, row in dropdown_df.iterrows():
        equipment_name = str(row['Control Panels and Indicators']).strip()
        if equipment_name and equipment_name != 'nan':
            equipment_list.append({
                "id": idx + 1,
                "name": equipment_name,
                "category": "Fire Safety Equipment",
                "basePrice": 0,  # Will be populated from costing sheet
                "unit": "each"
            })

    # Extract costing data
    costing_df = pd.read_excel(excel_file, sheet_name="Costing Sheet")
    print("Costing Sheet Structure:")
    print(costing_df.head(20))
    print("\nColumns:", costing_df.columns.tolist())

    # Extract summary data to understand formulas
    summary_df = pd.read_excel(excel_file, sheet_name="Summary Sheet")
    print("\nSummary Sheet Structure:")
    print(summary_df.head(20))
    print("\nColumns:", summary_df.columns.tolist())

    # Create equipment categories
    categories = [
        {
            "id": 1,
            "name": "Fire Safety Equipment",
            "description": "Fire detection and safety equipment"
        }
    ]

    # Create formulas structure (Australian standards)
    formulas = {
        "gstRate": 0.10,  # 10% GST in Australia
        "materialMarkup": 1.5,  # Will extract from Excel
        "laborRate": 150,  # Will extract from Excel
        "overheads": 0.15  # 15% overheads
    }

    # Save to JSON files
    with open('equipment.json', 'w') as f:
        json.dump(equipment_list, f, indent=2)

    with open('categories.json', 'w') as f:
        json.dump(categories, f, indent=2)

    with open('formulas.json', 'w') as f:
        json.dump(formulas, f, indent=2)

    print(f"\nExtracted {len(equipment_list)} equipment items")
    print("Created equipment.json, categories.json, and formulas.json")

if __name__ == "__main__":
    extract_equipment_data()