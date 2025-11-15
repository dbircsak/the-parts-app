# Quick Start

The Parts App is ready to run locally in minutes.

## 5-Minute Setup

1. Configure database connection:
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

2. Install and initialize:
```bash
npm install
npm run db:migrate
node scripts/seed.js
npm run dev
```

3. Login at http://localhost:3000:
   - Email: admin@partsapp.local
   - Password: admin

## What's Included

- User authentication with roles (Admin, Estimator, Technician)
- CSV import for Vista DMS data (daily_out, parts_status, vendors)
- Repair order tracking dashboard
- Parts management and search
- Delivery tracking
- Paint queue visibility
- Vendor directory
- Material/consumable inventory
- Audit logging
- Mobile-responsive UI

## Test CSV Files

Sample data is in `samples/` directory for testing imports.

## Pages Available

After login as admin:

- **Production Schedule** - Repair orders organized by technician
- **Deliveries** - Expected and actual delivery tracking
- **Parts Search** - Find parts by RO, number, or description
- **Materials** - Manage consumable items
- **Paint List** - Vehicles in paint stage
- **Unordered Parts** - Parts not yet ordered
- **Vendors** - Contact information
- **Admin > Upload Extracts** - Import CSV files
- **Admin > Edit Materials** - Add/edit material inventory

## Key Features

- **CSV Imports** - Daily data refresh from Vista DMS
- **Real-time Visibility** - See parts status, deliveries, and progress
- **Role-Based Access** - Different views for admin, estimators, technicians
- **Audit Trail** - Track all changes
- **Task Management** - Assign work to technicians (framework in place)
- **Notifications** - Framework for alerts and updates

## Next Steps

1. **Add Users** - Use login page or create via database
2. **Configure Vendors** - Import vendor list CSV
3. **Set Materials** - Add consumable items in Materials page
4. **Migrate Vista Data** - Use Admin > Upload Extracts with your CSVs
5. **Customize Roles** - Add estimators and technician accounts

## Technology Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Auth.js (NextAuth)

## Useful Commands

```bash
npm run dev              # Start development server
npm run db:studio       # Open database UI
npm run db:migrate      # Run pending migrations
npm run build           # Build for production
npm start               # Run production build
```

## Support

See DEVELOPMENT.md for detailed guides and troubleshooting.
