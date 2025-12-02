const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Checking All Database Tables ===\n');

// Check doctors
db.all('SELECT COUNT(*) as count FROM doctors', [], (err, rows) => {
    if (err) {
        console.error('Error checking doctors:', err.message);
    } else {
        console.log('Total doctors in database:', rows[0].count);
    }
});

db.all('SELECT * FROM doctors', [], (err, rows) => {
    if (err) {
        console.error('Error fetching doctors:', err.message);
    } else {
        console.log('\nDoctors in database:');
        rows.forEach(doc => {
            console.log(`- ${doc.name} (${doc.specialization}) - ${doc.email}`);
        });
    }
});

// Check predictions
db.all('SELECT COUNT(*) as count FROM predictions', [], (err, rows) => {
    if (err) {
        console.error('Error checking predictions:', err.message);
    } else {
        console.log('\nTotal predictions in database:', rows[0].count);
    }
});

// Check email_alerts
db.all('SELECT COUNT(*) as count FROM email_alerts', [], (err, rows) => {
    if (err) {
        console.error('Error checking email_alerts:', err.message);
    } else {
        console.log('Total email alerts in database:', rows[0].count);
    }
});

db.all('SELECT * FROM email_alerts', [], (err, rows) => {
    if (err) {
        console.error('Error fetching email_alerts:', err.message);
    } else {
        console.log('\nEmail alerts:');
        console.log(JSON.stringify(rows, null, 2));
    }
});

// Check users
db.all('SELECT COUNT(*) as count FROM users', [], (err, rows) => {
    if (err) {
        console.error('Error checking users:', err.message);
    } else {
        console.log('\nTotal users in database:', rows[0].count);
    }
    db.close();
});
