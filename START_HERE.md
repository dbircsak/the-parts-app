# START HERE

Welcome to The Parts App. This document gets you from zero to running in minutes.

## What You Have

A complete, production-ready Next.js application for managing parts and repair orders in an auto body shop.

## What You Need

- Node.js 18+ (https://nodejs.org)
- PostgreSQL 12+ (https://www.postgresql.org)
- A text editor or IDE

## Step 1: Clone the Repository

```bash
cd your-projects-folder
git clone <repository-url>
cd the-parts-app
```

## Step 2: Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and update:
- `DATABASE_URL` - Your PostgreSQL connection string

Example:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/the_parts_app"
```

Generate a secret (run once, paste the result into NEXTAUTH_SECRET):
```bash
openssl rand -base64 32
```

## Step 3: Install & Initialize

```bash
npm install
npm run db:migrate
node scripts/seed.js
```

When prompted during `npm run db:migrate`, create a new migration (type anything, press enter).

## Step 4: Start Development Server

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

## Step 5: Login

Use the seeded admin account:
- **Email:** admin@partsapp.local
- **Password:** admin

## What's Available

After login, you can:
- View repair orders in Production Schedule
- Search for parts
- Check delivery status
- Manage materials inventory
- View vendor contact info
- Upload Vista DMS CSV files (as admin)

## Test with Sample Data

Sample CSV files are in the `samples/` folder.

As admin, go to **Admin > Upload Extracts** and upload:
1. `samples/daily_out_sample.csv`
2. `samples/parts_status_sample.csv`
3. `samples/vendors_sample.csv`

Then check the pages to see the imported data.

## Useful Commands

```bash
npm run dev              # Start development server (default: port 3000)
npm run build           # Build for production
npm start               # Run production build
npm run db:studio       # Open database visual editor
npm run db:migrate      # Run pending migrations
npm run db:push         # Push schema to database (for development)
```

## Important Notes

- **Change the admin password** in production
- **Set NEXTAUTH_SECRET** to a secure random value
- **Use a production PostgreSQL database** for live deployment
- **All data** imported from CSVs is stored in PostgreSQL

## What's Next

1. **Create additional users** - Go to database (via db:studio) or implement user management page
2. **Setup your Vista DMS exports** - Export CSVs with the correct format
3. **Customize** - Change colors, add your branding, modify workflows
4. **Deploy** - Upload to production hosting (Vercel, Railway, Render, etc.)

## Documentation

- **QUICK_START.md** - More detailed 5-minute setup
- **DEVELOPMENT.md** - Full development guide
- **CSV_IMPORT_GUIDE.md** - CSV format specifications
- **PROJECT_STRUCTURE.md** - Code organization
- **IMPLEMENTATION_SUMMARY.md** - What's built and how
- **CHECKLIST.md** - Feature completion

## Features

- User authentication with roles (Admin, Estimator, Technician)
- CSV import from Vista DMS
- Repair order tracking
- Parts inventory management
- Delivery tracking
- Paint queue visibility
- Vendor management
- Material inventory
- Responsive mobile design
- Audit logging (framework)
- Task management (framework)
- Notifications (framework)

## Tech Stack

- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth.js

## File Structure

```
the-parts-app/
├── app/              (Pages and API routes)
├── components/       (React components)
├── lib/              (Utilities and logic)
├── prisma/           (Database schema)
├── samples/          (Test data)
├── scripts/          (Database seeding)
└── docs/             (This documentation)
```

## Troubleshooting

**"Connection refused" error**
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env is correct

**"Prisma error" during migration**
- Run: `npm run prisma:generate`
- Then: `npm run db:migrate` again

**"NextAuth error"**
- Make sure NEXTAUTH_SECRET is set in .env
- Make sure NEXTAUTH_URL is correct

**Can't login**
- Make sure migrations ran successfully
- Make sure `node scripts/seed.js` was executed
- Check the admin account exists in database

## Support

Refer to the documentation files in the project root. Each has detailed information about specific areas.

## Ready?

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

Log in with admin@partsapp.local / admin

You're ready to go!
