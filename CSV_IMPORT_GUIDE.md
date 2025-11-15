# CSV Import Guide

The Parts App imports daily data from Vista DMS through the Admin > Upload Extracts page.

## CSV File Requirements

Each CSV must be properly formatted with correct headers and data types.

### 1. Daily Out CSV

**Columns (required unless noted):**
- `ro_number` (integer) - Primary key, unique repair order number
- `owner` (text) - Customer name
- `vehicle` (text) - Vehicle description
- `vehicle_color` (text) - Vehicle color
- `license_plate_number` (text) - License plate
- `parts_received_pct` (decimal) - Percentage of parts received (0-100)
- `vehicle_in` (date/datetime) - When vehicle arrived
- `current_phase` (text) - Current repair phase (e.g., "Body", "Paint", "Assembly")
- `scheduled_out` (date/datetime, optional) - Expected completion date
- `body_technician` (text) - Assigned technician
- `estimator` (text) - Assigned estimator

**Example:**
```csv
ro_number,owner,vehicle,vehicle_color,license_plate_number,parts_received_pct,vehicle_in,current_phase,scheduled_out,body_technician,estimator
1001,John Smith,Honda Civic,Blue,ABC123,75.5,2024-01-15T08:00:00,Paint,2024-01-18,Mike Johnson,Sarah Davis
```

### 2. Parts Status CSV

**Columns (required unless noted):**
- `ro_number` (integer) - Repair order number
- `line` (integer) - Line item number
- `part_number` (text) - Part SKU
- `part_description` (text) - Part name/description
- `part_type` (text) - Category (e.g., "Panel", "Hardware", "Assembly")
- `vendor_name` (text) - Vendor name (should match vendors table)
- `ro_qty` (integer) - Quantity needed for repair
- `ordered_qty` (integer) - Quantity ordered (0 if not yet ordered)
- `ordered_date` (date, optional) - When part was ordered
- `expected_delivery` (date, optional) - Expected delivery date
- `received_qty` (integer) - Quantity received so far
- `invoice_date` (date, optional) - When invoice received
- `returned_qty` (integer) - Quantity returned

**Example:**
```csv
ro_number,line,part_number,part_description,part_type,vendor_name,ro_qty,ordered_qty,ordered_date,expected_delivery,received_qty,invoice_date,returned_qty
1001,1,FD-2341,Door Panel,Panel,ACE Auto Parts,2,2,2024-01-14,2024-01-16,2,2024-01-16,0
```

### 3. Vendors CSV

**Columns (required unless noted):**
- `vendor_name` (text) - Vendor name (primary key, unique)
- `primary_phone` (text) - Main phone number
- `fax` (text) - Fax number
- `address` (text) - Street address
- `city` (text) - City
- `state` (char) - Two-letter state code (e.g., "IL", "TX")
- `zip` (text) - ZIP code
- `preferred` (boolean) - Preferred vendor flag (true/false or 1/0)
- `electronic` (boolean) - Has electronic ordering (true/false or 1/0)

**Example:**
```csv
vendor_name,primary_phone,fax,address,city,state,zip,preferred,electronic
ACE Auto Parts,555-0101,555-0102,123 Main Street,Springfield,IL,62701,true,true
```

## Date and Time Formats

- **Full datetime:** `2024-01-15T08:00:00` (ISO 8601)
- **Date only:** `2024-01-15` (interpreted as midnight)
- **Empty/null:** Leave field empty or use blank string

## Boolean Formats

- **True:** "true", "1", "yes" (case-insensitive)
- **False:** "false", "0", "no" (case-insensitive)
- **Empty:** Treated as false

## Number Formats

- **Integers:** `123`, `-5` (no decimals)
- **Decimals:** `75.5`, `99.99` (with decimal point)
- **Empty:** Leave blank for optional fields

## Import Process

1. Login as admin (admin@partsapp.local)
2. Navigate to Admin > Upload Extracts
3. Select all three CSV files
4. Click "Upload Files"
5. Review import results
6. Check data in respective pages

## Import Behavior

- **Daily Out:** Table is truncated and reloaded (all previous records replaced)
- **Parts Status:** Table is truncated and reloaded
- **Vendors:** Table is truncated and reloaded
- Foreign keys not enforced (allows orphaned records temporarily)
- Import is atomic - all or nothing per file
- Errors are logged but import continues for valid rows

## Error Handling

Import summary shows:
- Number of rows imported
- Number of errors encountered
- Errors don't stop the import; invalid rows are skipped

Common errors:
- Invalid ro_number (non-integer or missing)
- Unparseable dates (wrong format)
- Invalid state code (more than 2 characters)
- Missing required columns in header

## Validation Rules

- `ro_number` must be a positive integer
- `line` must be a positive integer
- `parts_received_pct` must be 0-100 (or null)
- `state` must be exactly 2 characters
- All date fields must parse correctly
- Vendor names must exist when referenced (not enforced, but advisable)

## Daily Workflow

1. Export Vista DMS data to three CSV files
2. Review files for format compliance
3. Upload via Admin > Upload Extracts (replaces previous day's data)
4. Verify imports in respective pages
5. Data is now available across the app

## Sample Files

Example CSVs are provided in `samples/` directory for testing before production use.

## Troubleshooting

**"CSV parsing failed"**
- Check CSV format is valid (commas, not tabs)
- Verify all headers are present
- Look for special characters in data

**"0 rows imported, X errors"**
- Check required field values
- Verify date format (ISO 8601)
- Ensure numeric fields contain numbers

**"Unordered Parts showing wrong data"**
- Verify `ordered_qty` values in Parts Status
- Check that `ro_qty` > 0

**Missing vendors after import**
- Vendor names must match exactly (case-sensitive)
- Re-import Vendors CSV first

## API Details

CSV imports are handled via `/api/admin/upload-extracts` POST endpoint:
- Requires admin role
- Accepts multipart/form-data with files named: daily_out, parts_status, vendors
- Returns JSON with import stats
- Each file is optional but recommended
