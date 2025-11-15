# Project Structure

The Parts App is organized as a standard Next.js App Router project.

## Directory Layout

```
the-parts-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts          # Auth.js API route
│   │   ├── parts/search/route.ts                # Parts search API
│   │   └── admin/
│   │       ├── upload-extracts/route.ts         # CSV import API
│   │       └── materials/
│   │           ├── route.ts                      # Create material
│   │           └── [id]/route.ts                 # Update/delete material
│   ├── admin/
│   │   ├── layout.tsx                            # Admin layout with nav
│   │   ├── page.tsx                              # Admin dashboard
│   │   ├── upload-extracts/page.tsx              # CSV upload UI
│   │   └── edit-materials/
│   │       ├── page.tsx                          # Materials list
│   │       └── [id]/page.tsx                     # Material form
│   ├── login/page.tsx                            # Login page
│   ├── vendors/page.tsx                          # Vendors (public)
│   ├── production-schedule/page.tsx              # Repair orders by tech
│   ├── deliveries/page.tsx                       # Delivery tracking
│   ├── parts-search/page.tsx                     # Parts search UI
│   ├── materials/page.tsx                        # Materials inventory
│   ├── paint-list/page.tsx                       # Paint queue
│   ├── unordered-parts/page.tsx                  # Parts not ordered
│   ├── layout.tsx                                # Root layout
│   ├── page.tsx                                  # Home page
│   └── globals.css                               # Global Tailwind styles
├── components/
│   ├── navbar.tsx                                # Navigation menu
│   └── parts-search-client.tsx                   # Search form component
├── lib/
│   ├── prisma.ts                                 # Prisma client singleton
│   ├── auth.ts                                   # Password hashing
│   ├── middleware.ts                             # Auth middleware helpers
│   └── csv-parser.ts                             # CSV parsing utilities
├── prisma/
│   ├── schema.prisma                             # Database schema
│   └── migrations/                               # Prisma migrations
├── scripts/
│   └── seed.js                                   # Database seeding
├── auth.config.ts                                # Auth.js config (credentials)
├── auth.ts                                       # Auth.js main setup
├── middleware.ts                                 # Next.js middleware (auth)
├── next.config.js                                # Next.js config
├── tsconfig.json                                 # TypeScript config
├── tailwind.config.ts                            # Tailwind config
├── postcss.config.js                             # PostCSS config
├── package.json                                  # Dependencies
├── .env.example                                  # Env template
├── .gitignore                                    # Git ignore rules
├── .eslintrc.json                                # ESLint config
├── README.md                                     # Setup guide
└── PROJECT_STRUCTURE.md                          # This file

```

## Data Flow

1. CSV imports from Vista DMS via /admin/upload-extracts
2. Data stored in PostgreSQL via Prisma
3. Pages query database and render data
4. Client components (search, forms) call API routes
5. API routes enforce authentication/authorization

## Key Files

- **prisma/schema.prisma** - All database models and relationships
- **auth.ts** - Authentication configuration with JWT sessions
- **middleware.ts** - Route protection and redirect logic
- **app/api/admin/upload-extracts/route.ts** - CSV import logic

## Models

- User (email/password auth, roles)
- DailyOut (repair orders from Vista)
- PartsStatus (parts inventory from Vista)
- Vendor (vendor contact info)
- Material (consumable items)
- Task (technician tasks)
- Delivery (expected/actual deliveries)
- AuditEvent (change audit trail)
- Notification (in-app notifications)

## Adding New Pages

1. Create page in app/[feature]/page.tsx
2. Add to Navbar component if needed
3. Protect with auth in middleware or page component
4. Create API route if page needs POST/PATCH/DELETE

## Environment Variables

```
DATABASE_URL              # PostgreSQL connection string
NEXTAUTH_URL              # Full URL of app (http://localhost:3000 in dev)
NEXTAUTH_SECRET           # Base64-encoded 32-byte key for signing
```

Generate secret:
```bash
openssl rand -base64 32
```

## Running Locally

```bash
npm install
npm run db:migrate                  # Run migrations
node scripts/seed.js               # Create admin user
npm run dev                        # Start dev server
```

Visit http://localhost:3000 with:
- Email: admin@partsapp.local
- Password: admin
