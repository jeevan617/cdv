#!/bin/bash

# Health Prediction Backend Setup Script
# This script automates the setup process

set -e  # Exit on error

echo "🏥 Health Prediction Backend Setup"
echo "=================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo "📦 Installing PostgreSQL..."
    brew install postgresql@14
    brew services start postgresql@14
    echo "✅ PostgreSQL installed and started"
else
    echo "✅ PostgreSQL is already installed"
fi

# Create database
echo ""
echo "📊 Creating database..."
if psql -lqt | cut -d \| -f 1 | grep -qw health_prediction; then
    echo "⚠️  Database 'health_prediction' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb health_prediction
        createdb health_prediction
        echo "✅ Database recreated"
    fi
else
    createdb health_prediction
    echo "✅ Database created"
fi

# Initialize database schema
echo ""
echo "🗄️  Initializing database schema..."
psql health_prediction < init-db.sql
echo "✅ Database schema initialized"

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install
echo "✅ Dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  IMPORTANT: Edit .env file and set your database password and JWT secret"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env and set your database password"
echo "2. Run 'npm start' to start the server"
echo "3. Server will be available at http://localhost:5000"
echo ""
