# Files Manifest - The Parts App

Complete list of all files in the project with descriptions.

## Configuration Files (Root)

| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.js` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration (Tailwind) |
| `.eslintrc.json` | ESLint linting configuration |
| `.env.example` | Environment variables template |
| `.gitignore` | Git ignore rules |

## Authentication & Core Logic

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth.js setup with JWT callbacks |
| `auth.config.ts` | Credentials provider configuration |
| `middleware.ts` | Route protection middleware |
| `lib/auth.ts` | Password hashing/verification (PBKDF2) |
| `lib/prisma.ts` | Prisma client singleton |
| `lib/middleware.ts` | Auth helper functions |
| `lib/csv-parser.ts` | CSV parsing utilities |
| `lib/audit.ts` | Audit event logging |
| `lib/notifications.ts` | Notification creation |

## Pages & Routes

### Root Layout & Home
| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with navbar |
| `app/page.tsx` | Home page (requires login) |
| `app/globals.css` | Global Tailwind styles |

### Authentication
| File | Purpose |
|------|---------|
| `app/login/page.tsx` | Login page (public) |

### Public Pages
| File | Purpose |
|------|---------|
| `app/vendors/page.tsx` | Vendor directory (public) |

### Protected Pages
| File | Purpose |
|------|---------|
| `app/production-schedule/page.tsx` | Repair orders by technician |
| `app/deliveries/page.tsx` | Delivery tracking |
| `app/parts-search/page.tsx` | Parts search page |
| `app/materials/page.tsx` | Material inventory |
| `app/paint-list/page.tsx` | Paint queue |
| `app/unordered-parts/page.tsx` | Parts not yet ordered |

### Admin Pages
| File | Purpose |
|------|---------|
| `app/admin/layout.tsx` | Admin layout with submenu |
| `app/admin/page.tsx` | Admin dashboard |
| `app/admin/upload-extracts/page.tsx` | CSV import UI |
| `app/admin/edit-materials/page.tsx` | Material list |
| `app/admin/edit-materials/[id]/page.tsx` | Material form (create/edit) |

### API Routes
| File | Purpose |
|------|---------|
| `app/api/auth/[...nextauth]/route.ts` | NextAuth.js handlers |
| `app/api/parts/search/route.ts` | Parts search endpoint |
| `app/api/admin/upload-extracts/route.ts` | CSV import handler |
| `app/api/admin/materials/route.ts` | Create material endpoint |
| `app/api/admin/materials/[id]/route.ts` | Update/delete material endpoint |

## Components

| File | Purpose |
|------|---------|
| `components/navbar.tsx` | Navigation menu with role-based items |
| `components/parts-search-client.tsx` | Search form component |

## Database

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Complete Prisma schema (14 models) |
| `prisma/migrations/` | Migration files directory |
| `scripts/seed.js` | Database seeding script |

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Setup guide and feature overview |
| `QUICK_START.md` | 5-minute quick start guide |
| `DEVELOPMENT.md` | Full development guide |
| `PROJECT_STRUCTURE.md` | Project layout and organization |
| `CSV_IMPORT_GUIDE.md` | CSV format specifications |
| `IMPLEMENTATION_SUMMARY.md` | Complete implementation overview |
| `CHECKLIST.md` | Feature completion checklist |
| `FILES_MANIFEST.md` | This file |

## Sample Data

| File | Purpose |
|------|---------|
| `samples/daily_out_sample.csv` | Sample repair order data |
| `samples/parts_status_sample.csv` | Sample parts inventory data |
| `samples/vendors_sample.csv` | Sample vendor data |

## Database Models

The `prisma/schema.prisma` file contains 14 models:

1. **User** - Authentication and roles
2. **Account** - OAuth/provider accounts (Auth.js)
3. **Session** - User sessions (Auth.js)
4. **VerificationToken** - Email verification (Auth.js)
5. **DailyOut** - Repair orders from Vista
6. **PartsStatus** - Parts inventory from Vista
7. **Vendor** - Vendor information
8. **Material** - Consumable items
9. **Task** - Technician task assignments
10. **Delivery** - Delivery tracking
11. **AuditEvent** - Change audit trail
12. **Notification** - In-app notifications
13. **Role** (enum) - ADMIN, ESTIMATOR, TECHNICIAN
14. **TaskStatus** (enum) - PENDING, IN_PROGRESS, COMPLETED
15. **DeliveryStatus** (enum) - PENDING, ARRIVED, LATE
16. **NotificationType** (enum) - 7 notification types

## File Counts

- **Total Files:** 35+
- **TypeScript/TSX Files:** 15
- **Configuration Files:** 8
- **Documentation Files:** 8
- **Sample Data Files:** 3
- **Support Files:** 3

## Directory Structure Summary

```
the-parts-app/
├── app/                          (13 pages + 5 API routes)
├── components/                   (2 React components)
├── lib/                          (7 utility modules)
├── prisma/                       (Schema + migrations)
├── scripts/                      (Database seeding)
├── samples/                      (Test CSV data)
├── Root configs                  (8 files)
└── Documentation                 (8 comprehensive guides)
```

## Key Files to Understand First

1. **Start Here:**
   - `QUICK_START.md` - Get running in 5 minutes
   - `IMPLEMENTATION_SUMMARY.md` - What's built

2. **Configuration:**
   - `prisma/schema.prisma` - Database design
   - `auth.ts` and `auth.config.ts` - Authentication
   - `middleware.ts` - Route protection

3. **Key Pages:**
   - `app/layout.tsx` - Root layout with navbar
   - `app/admin/upload-extracts/page.tsx` - CSV import
   - `app/production-schedule/page.tsx` - Main dashboard

4. **API:**
   - `app/api/admin/upload-extracts/route.ts` - CSV processing
   - `app/api/parts/search/route.ts` - Search endpoint

5. **Utilities:**
   - `lib/csv-parser.ts` - CSV parsing functions
   - `lib/auth.ts` - Password hashing

## Setup Checklist

Before running for the first time:
- [ ] Read QUICK_START.md
- [ ] Copy .env.example to .env
- [ ] Update DATABASE_URL in .env
- [ ] Run `npm install`
- [ ] Run `npm run db:migrate`
- [ ] Run `node scripts/seed.js`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000

## Notes

- All files use TypeScript for type safety
- No extended ASCII characters anywhere
- Comments are short and practical
- Server components by default (performance)
- Client components only where needed
- Responsive design throughout
- Production-ready code quality

## License

Proprietary - for sale to client
