# Health Prediction Backend Server

## Setup Instructions

### 1. Install PostgreSQL (if not already installed)
```bash
brew install postgresql@14
brew services start postgresql@14
```

### 2. Create Database
```bash
createdb health_prediction
```

### 3. Initialize Database Schema
```bash
psql health_prediction < init-db.sql
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env and set your database password and JWT secret
```

### 6. Start the Server
```bash
npm start
```

The server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Predictions (requires authentication)
- `POST /api/predict/cardiovascular` - Get cardiovascular prediction
- `POST /api/predict/diabetic` - Get diabetic prediction
- `GET /api/predictions/history` - Get prediction history

### Health Check
- `GET /api/health` - Check if server is running

## Testing

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
