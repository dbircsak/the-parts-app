# Development Guide

## Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### 2. Database Setup

Create a PostgreSQL database:
```bash
createdb the_parts_app
```

### 3. Clone and Install
```bash
git clone <repo-url>
cd the-parts-app
npm install
```

### 4. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials and generate a secret:
```
DATABASE_URL="postgresql://user:password@localhost:5432/the_parts_app"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
```

### 5. Database Migrations
```bash
npm run db:migrate
```

When promted, create a new migration name like "init" for first run.

### 6. Seed Initial Data
```bash
node scripts/seed.js
```

This creates admin@partsapp.local with password "admin".

### 7. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Database Tools

Prisma Studio (visual database editor):
```bash
npm run db:studio
```

Reset database (careful - deletes all data):
```bash
npm run db:push -- --force-reset
```

## Project Architecture

### Authentication
- Credentials provider (email/password)
- JWT sessions
- Role-based access control (ADMIN, ESTIMATOR, TECHNICIAN)
- Middleware-based route protection

### Database
- PostgreSQL with Prisma ORM
- Models in prisma/schema.prisma
- Migrations in prisma/migrations/

### API Routes
- /api/auth/* - NextAuth.js handlers
- /api/parts/search - Parts search
- /api/admin/upload-extracts - CSV import
- /api/admin/materials/* - Material CRUD

### Pages
- Public: /login, /vendors
- Protected: All others
- Admin-only: /admin, /admin/upload-extracts, /admin/edit-materials
- Accessible to all authenticated users: Production Schedule, Deliveries, etc.

## Code Standards

- Use TypeScript for type safety
- Short, practical comments only
- No extended ASCII characters
- Server components by default
- Client components (marked "use client") for interactivity
- Tailwind CSS for styling
- RESTful API routes

## CSV Import Format

Daily Out:
```
ro_number,owner,vehicle,vehicle_color,license_plate_number,parts_received_pct,vehicle_in,current_phase,scheduled_out,body_technician,estimator
```

Parts Status:
```
ro_number,line,part_number,part_description,part_type,vendor_name,ro_qty,ordered_qty,ordered_date,expected_delivery,received_qty,invoice_date,returned_qty
```

Vendors:
```
vendor_name,primary_phone,fax,address,city,state,zip,preferred,electronic
```

Date format: ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
Boolean format: "true"/"false" or "1"/"0"

## Adding Features

### New Page
1. Create file in app/[feature]/page.tsx
2. Add auth check if needed
3. Update Navbar component if user-facing
4. Protect in middleware.ts if needed

### New API Route
1. Create app/api/[route]/route.ts
2. Check auth and permissions
3. Return appropriate status codes
4. Log audit events if modifying data

### New Database Model
1. Add to prisma/schema.prisma
2. Run `npm run db:migrate`
3. Name migration descriptively
4. Update seed.js if needed

## Testing CSV Imports

Sample CSV files for testing:
- Ensure proper date format (YYYY-MM-DD)
- Include required columns
- Test with missing optional fields
- Verify error handling in upload UI

## Production Deployment

Build:
```bash
npm run build
```

Start:
```bash
npm start
```

Environment variables must be set in production:
- DATABASE_URL
- NEXTAUTH_URL (must match deployment domain)
- NEXTAUTH_SECRET

## Troubleshooting

### "Auth error: Invalid credentials provider"
Check auth.config.ts and auth.ts are properly set up.

### "Prisma engine binary not found"
Run: `npm run prisma:generate`

### "Connection refused" (database)
Verify PostgreSQL is running and DATABASE_URL is correct.

### "NextAuth secret not configured"
Set NEXTAUTH_SECRET in .env

## Common Tasks

Create new user:
```javascript
// In prisma studio or script
const { hashPassword } = require("./lib/auth");
const password = await hashPassword("initial_password");
await prisma.user.create({
  data: {
    email: "user@example.com",
    password,
    name: "User Name",
    role: "TECHNICIAN"
  }
});
```

Export data:
```bash
npm run db:studio
# Use Studio to export or use:
psql the_parts_app -c "\copy (SELECT * FROM daily_out) TO output.csv WITH CSV HEADER"
```

## Performance Notes

- Parts search is limited to 100 results
- Deliveries and production schedule queries may need indexing on large datasets
- Add database indices on frequently searched fields (ro_number, part_number)
- CSV imports truncate and reload tables - suitable for daily batch operations
