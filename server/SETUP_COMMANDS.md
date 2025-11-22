# 🚀 Complete Setup Guide - Health Prediction Backend

## Overview
This guide will help you set up the PostgreSQL database and Express.js backend server for the Health Prediction application.

---

## 📋 Prerequisites
- macOS (for brew commands)
- Node.js installed
- Terminal access

---

## ⚡ Quick Setup (Recommended)

### Option 1: Automated Setup Script
Run this single command:

```bash
cd /Users/karthikm/Downloads/cdd/spline-test/server && ./setup.sh
```

This will automatically:
- ✅ Install PostgreSQL (if needed)
- ✅ Create the database
- ✅ Initialize the schema
- ✅ Install Node.js dependencies
- ✅ Create .env file

**After running the script:**
1. Edit `server/.env` and set your `DB_PASSWORD` and `JWT_SECRET`
2. Run `npm start` to start the server

---

## 🔧 Manual Setup (Step by Step)

### Step 1: Install PostgreSQL
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Step 2: Create Database
```bash
createdb health_prediction
```

### Step 3: Initialize Database Schema
```bash
cd /Users/karthikm/Downloads/cdd/spline-test/server
psql health_prediction < init-db.sql
```

You should see: `Database schema created successfully!`

### Step 4: Install Node.js Dependencies
```bash
npm install
```

### Step 5: Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file and set:
```env
DB_PASSWORD=your_postgres_password  # Leave empty if no password
JWT_SECRET=your-random-secret-key-here-change-this
```

### Step 6: Start the Backend Server
```bash
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server running on http://localhost:5000
📊 Health check: http://localhost:5000/api/health
```

---

## ✅ Verify Installation

Test the server is running:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Health Prediction API is running",
  "timestamp": "2025-11-20T..."
}
```

---

## 🧪 Test the API

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response - you'll need it for predictions!

---

## 🗄️ Database Management

### View Users
```bash
psql health_prediction -c "SELECT id, email, full_name, created_at FROM users;"
```

### View Predictions
```bash
psql health_prediction -c "SELECT id, user_id, prediction_type, created_at FROM predictions ORDER BY created_at DESC LIMIT 10;"
```

### Reset Database (if needed)
```bash
dropdb health_prediction
createdb health_prediction
psql health_prediction < init-db.sql
```

---

## 🔌 API Endpoints

### Authentication (No token required)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Predictions (Requires JWT token)
- `POST /api/predict/cardiovascular` - Get cardiovascular prediction
- `POST /api/predict/diabetic` - Get diabetic prediction
- `GET /api/predictions/history` - Get user's prediction history

### Health Check
- `GET /api/health` - Check server status

---

## 🐛 Troubleshooting

### PostgreSQL not found
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Database connection error
- Check if PostgreSQL is running: `brew services list`
- Verify database exists: `psql -l | grep health_prediction`
- Check `.env` file has correct `DB_PASSWORD`

### Port 5000 already in use
Edit `.env` and change `PORT=5000` to another port like `PORT=5001`

---

## 📝 Next Steps

After backend is running:

1. **Start Python Prediction Services:**
   - Cardiovascular service on port 5001
   - Diabetic service on port 5002

2. **Frontend will automatically connect** to the backend when you login

3. **Test the full flow:**
   - Register → Login → Choose Prediction → Get Results

---

## 📚 File Structure

```
server/
├── index.js           # Main Express server
├── db.js              # PostgreSQL connection
├── init-db.sql        # Database schema
├── package.json       # Dependencies
├── .env               # Environment variables (create from .env.example)
├── .env.example       # Environment template
├── setup.sh           # Automated setup script
├── README.md          # Documentation
└── SETUP_COMMANDS.md  # This file
```

---

## 🎉 Success!

If you see the server running message, you're all set! The backend is ready to handle authentication and predictions.
