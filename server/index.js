const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = 5003; // Hardcoded to avoid environment variable conflicts

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
        const userCheck = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        console.log('Checking if user exists:', email);
        console.log('User check result:', userCheck ? 1 : 0);

        if (userCheck) {
            console.log('User already exists, returning 409');
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const userId = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
                [email, passwordHash, fullName],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        const user = { id: userId, email, full_name: fullName, created_at: new Date().toISOString() };

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
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);

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

// Doctor Login
app.post('/api/auth/doctor-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find doctor
        let doctor = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM doctors WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Demo Mode: If doctor not found but password is correct (we check this next), 
        // fallback to the first doctor in the database.
        if (!doctor) {
            const defaultDoctor = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM doctors LIMIT 1', (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            // Only use default doctor if the provided password matches the master password
            // We'll verify the password against the default doctor's hash
            if (defaultDoctor) {
                const isMasterPassword = await bcrypt.compare(password, defaultDoctor.password);
                if (isMasterPassword) {
                    doctor = defaultDoctor;
                }
            }
        }

        if (!doctor) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, doctor.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token with doctor role
        const token = jwt.sign(
            { userId: doctor.id, email: doctor.email, role: 'doctor' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Doctor login successful',
            token,
            doctor: {
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                hospital: doctor.hospital
            }
        });
    } catch (error) {
        console.error('Doctor login error:', error);
        res.status(500).json({ error: 'Server error during doctor login' });
    }
});

