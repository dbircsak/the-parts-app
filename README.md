# The Parts App

A comprehensive parts and repair order workflow management system designed for automotive repair shops. Streamline your operations with production scheduling, parts tracking, vendor management, and delivery coordination.

## Features

- **Production Schedule** - View repair orders grouped by estimators or technicians with real-time parts status
- **Parts Search** - Quickly find parts across all repair orders with advanced filtering
- **Unordered Parts** - Identify and track parts that haven't been ordered yet
- **Deliveries** - Monitor incoming parts deliveries and track expected vs. actual dates
- **Materials** - Manage body technician material orders and receipts
- **Paint List** - Organize and manage paint work queue
- **Vendor Management** - Maintain vendor information, contact details, and preferred vendor tracking
- **Admin Panel** - User management, data imports, and debugging tools
- **User Profiles** - Secure profile settings with password management
- **Authentication** - Secure login system with role-based access control (Admin, Estimator, Technician)

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js with Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js 5
- **UI Components**: Lucide React icons
- **Email**: Resend
- **Drag & Drop**: dnd-kit

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 12+

#### Linux: Install Prerequisites

```bash
sudo apt update
sudo apt install nodejs npm postgresql
```

### Setup

#### Linux/macOS: Set PostgreSQL password (required before running setup script)

If you haven't already set a password for the default PostgreSQL `postgres` user, run:

```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'your_password';"
```

#### Windows/All Platforms: Automated Setup

The easiest way to set up the app is to use the provided setup script:

**Windows:**
```powershell
.\Setup.ps1
```

**Linux/macOS:**
```bash
./setup.sh
```

The script will:
- Check prerequisites (Node.js, npm, PostgreSQL)
- Create the database
- Install dependencies
- Generate environment variables
- Set up the database schema
- Seed initial data

---

#### Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dbircsak/the-parts-app.git
   cd the-parts-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_URL` - Application URL (default: http://localhost:3000)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `RESEND_API_KEY` - Your Resend API key (optional for email features)

4. **Setup database**
   ```bash
   npm run db:push
   ```

5. **Seed initial data**
   ```bash
   npm run db:seed
   ```
   
   Default admin credentials:
   - Email: `admin@partsapp.local`
   - Password: `admin`

## Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Sync schema with database
- `npm run db:migrate` - Create and run migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio
- `npm run prisma:generate` - Generate Prisma client

## Database Schema

The app uses Prisma with PostgreSQL. Key models include:

- **User** - Authentication and role management
- **DailyOut** - Repair orders
- **PartsStatus** - Part tracking and status
- **WorkQueue** - Work queue management
- **Vendor** - Vendor information
- **Material** - Technician material orders
- **Delivery** - Parts delivery tracking
- **Task** - Work tasks
- **Notification** - User notifications

See `prisma/schema.prisma` for complete schema.

## Authentication & Authorization

The app uses NextAuth.js with three role levels:

- **ADMIN** - Full access to admin features, user management
- **ESTIMATOR** - Can create/edit repair orders, manage parts
- **TECHNICIAN** - View assigned work, update materials

The application provides read-only access for guest users. Authentication is required only for write operations and administrative functions.

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure `npm run build` succeeds
4. Submit a pull request

## License

Built and designed by Anthony Duque.

## Support

For issues, feature requests, or questions, please open an issue on GitHub.
