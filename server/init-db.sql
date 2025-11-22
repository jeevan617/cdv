-- Health Prediction Database Schema
-- Run this file with: psql health_prediction < init-db.sql

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN ('cardiovascular', 'diabetic')),
  input_data JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);

-- Create index on prediction_type for filtering
CREATE INDEX IF NOT EXISTS idx_predictions_type ON predictions(prediction_type);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

-- Display success message
SELECT 'Database schema created successfully!' AS status;
