import csv
import random
from datetime import datetime, timedelta
import string
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Seeds for reproducibility
random.seed(42)

# Generate vendors (300)
print("Generating 300 vendors...")
vendors = []
vendor_names = []

vendor_prefixes = ["ACE", "National", "Apex", "Midwest", "Premier", "Elite", "Quality", "Pro", "Advanced", "Superior"]
vendor_suffixes = ["Auto Parts", "Distributors", "Supplies", "Motors", "Components", "Services", "Group", "Solutions", "Hub", "Center"]
vendor_modifiers = ["", "Plus", "Pro", "Max", "Express", "Direct", "Online"]

for i in range(300):
    prefix = random.choice(vendor_prefixes)
    modifier = random.choice(vendor_modifiers)
    suffix = random.choice(vendor_suffixes)
    vendor_name = f"{prefix} {modifier} {suffix}".replace("  ", " ").strip()
    
    # Ensure uniqueness by appending number if needed
    if vendor_name in vendor_names:
        vendor_name = f"{vendor_name} #{i}"
    
    vendor_names.append(vendor_name)
    
    vendors.append({
        'vendor_name': vendor_name,
        'primary_phone': f"555-{random.randint(1000, 9999)}",
        'fax': f"555-{random.randint(1000, 9999)}",
        'address': f"{random.randint(1, 999)} {random.choice(['Main', 'Oak', 'Pine', 'Elm', 'Maple', 'Cedar', 'Birch', 'Ash'])} {random.choice(['Street', 'Avenue', 'Road', 'Drive', 'Lane', 'Boulevard'])}",
        'city': random.choice(['Springfield', 'Chicago', 'Joliet', 'Aurora', 'Naperville', 'Evanston', 'Waukegan', 'Cicero', 'Arlington Heights', 'Rockford']),
        'state': 'IL',
        'zip': f"{random.randint(60000, 62999)}",
        'preferred': 'true' if random.choice([True, False]) else 'false',
        'electronic': 'Electronic' if random.choice([True, False]) else ''
    })

with open(os.path.join(script_dir, 'vendors_sample.csv'), 'w', newline='') as f:
    fieldnames = ['Vendor Name', 'Primary Phone', 'Fax', 'Address', 'City', 'State', 'Zip', 'Preferred', 'Electronic']
    # Rename keys in vendors to match the proper header names
    vendors_renamed = []
    for row in vendors:
        vendors_renamed.append({
            'Vendor Name': row['vendor_name'],
            'Primary Phone': row['primary_phone'],
            'Fax': row['fax'],
            'Address': row['address'],
            'City': row['city'],
            'State': row['state'],
            'Zip': row['zip'],
            'Preferred': row['preferred'],
            'Electronic': row['electronic']
        })
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(vendors_renamed)

print(f"Generated {len(vendors)} vendors")

