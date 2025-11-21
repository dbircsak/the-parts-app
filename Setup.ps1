# The Parts App - Windows PowerShell Setup Script
# This script sets up The Parts App for development on Windows

param(
    [string]$DatabaseUser = "postgres",
    [string]$DatabaseName = "the_parts_app",
    [string]$DatabasePort = "5432",
    [string]$AppUrl = "http://localhost:3000"
)

# Color output functions
function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Prompt {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

# Check prerequisites
function Check-Prerequisites {
    Write-Prompt "`n=== Checking Prerequisites ==="
    
    # Check Node.js
    Write-Info "Checking Node.js..."
    $nodeVersion = node --version
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Node.js installed: $nodeVersion"
    } else {
        Write-Error-Custom "Node.js 18+ is required but not found"
        Write-Info "Download from: https://nodejs.org/en/download"
        exit 1
    }
    
    # Check npm
    Write-Info "Checking npm..."
    $npmVersion = npm --version
    if ($LASTEXITCODE -eq 0) {
        Write-Success "npm installed: v$npmVersion"
    } else {
        Write-Error-Custom "npm is required but not found"
        exit 1
    }
    
    # Check PostgreSQL
    Write-Info "Checking PostgreSQL..."
    $psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlCmd) {
        Write-Success "PostgreSQL found at: $($psqlCmd.Source)"
    } else {
        Write-Error-Custom "PostgreSQL is required but psql command not found"
        Write-Info "PostgreSQL may not be installed or not added to PATH"
        Write-Info "1. Install from: https://www.postgresql.org/download/windows/"
        Write-Info "2. Add PostgreSQL bin directory to PATH (C:\Program Files\PostgreSQL\15\bin)"
        Write-Info "3. Restart PowerShell and run this script again"
        exit 1
    }
}

# Create and configure database
function Setup-Database {
    Write-Prompt "`n=== Setting Up Database ==="
    
    # Set password for psql to avoid repeated prompts
    $env:PGPASSWORD = $DatabasePassword
    
    # Check if database already exists
    Write-Info "Checking if database '$DatabaseName' exists..."
    $dbExists = psql -U $DatabaseUser -tc "SELECT 1 FROM pg_database WHERE datname = '$DatabaseName'" 2>$null
    
    if ($dbExists) {
        Write-Prompt "Database '$DatabaseName' already exists. Recreate it? (y/n)"
        $deleteDb = Read-Host
        if ($deleteDb -eq "y") {
            Write-Info "Dropping existing database '$DatabaseName'..."
            psql -U $DatabaseUser -c "DROP DATABASE $DatabaseName" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database dropped successfully"
                Write-Info "Creating new database '$DatabaseName'..."
                psql -U $DatabaseUser -c "CREATE DATABASE $DatabaseName" 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Database '$DatabaseName' created successfully"
                } else {
                    Write-Error-Custom "Failed to create database"
                    exit 1
                }
            } else {
                Write-Error-Custom "Failed to drop database"
                exit 1
            }
        } else {
            Write-Success "Using existing database '$DatabaseName'"
        }
    } else {
        Write-Info "Creating database '$DatabaseName'..."
        $createDb = psql -U $DatabaseUser -c "CREATE DATABASE $DatabaseName" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database '$DatabaseName' created successfully"
        } else {
            Write-Error-Custom "Failed to create database"
            Write-Info "Make sure PostgreSQL is running and credentials are correct"
            Write-Info "You can create the database manually if needed"
            exit 1
        }
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Prompt "`n=== Installing Dependencies ==="
    
    Write-Info "Installing npm packages..."
    npm install --verbose
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to install npm packages"
        exit 1
    }
    
    Write-Success "Dependencies installed successfully"
}

# Setup environment variables
function Setup-Environment {
    Write-Prompt "`n=== Setting Up Environment Variables ==="
    
    $envFile = ".env"
    
    if (Test-Path $envFile) {
        Write-Info ".env file already exists"
        Write-Prompt "Overwrite existing .env file? (y/n)"
        $overwrite = Read-Host
        if ($overwrite -ne "y") {
            Write-Info "Using existing .env file"
            return
        }
    }
    
    # Generate NEXTAUTH_SECRET
    Write-Info "Generating NEXTAUTH_SECRET..."
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % { [char]$_ })
    
    $databaseUrl = "postgresql://${DatabaseUser}:${DatabasePassword}@localhost:${DatabasePort}/${DatabaseName}"
    
    Write-Info "Creating .env file..."
    @"
DATABASE_URL="$databaseUrl"
NEXTAUTH_URL="$AppUrl"
NEXTAUTH_SECRET="$secret"
"@ | Out-File -FilePath $envFile -Encoding UTF8
    
    Write-Success ".env file created with:"
    Write-Info "  - DATABASE_URL: $databaseUrl"
    Write-Info "  - NEXTAUTH_URL: $AppUrl"
    Write-Info "  - NEXTAUTH_SECRET: [generated]"
    
    Write-Prompt "`nReview and edit .env if needed for your database configuration"
}

# Setup database schema
function Setup-Database-Schema {
    Write-Prompt "`n=== Setting Up Database Schema ==="
    
    Write-Info "Pushing schema to database..."
    npx prisma db push
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to push schema to database"
        exit 1
    }
    
    Write-Success "Schema pushed successfully"
    
    Write-Info "Generating Prisma client..."
    npx prisma generate
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to generate Prisma client"
        exit 1
    }
    
    Write-Success "Prisma client generated"
}

# Seed initial data
function Seed-Database {
    Write-Prompt "`n=== Seeding Database with Initial Data ==="
    
    Write-Info "Creating admin user and sample data..."
    npm run db:seed
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to seed database"
        Write-Info "You can run 'npm run db:seed' manually later"
    } else {
        Write-Success "Database seeded successfully"
    }
}

# Display next steps
function Show-NextSteps {
    Write-Prompt "`n=== Setup Complete! ==="
    Write-Success "The Parts App is ready to run"
    
    Write-Info "`nNext steps:"
    Write-Host "`n1. Start the development server:"
    Write-Host "   npm run dev`n"
    
    Write-Host "2. Open your browser to:"
    Write-Host "   $AppUrl`n"
    
    Write-Host "3. Login with default credentials:"
    Write-Host "   Email:    admin@partsapp.local"
    Write-Host "   Password: admin`n"
    
    Write-Host "4. Change the admin password immediately in production`n"
}

# Main execution
function Main {
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "   The Parts App - Windows Setup" -ForegroundColor Magenta
    Write-Host "========================================`n" -ForegroundColor Magenta
    
    # Confirm database credentials
    Write-Prompt "Database Configuration:"
    Write-Info "  User: $DatabaseUser"
    Write-Info "  Port: $DatabasePort"
    Write-Info "  Name: $DatabaseName"
    
    # Prompt for password
    Write-Prompt "`nEnter PostgreSQL password for user '$DatabaseUser':"
    $securePassword = Read-Host -AsSecureString
    $DatabasePassword = [System.Net.NetworkCredential]::new("", $securePassword).Password
    
    Write-Prompt "`nContinue with these settings? (y/n)"
    $continue = Read-Host
    if ($continue -ne "y") {
        Write-Info "Setup cancelled"
        exit 0
    }
    
    # Run setup steps
    Check-Prerequisites
    Setup-Database
    Install-Dependencies
    Setup-Environment
    Setup-Database-Schema
    Seed-Database
    Show-NextSteps
    
    Write-Host ""
}

# Run main
Main
