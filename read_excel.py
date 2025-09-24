import pandas as pd
import openpyxl
from pathlib import Path

def read_excel_file(file_path):
    """
    Read and display information about an Excel file
    """
    try:
        # Load the Excel file
        excel_file = pd.ExcelFile(file_path)

        print(f"Excel file: {file_path}")
        print(f"Sheet names: {excel_file.sheet_names}")
        print("-" * 50)

        # Read and display each sheet
        for sheet_name in excel_file.sheet_names:
            print(f"\nSheet: {sheet_name}")
            df = pd.read_excel(file_path, sheet_name=sheet_name)

            print(f"Shape: {df.shape} (rows, columns)")
            print(f"Columns: {list(df.columns)}")

            # Display first few rows
            print("\nFirst 5 rows:")
            print(df.head())

            # Display basic info
            print("\nData types:")
            print(df.dtypes)

            print("-" * 50)

    except Exception as e:
        print(f"Error reading Excel file: {e}")

def get_sheet_data(file_path, sheet_name=None):
    """
    Get data from a specific sheet or the first sheet
    """
    try:
        if sheet_name:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
        else:
            df = pd.read_excel(file_path)
        return df
    except Exception as e:
        print(f"Error reading sheet: {e}")
        return None

if __name__ == "__main__":
    # Read the test.xlsx file
    file_path = "test.xlsx"

    if Path(file_path).exists():
        read_excel_file(file_path)
    else:
        print(f"File {file_path} not found!")