// Get doctor's alerts (patients who sent emails)
// Get doctor's alerts (patients who sent emails)
app.get('/api/doctor/alerts', authenticateToken, async (req, res) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    try {
        // Find alerts where the recipient email matches the doctor's email
        const alerts = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM email_alerts WHERE recipient_email = ? ORDER BY sent_at DESC`,
                [req.user.email],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        // Also fetch ALL recent predictions from the system (for the "All Patient Activity" view)
        // We join with the users table to get patient details
        const allPredictions = await new Promise((resolve, reject) => {
            db.all(
                `SELECT 
                    p.id, 
                    p.prediction_type, 
                    p.result, 
                    p.created_at, 
                    u.full_name as patient_name, 
                    u.email as patient_email 
                FROM predictions p 
                JOIN users u ON p.user_id = u.id 
                ORDER BY p.created_at DESC 
                LIMIT 50`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        res.json({ alerts, allPredictions });
    } catch (error) {
        console.error('Error fetching doctor data:', error);
        res.status(500).json({ error: 'Error fetching doctor dashboard data' });
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

        // Save prediction to database (optional - table may not exist)
        try {
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO predictions (user_id, prediction_type, input_data, result) VALUES (?, ?, ?, ?)',
                    [
                        req.user.userId,
                        'cardiovascular',
                        JSON.stringify(req.body),
                        JSON.stringify(predictionResult)
                    ],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        } catch (err) {
            console.log('Could not save prediction (table may not exist):', err.message);
        }

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

        // Save prediction to database (optional - table may not exist)
        try {
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO predictions (user_id, prediction_type, input_data, result) VALUES (?, ?, ?, ?)',
                    [
                        req.user.userId,
                        'diabetic',
                        JSON.stringify(inputData),
                        JSON.stringify(predictionResult)
                    ],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        } catch (err) {
            console.log('Could not save prediction (table may not exist):', err.message);
        }

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
        const predictions = await new Promise((resolve, reject) => {
            db.all(
                'SELECT id, prediction_type, input_data, result, created_at FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
                [req.user.userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        res.json({
            predictions
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

// Save prediction from Python services
app.post('/api/predictions/save', authenticateToken, async (req, res) => {
    try {
        const { prediction_type, input_data, result } = req.body;

        if (!prediction_type || !result) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO predictions (user_id, prediction_type, input_data, result) VALUES (?, ?, ?, ?)',
                [
                    req.user.userId,
                    prediction_type,
                    JSON.stringify(input_data || {}),
                    JSON.stringify(result)
                ],
                function (err) {
                    if (err) {
                        console.error('Error saving prediction:', err);
                        reject(err);
                    } else {
                        console.log(`✅ Saved ${prediction_type} prediction for user ${req.user.userId}`);
                        resolve(this.lastID);
                    }
                }
            );
        });

        res.json({ success: true, message: 'Prediction saved successfully' });
    } catch (error) {
        console.error('Error in save prediction endpoint:', error);
        res.status(500).json({ error: 'Failed to save prediction' });
    }
});

// Get all doctors
app.get('/api/doctors', (req, res) => {
    const { specialization } = req.query;
    let query = "SELECT * FROM doctors";
    let params = [];

    if (specialization) {
        query += " WHERE specialization = ?";
        params.push(specialization);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ doctors: rows });
    });
});

// Get recommendations by risk level
app.get('/api/recommendations/:riskLevel', (req, res) => {
    const { riskLevel } = req.params;
    // For now returning static recommendations as they are not yet seeded in DB
    // In a real app, these would come from the DB
    const recommendations = {
        high: [
            { title: "Immediate Medical Attention", description: "Consult a specialist within 24-48 hours", priority: "urgent" },
            { title: "Comprehensive Health Screening", description: "Schedule detailed tests and examinations", priority: "urgent" },
            { title: "Daily Monitoring", description: "Track your symptoms and vital signs daily", priority: "high" },
            { title: "Lifestyle Changes", description: "Implement diet and exercise modifications immediately", priority: "high" }
        ],
        medium: [
            { title: "Schedule Check-up", description: "Book an appointment within 2 weeks", priority: "moderate" },
            { title: "Preventive Measures", description: "Start implementing healthy lifestyle changes", priority: "moderate" },
            { title: "Regular Monitoring", description: "Keep track of key health indicators", priority: "moderate" },
            { title: "Dietary Adjustments", description: "Consult a nutritionist for personalized diet plan", priority: "moderate" }
        ],
        low: [
            { title: "Maintain Healthy Habits", description: "Continue your current healthy lifestyle", priority: "low" },
            { title: "Annual Check-up", description: "Schedule routine health screening once a year", priority: "low" },
            { title: "Stay Active", description: "Regular exercise and balanced nutrition", priority: "low" },
            { title: "Preventive Care", description: "Stay informed about health and wellness", priority: "low" }
        ]
    };

    res.json({ recommendations: recommendations[riskLevel] || recommendations.medium });
});

// Send email alert
const { sendAlertEmail } = require('./emailService');

app.post('/api/send-alert', async (req, res) => {
    const { email, additionalEmail, riskLevel, predictionType, patientName } = req.body;

    // Get recommendations for the email
    const recommendations = {
        high: [
            { title: "Immediate Medical Attention", description: "Consult a specialist within 24-48 hours" },
            { title: "Comprehensive Health Screening", description: "Schedule detailed tests and examinations" }
        ],
        medium: [
            { title: "Schedule Check-up", description: "Book an appointment within 2 weeks" },
            { title: "Preventive Measures", description: "Start implementing healthy lifestyle changes" }
        ],
        low: [
            { title: "Maintain Healthy Habits", description: "Continue your current healthy lifestyle" },
            { title: "Annual Check-up", description: "Schedule routine health screening once a year" }
        ]
    };

    const result = await sendAlertEmail(
        email,
        additionalEmail,
        riskLevel,
        predictionType,
        recommendations[riskLevel] || recommendations.medium,
        patientName // Pass patient name to email service if needed
    );

    if (result.success) {
        // Log to database
        db.run(
            "INSERT INTO email_alerts (recipient_email, prediction_type, risk_level, patient_name) VALUES (?, ?, ?, ?)",
            [email, predictionType, riskLevel, patientName || 'Anonymous'],
            (err) => {
                if (err) console.error("Error logging email alert:", err);
            }
        );
        res.json({ message: "Email sent successfully" });
    } else {
        res.status(500).json({ error: "Failed to send email" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