# Generate daily_out (80)
print("Generating 80 daily out records...")
daily_out = []
phases = ['Body Work', 'Paint', 'Assembly', 'Electrical', 'Final Inspection', 'Waiting for Parts', 'Completed']
vehicle_makes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Nissan', 'Hyundai']
vehicle_models = {
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander'],
    'Ford': ['F-150', 'Escape', 'Fusion', 'Explorer'],
    'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Traverse'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
    'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7'],
    'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas'],
    'Nissan': ['Altima', 'Maxima', 'Rogue', 'Murano'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe']
}
colors = ['Blue', 'Red', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Gold', 'Brown', 'Orange']
first_names = ['John', 'Jane', 'Bob', 'Alice', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Mary']
last_names = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor']
technician_names = ['Mike', 'Tom', 'Chris', 'Rob', 'Steve', 'Joe', 'Kevin', 'Dan']
estimator_names = ['Sarah', 'John', 'Linda', 'Robert', 'Jennifer', 'Michael', 'Patricia', 'David']

for i in range(80):
    ro_num = 1001 + i
    vehicle_in = datetime(2024, 1, 1) + timedelta(days=random.randint(-30, 15))
    
    # Generate test data for three filter categories:
    # First 27 cars: in-shop (scheduled_out in the past)
    # Next 27 cars: pre-order (scheduled_out in the future)
    # Last 26 cars: mixed dates
    today = datetime.now()
    if i < 27:
        # In-shop: scheduled out dates are in the past
        scheduled_out = today - timedelta(days=random.randint(1, 20))
    elif i < 54:
        # Pre-order: scheduled out dates are in the future
        scheduled_out = today + timedelta(days=random.randint(1, 30))
    else:
        # Mixed: some past, some future
        scheduled_out = vehicle_in + timedelta(days=random.randint(2, 10))
    
    make = random.choice(list(vehicle_makes))
    model = random.choice(vehicle_models[make])
    
    parts_pct = random.choice([0, 25, 50, 75, 90]) + random.randint(-5, 5)
    parts_pct = max(0, min(99.9, parts_pct))  # Clamp to 0-99.9 (numeric(5,3) max is 99.999)
    
    daily_out.append({
        'ro_number': ro_num,
        'owner': f"{random.choice(first_names)} {random.choice(last_names)}",
        'vehicle': f"{make} {model}",
        'vehicle_color': random.choice(colors),
        'license_plate_number': ''.join(random.choices(string.ascii_uppercase, k=3)) + str(random.randint(100, 999)),
        'parts_received_pct': str(parts_pct),
        'vehicle_in': vehicle_in.isoformat() + 'Z',
        'current_phase': random.choice(phases),
        'scheduled_out': scheduled_out.isoformat() + 'Z',
        'body_technician': random.choice(technician_names),
        'estimator': random.choice(estimator_names)
    })

with open(os.path.join(script_dir, 'daily_out_sample.csv'), 'w', newline='') as f:
    fieldnames = ['RO Number', 'Owner', 'Vehicle', 'Vehicle Color', 'License Plate Number', 'Parts Received %', 'Vehicle In', 'Current Phase', 'Scheduled Out', 'Body Technician', 'Estimator', '', '']
    # Rename keys in daily_out to match the proper header names
    daily_out_renamed = []
    for row in daily_out:
        daily_out_renamed.append({
            'RO Number': row['ro_number'],
            'Owner': row['owner'],
            'Vehicle': row['vehicle'],
            'Vehicle Color': row['vehicle_color'],
            'License Plate Number': row['license_plate_number'],
            'Parts Received %': row['parts_received_pct'],
            'Vehicle In': row['vehicle_in'],
            'Current Phase': row['current_phase'],
            'Scheduled Out': row['scheduled_out'],
            'Body Technician': row['body_technician'],
            'Estimator': row['estimator'],
            '': '',
            '': ''
        })
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(daily_out_renamed)

print(f"Generated {len(daily_out)} daily out records")

# Generate parts_status (1000)
print("Generating 1000 parts status records...")
parts_status = []
part_types = ['Panel', 'Hardware', 'Assembly', 'Electrical', 'Engine', 'Suspension', 'Interior', 'Exterior', 'Glass', 'Trim']
part_prefixes = ['FD', 'WD', 'BD', 'CP', 'FM', 'DM', 'HD', 'WG', 'TR', 'EL', 'EN', 'SU', 'IN', 'EX']

ro_numbers = [1001 + i for i in range(80)]
parts_per_ro = 1000 // 80  # ~12-13 parts per RO
extra_parts = 1000 % 80

part_counter = 0

for ro_idx, ro_num in enumerate(ro_numbers):
    # Determine how many parts this RO gets
    num_parts = parts_per_ro + (1 if ro_idx < extra_parts else 0)
    
    for line_num in range(1, num_parts + 1):
        order_date = datetime(2024, 1, 1) + timedelta(days=random.randint(-30, 10))
        expected_delivery = order_date + timedelta(days=random.randint(1, 7))
        
        # Realistic ordering scenarios
        rand = random.random()
        if rand < 0.05:  # 5% not ordered yet
            ordered_qty = 0
            ordered_date_val = ""
            expected_delivery_val = ""
            received_qty = 0
            invoice_date_val = ""
        elif rand < 0.15:  # 10% partially received
            ordered_qty = random.randint(1, 5)
            ordered_date_val = order_date.strftime('%Y-%m-%d')
            expected_delivery_val = expected_delivery.strftime('%Y-%m-%d')
            received_qty = random.randint(0, ordered_qty - 1)
            invoice_date_val = (order_date + timedelta(days=random.randint(1, 5))).strftime('%Y-%m-%d') if received_qty > 0 else ""
        else:  # 80% fully or completed
            ordered_qty = random.randint(1, 5)
            ordered_date_val = order_date.strftime('%Y-%m-%d')
            expected_delivery_val = expected_delivery.strftime('%Y-%m-%d')
            received_qty = ordered_qty
            invoice_date_val = (order_date + timedelta(days=random.randint(1, 5))).strftime('%Y-%m-%d')
        
        returned_qty = random.randint(0, 1) if received_qty > 0 else 0
        
        part_num = f"{random.choice(part_prefixes)}-{random.randint(1000, 9999)}"
        part_desc = f"{random.choice(part_types)} #{random.randint(1000, 9999)}"
        
        parts_status.append({
            'ro_number': ro_num,
            'line': line_num,
            'part_number': part_num,
            'part_description': part_desc,
            'part_type': random.choice(part_types),
            'vendor_name': random.choice(vendor_names),
            'ro_qty': ordered_qty if ordered_qty > 0 else random.randint(1, 5),
            'ordered_qty': ordered_qty,
            'ordered_date': ordered_date_val,
            'expected_delivery': expected_delivery_val,
            'received_qty': received_qty,
            'invoice_date': invoice_date_val,
            'returned_qty': returned_qty
        })
        
        part_counter += 1

with open(os.path.join(script_dir, 'parts_status_sample.csv'), 'w', newline='') as f:
    fieldnames = ['RO Number', 'Line', 'Part Number', 'Part Description', 'Part Type', 'Vendor Name', 'RO Qty', 'Ordered Qty', 'Ordered Date', 'Expected Delivery', 'Received Qty', 'Invoice Date', 'Returned Qty', '', '']
    # Rename keys in parts_status to match the proper header names
    parts_status_renamed = []
    for row in parts_status:
        parts_status_renamed.append({
            'RO Number': row['ro_number'],
            'Line': row['line'],
            'Part Number': row['part_number'],
            'Part Description': row['part_description'],
            'Part Type': row['part_type'],
            'Vendor Name': row['vendor_name'],
            'RO Qty': row['ro_qty'],
            'Ordered Qty': row['ordered_qty'],
            'Ordered Date': row['ordered_date'],
            'Expected Delivery': row['expected_delivery'],
            'Received Qty': row['received_qty'],
            'Invoice Date': row['invoice_date'],
            'Returned Qty': row['returned_qty'],
            '': '',
            '': ''
        })
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(parts_status_renamed)

print(f"Generated {len(parts_status)} parts status records")

# Generate materials (extract from daily_out and create material records)
print("Generating materials records...")
materials = []
unit_types = ['piece', 'meter', 'liter', 'kg', 'pack']
part_descriptions = ['Front Bumper', 'Left Door Panel', 'Windshield Trim', 'Rear Bumper', 'Hood Latch', 
                     'Side Mirror', 'Headlight Assembly', 'Door Handle', 'Weatherstripping', 'Wheel Rim',
                     'Antenna', 'Grille', 'Tailgate', 'Quarter Panel', 'Headliner', 'Seat Frame', 'Dashboard Pad',
                     'Window Regulator', 'Brake Caliper', 'Suspension Arm', 'Control Arm', 'CV Joint', 
                     'Door Lock', 'Window Motor', 'Fuel Pump', 'Alternator', 'Radiator', 'Condenser']

material_counter = 0
materials_per_tech = 2  # 2-3 materials per technician

for daily_out_record in daily_out:
    body_tech = daily_out_record['body_technician']
    num_materials = random.randint(materials_per_tech, materials_per_tech + 1)
    
    for mat_idx in range(num_materials):
        ordered_date = datetime(2024, 1, 1) + timedelta(days=random.randint(-20, 5))
        
        # 70% received, 30% not yet received
        if random.random() < 0.7:
            received_date = ordered_date + timedelta(days=random.randint(2, 8))
            received_qty = random.randint(1, 4)
        else:
            received_date = None
            received_qty = 0
        
        materials.append({
            'body_technician': body_tech,
            'part_number': f"BT-{material_counter + 1:03d}",
            'description': random.choice(part_descriptions),
            'ordered_qty': random.randint(1, 5),
            'ordered_date': ordered_date.isoformat() + 'Z',
            'unit_type': random.choice(unit_types),
            'received_qty': received_qty,
            'received_date': received_date.isoformat() + 'Z' if received_date else ''
        })
        material_counter += 1

with open(os.path.join(script_dir, 'materials_sample.csv'), 'w', newline='') as f:
    fieldnames = ['bodyTechnician', 'partNumber', 'description', 'orderedQty', 'orderedDate', 'unitType', 'receivedQty', 'receivedDate']
    # Rename keys in materials to match the proper header names
    materials_renamed = []
    for row in materials:
        materials_renamed.append({
            'bodyTechnician': row['body_technician'],
            'partNumber': row['part_number'],
            'description': row['description'],
            'orderedQty': row['ordered_qty'],
            'orderedDate': row['ordered_date'],
            'unitType': row['unit_type'],
            'receivedQty': row['received_qty'],
            'receivedDate': row['received_date']
        })
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(materials_renamed)

print(f"Generated {len(materials)} materials records")

print("\nAll sample files generated successfully!")
print(f"  - daily_out_sample.csv: 80 rows")
print(f"  - parts_status_sample.csv: 1000 rows")
print(f"  - vendors_sample.csv: 300 rows")
print(f"  - materials_sample.csv: {len(materials)} rows")
print(f"\nAll data is associated through ro_number (1001-1080) and body technician names")
