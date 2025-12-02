const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Checking Database ===\n');

db.all('SELECT COUNT(*) as count FROM predictions', [], (err, rows) => {
    if (err) {
        console.error('Error checking predictions:', err.message);
    } else {
        console.log('Total predictions in database:', rows[0].count);
    }
});

db.all('SELECT COUNT(*) as count FROM users', [], (err, rows) => {
    if (err) {
        console.error('Error checking users:', err.message);
    } else {
        console.log('Total users in database:', rows[0].count);
    }
});

db.all('SELECT * FROM predictions LIMIT 5', [], (err, rows) => {
    if (err) {
        console.error('Error fetching predictions:', err.message);
    } else {
        console.log('\nRecent predictions:');
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
