# READ ME FIRST

This is The Parts App - a complete Next.js application for managing parts and repair orders.

## You Have Everything

This project is **complete and ready to run**. All code, documentation, and sample data are included.

## Get Running in 2 Minutes

```bash
npm install
npm run db:migrate
node scripts/seed.js
npm run dev
```

Then open http://localhost:3000 and login with:
- Email: admin@partsapp.local  
- Password: admin

## Documentation

Start with these in order:

1. **START_HERE.md** ← Read this first (5 min)
2. **QUICK_START.md** ← Quick reference (5 min)
3. **README.md** ← Features and setup (10 min)
4. **DEVELOPMENT.md** ← Development guide (when coding)

## What's Included

✓ Complete Next.js 15 application  
✓ PostgreSQL database with Prisma  
✓ User authentication with roles  
✓ CSV import from Vista DMS  
✓ Repair order tracking  
✓ Parts management  
✓ Delivery tracking  
✓ Mobile-responsive design  
✓ Admin panel  
✓ Sample data for testing  

## Key Files

| File | Purpose |
|------|---------|
| `START_HERE.md` | Get running in 5 minutes |
| `QUICK_START.md` | Quick reference |
| `DEVELOPMENT.md` | Full development guide |
| `.env.example` | Environment template |
| `package.json` | Dependencies |
| `prisma/schema.prisma` | Database schema |
| `samples/` | Test CSV files |

## Prerequisites

- Node.js 18+
- PostgreSQL 12+

## Setup (5 Steps)

1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` in `.env`
3. Run `npm install`
4. Run `npm run db:migrate`
5. Run `node scripts/seed.js`

Then `npm run dev` and open http://localhost:3000

## Important Notes

- Change the admin password before production
- Generates NEXTAUTH_SECRET using `openssl rand -base64 32`
- Sample CSV files are in `samples/` for testing
- All data is stored in PostgreSQL
- Mobile-friendly and fully responsive

## What's Next

1. **Read START_HERE.md** - 5-minute setup
2. **Follow QUICK_START.md** - Get the app running
3. **Import sample CSVs** - See admin page
4. **Create more users** - Test different roles
5. **Explore the code** - It's well-organized
6. **Deploy to production** - When ready

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth.js

## All Documentation Files

- `00_READ_ME_FIRST.md` ← You are here
- `START_HERE.md` - Get running
- `QUICK_START.md` - Quick reference  
- `README.md` - Overview
- `DEVELOPMENT.md` - Development guide
- `PROJECT_STRUCTURE.md` - Code organization
- `CSV_IMPORT_GUIDE.md` - CSV format
- `FILES_MANIFEST.md` - File listing
- `IMPLEMENTATION_SUMMARY.md` - What's built
- `CHECKLIST.md` - Feature checklist

## Questions?

Check the documentation. Everything is documented.

## Ready?

```bash
npm install && npm run db:migrate && node scripts/seed.js && npm run dev
```

Open http://localhost:3000

You're ready to go!
