const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Adding Sample Prediction Data ===\n');

// First, get a user ID
db.get('SELECT id, email, full_name FROM users LIMIT 1', [], (err, user) => {
    if (err) {
        console.error('Error fetching user:', err.message);
        db.close();
        return;
    }

    if (!user) {
        console.log('❌ No users found in database. Please register a user first.');
        db.close();
        return;
    }

    console.log(`Using user: ${user.full_name} (${user.email})`);

    // Sample predictions
    const predictions = [
        {
            user_id: user.id,
            prediction_type: 'cardiovascular',
            input_data: JSON.stringify({
                source: 'cardiovascular_service',
                timestamp: new Date().toISOString()
            }),
            result: JSON.stringify({
                risk_level: 'high',
                prediction_type: 'cardiovascular',
                confidence: 0.87
            })
        },
        {
            user_id: user.id,
            prediction_type: 'cardiovascular',
            input_data: JSON.stringify({
                source: 'cardiovascular_service',
                timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            }),
            result: JSON.stringify({
                risk_level: 'medium',
                prediction_type: 'cardiovascular',
                confidence: 0.65
            })
        },
        {
            user_id: user.id,
            prediction_type: 'diabetic',
            input_data: JSON.stringify({
                source: 'diabetic_service',
                timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
            }),
            result: JSON.stringify({
                risk_level: 'low',
                prediction_type: 'diabetic',
                confidence: 0.92
            })
        }
    ];

    // Insert sample predictions
    const insert = db.prepare(
        'INSERT INTO predictions (user_id, prediction_type, input_data, result) VALUES (?, ?, ?, ?)'
    );

    predictions.forEach((pred, index) => {
        insert.run(pred.user_id, pred.prediction_type, pred.input_data, pred.result, (err) => {
            if (err) {
                console.error(`Error inserting prediction ${index + 1}:`, err.message);
            } else {
                console.log(`✅ Added ${pred.prediction_type} prediction with ${JSON.parse(pred.result).risk_level} risk`);
            }
        });
    });

    insert.finalize(() => {
        console.log('\n✅ Sample predictions added successfully!');
        console.log('\nNow you can:');
        console.log('1. Login to Doctor Dashboard at http://localhost:3000/doctor-login');
        console.log('2. Use any doctor email with password: Doctor@123');
        console.log('3. View predictions in the "All Patient Predictions" tab');
        db.close();
    });
});
