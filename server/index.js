const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT verification middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== AUTH ENDPOINTS ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Validate input
        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at',
            [email, passwordHash, fullName]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// ==================== PREDICTION ENDPOINTS ====================

// Cardiovascular prediction
app.post('/api/predict/cardiovascular', authenticateToken, async (req, res) => {
    try {
        const { age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal } = req.body;

        // Call Python cardiovascular service
        const response = await axios.post(
            `${process.env.CARDIOVASCULAR_SERVICE_URL}/predict`,
            { age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal }
        );

        const predictionResult = response.data;

        // Save prediction to database
        await pool.query(
            'INSERT INTO predictions (user_id, prediction_type, input_data, result) VALUES ($1, $2, $3, $4)',
            [
                req.user.userId,
                'cardiovascular',
                JSON.stringify(req.body),
                JSON.stringify(predictionResult)
            ]
        );

        res.json({
            message: 'Cardiovascular prediction completed',
            result: predictionResult
        });
    } catch (error) {
        console.error('Cardiovascular prediction error:', error);
        res.status(500).json({
            error: 'Error processing cardiovascular prediction',
            details: error.message
        });
    }
});

// Diabetic prediction
app.post('/api/predict/diabetic', authenticateToken, async (req, res) => {
    try {
        const inputData = req.body;

        // Call Python diabetic service
        const response = await axios.post(
            `${process.env.DIABETIC_SERVICE_URL}/predict`,
            inputData
        );

        const predictionResult = response.data;

        // Save prediction to database
        await pool.query(
            'INSERT INTO predictions (user_id, prediction_type, input_data, result) VALUES ($1, $2, $3, $4)',
            [
                req.user.userId,
                'diabetic',
                JSON.stringify(inputData),
                JSON.stringify(predictionResult)
            ]
        );

        res.json({
            message: 'Diabetic prediction completed',
            result: predictionResult
        });
    } catch (error) {
        console.error('Diabetic prediction error:', error);
        res.status(500).json({
            error: 'Error processing diabetic prediction',
            details: error.message
        });
    }
});

// Get user's prediction history
app.get('/api/predictions/history', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, prediction_type, input_data, result, created_at FROM predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
            [req.user.userId]
        );

        res.json({
            predictions: result.rows
        });
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Error fetching prediction history' });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Health Prediction API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
