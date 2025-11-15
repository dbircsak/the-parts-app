# The Parts App

Parts and repair order workflow management system for auto body shops.

## Requirements

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/the-parts-app.git
cd the-parts-app
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection string and generate a secret:
```
openssl rand -base64 32
```

4. Run Prisma migrations
```bash
npm run db:migrate
```

5. Seed the database with an admin user
```bash
npm run prisma:generate
node scripts/seed.js
```

6. Start the development server
```bash
npm run dev
```

Visit http://localhost:3000

## Default Credentials

After seeding, use these credentials to log in:
- Email: admin@partsapp.local
- Password: admin

Change this password immediately in production.

## Production Build

```bash
npm run build
npm start
```

## Database

The app uses PostgreSQL with Prisma ORM. Schema is defined in `prisma/schema.prisma`.

To push schema changes to database:
```bash
npm run db:push
```

To open Prisma Studio (UI for database):
```bash
npm run db:studio
```

## Features

- Repair order tracking organized by technician
- Parts status visibility and management
- CSV imports from Vista DMS
- Vendor contact management
- Material and paint queue tracking
- Task assignment and tracking
- Delivery management
- Audit trail of changes
- Role-based access control (Admin, Estimator, Technician)

## Pages

- **Production Schedule** - Active repair orders by technician
- **Deliveries** - Expected and received deliveries
- **Parts Search** - Search parts by RO, number, or description
- **Materials** - Consumables inventory
- **Paint List** - Vehicles in paint queue
- **Unordered Parts** - Parts not yet ordered
- **Vendors** - Vendor contact information (public)
- **Admin** - CSV imports and settings

## CSV Import Format

Daily Out CSV columns:
- ro_number, owner, vehicle, vehicle_color, license_plate_number
- parts_received_pct, vehicle_in, current_phase, scheduled_out
- body_technician, estimator

Parts Status CSV columns:
- ro_number, line, part_number, part_description, part_type
- vendor_name, ro_qty, ordered_qty, ordered_date, expected_delivery
- received_qty, invoice_date, returned_qty

Vendors CSV columns:
- vendor_name, primary_phone, fax, address, city, state, zip
- preferred, electronic

## License

Proprietary
