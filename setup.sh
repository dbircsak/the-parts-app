#!/bin/bash

# The Parts App - Linux/macOS Setup Script
# This script sets up The Parts App for development on Linux/macOS

# Configuration
DATABASE_USER="${1:-postgres}"
DATABASE_NAME="${2:-the_parts_app}"
DATABASE_PORT="${3:-5432}"
APP_URL="${4:-http://localhost:3000}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Output functions
print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_prompt() {
    echo -e "${YELLOW}$1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_prompt "\n=== Checking Prerequisites ==="
    
    # Check Node.js
    print_info "Checking Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js 18+ is required but not found"
        print_info "Install from: https://nodejs.org/en/download"
        exit 1
    fi
    
    # Check npm
    print_info "Checking npm..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: v$NPM_VERSION"
    else
        print_error "npm is required but not found"
        exit 1
    fi
    
    # Check PostgreSQL
    print_info "Checking PostgreSQL..."
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL found: $(psql --version)"
    else
        print_error "PostgreSQL is required but psql command not found"
        print_info "Install PostgreSQL:"
        print_info "  - Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        print_info "  - macOS: brew install postgresql"
        print_info "  - Fedora/RHEL: sudo dnf install postgresql-server postgresql-contrib"
        exit 1
    fi
}

# Create and configure database
setup_database() {
    print_prompt "\n=== Setting Up Database ==="
    
    # Check if database exists
    print_info "Checking if database '$DATABASE_NAME' exists..."
    DB_EXISTS=$(sudo -u $DATABASE_USER psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME'" 2>/dev/null)
    
    if [ ! -z "$DB_EXISTS" ]; then
        print_prompt "Database '$DATABASE_NAME' already exists. Recreate it? (y/n)"
        read -r DELETE_DB
        if [ "$DELETE_DB" = "y" ]; then
            print_info "Dropping existing database '$DATABASE_NAME'..."
            sudo -u $DATABASE_USER dropdb $DATABASE_NAME 2>/dev/null
            if [ $? -eq 0 ]; then
                print_success "Database dropped successfully"
                print_info "Creating new database '$DATABASE_NAME'..."
                sudo -u $DATABASE_USER createdb $DATABASE_NAME
                if [ $? -eq 0 ]; then
                    print_success "Database '$DATABASE_NAME' created successfully"
                else
                    print_error "Failed to create database"
                    exit 1
                fi
            else
                print_error "Failed to drop database"
                exit 1
            fi
        else
            print_success "Using existing database '$DATABASE_NAME'"
        fi
    else
        print_info "Creating database '$DATABASE_NAME'..."
        sudo -u $DATABASE_USER createdb $DATABASE_NAME
        if [ $? -eq 0 ]; then
            print_success "Database '$DATABASE_NAME' created successfully"
        else
            print_error "Failed to create database"
            print_info "Make sure PostgreSQL is running and credentials are correct"
            exit 1
        fi
    fi
}

# Install dependencies
install_dependencies() {
    print_prompt "\n=== Installing Dependencies ==="
    
    print_info "Installing npm packages..."
    npm install
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install npm packages"
        exit 1
    fi
    
    print_success "Dependencies installed successfully"
}

# Setup environment variables
setup_environment() {
    print_prompt "\n=== Setting Up Environment Variables ==="
    
    ENV_FILE=".env"
    
    if [ -f "$ENV_FILE" ]; then
        print_info ".env file already exists"
        print_prompt "Overwrite existing .env file? (y/n)"
        read -r OVERWRITE
        if [ "$OVERWRITE" != "y" ]; then
            print_info "Using existing .env file"
            return
        fi
    fi
    
    # Generate NEXTAUTH_SECRET
    print_info "Generating NEXTAUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)
    
    DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:${DATABASE_PORT}/${DATABASE_NAME}"
    
    print_info "Creating .env file..."
    cat > "$ENV_FILE" << EOF
DATABASE_URL="$DATABASE_URL"
NEXTAUTH_URL="$APP_URL"
NEXTAUTH_SECRET="$SECRET"
EOF
    
    print_success ".env file created with:"
    print_info "  - DATABASE_URL: $DATABASE_URL"
    print_info "  - NEXTAUTH_URL: $APP_URL"
    print_info "  - NEXTAUTH_SECRET: [generated]"
    
    print_prompt "\nReview and edit .env if needed for your database configuration"
}

# Setup database schema
setup_database_schema() {
    print_prompt "\n=== Setting Up Database Schema ==="
    
    print_info "Pushing schema to database..."
    npm run db:push
    
    if [ $? -ne 0 ]; then
        print_error "Failed to push schema to database"
        exit 1
    fi
    
    print_success "Schema pushed successfully"
    
    print_info "Generating Prisma client..."
    npm run prisma:generate
    
    if [ $? -ne 0 ]; then
        print_error "Failed to generate Prisma client"
        exit 1
    fi
    
    print_success "Prisma client generated"
}

# Seed initial data
seed_database() {
    print_prompt "\n=== Seeding Database with Initial Data ==="
    
    print_info "Creating admin user and sample data..."
    npm run db:seed
    
    if [ $? -ne 0 ]; then
        print_error "Failed to seed database"
        print_info "You can run 'npm run db:seed' manually later"
        print_info "This is non-critical - the app will still start, but you won't have the default admin account"
    else
        print_success "Database seeded successfully"
    fi
}

# Display next steps
show_next_steps() {
    print_prompt "\n=== Setup Complete! ==="
    print_success "The Parts App is ready to run"
    
    print_info "\nNext steps:"
    echo ""
    echo "1. Start the development server:"
    echo "   npm run dev"
    echo ""
    echo "2. Open your browser to:"
    echo "   $APP_URL"
    echo ""
    echo "3. Login with default credentials:"
    echo "   Email:    admin@partsapp.local"
    echo "   Password: admin"
    echo ""
    echo "4. Change the admin password immediately in production"
    echo ""
}

# Main execution
main() {
    echo ""
    print_prompt "========================================"
    print_prompt "   The Parts App - Setup"
    print_prompt "========================================"
    echo ""
    
    # Display configuration
    print_prompt "Database Configuration:"
    print_info "  User: $DATABASE_USER"
    print_info "  Port: $DATABASE_PORT"
    print_info "  Name: $DATABASE_NAME"
    
    # Check if running as root (not recommended but need sudo for some postgres operations)
    if [ "$EUID" -eq 0 ]; then
        print_prompt "\nWarning: Running as root. This is not recommended."
        print_prompt "Continue anyway? (y/n)"
        read -r CONTINUE
        if [ "$CONTINUE" != "y" ]; then
            print_info "Setup cancelled"
            exit 0
        fi
    fi
    
    # Check if PostgreSQL service is running
    print_info "Checking if PostgreSQL is running..."
    if ! sudo -u $DATABASE_USER psql -c "\q" 2>/dev/null; then
        print_error "Cannot connect to PostgreSQL"
        print_info "Make sure PostgreSQL is running: sudo systemctl start postgresql"
        print_info "Or on macOS: brew services start postgresql"
        exit 1
    fi
    
    print_prompt "\nContinue with these settings? (y/n)"
    read -r CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        print_info "Setup cancelled"
        exit 0
    fi
    
    # Run setup steps
    check_prerequisites
    setup_database
    install_dependencies
    setup_environment
    setup_database_schema
    seed_database
    show_next_steps
}

# Run main
main
