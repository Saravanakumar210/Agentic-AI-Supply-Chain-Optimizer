# 📥 Download Supply Chain Dataset

Your large dataset (10,950 rows) is available for download!

## Download Options

### Option 1: Direct Browser Download ⭐ RECOMMENDED
Open this URL in your browser:
```
http://localhost:3000/api/download_dataset
```
This will download the file as `supply_chain_dataset.csv`

### Option 2: Direct File Access
The dataset is located at:
```
d:\final year project\data\sample_data.csv
```
You can copy this file to any location on your computer.

### Option 3: Command Line Download
```powershell
# From project folder:
Copy-Item "data\sample_data.csv" -Destination ".\supply_chain_dataset.csv"
```

## Dataset Information

**File Details:**
- **Filename**: `sample_data.csv` (or `supply_chain_dataset.csv` when downloaded)
- **Size**: ~459 KB
- **Rows**: 10,950 (including header)
- **Columns**: 8

**Column Structure:**
1. Date - Transaction date (YYYY-MM-DD format)
2. Product_ID - Product identifier (P001-P010)
3. Product_Name - Product category name
4. Demand - Customer demand quantity
5. Inventory_Level - Current inventory
6. Lead_Time_Days - Supplier lead time
7. Unit_Cost - Product cost per unit
8. Unit_Price - Selling price per unit

**Products Included:**
- Television
- Mobile Phone
- Laptop
- Headphones
- Smart Watch
- Tablet
- Gaming Console
- Camera
- Cosmetics
- Home Appliance

**Date Range:**
- Start: 2021-01-01
- End: 2023-12-31
- Duration: 3 years

## How to Use

Simply click the download link or navigate to the API endpoint, and your browser will download the CSV file. You can then:
- Open it in Excel/Google Sheets
- Import it into other analytics tools
- Share it with your team
- Use it for presentations or reports

---

**Quick Download:** [Click here to download](http://localhost:3000/api/download_dataset)
(Note: Server must be running at localhost:3000)
