const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create SQLite database connection
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
        process.exit(-1);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Initialize database tables
db.serialize(() => {
    // Create users table if it doesn't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating users table:', err.message);
        } else {
            console.log('✅ Users table ready');
        }
    });

    // Create doctors table
    db.serialize(() => {
        db.run("DROP TABLE IF EXISTS doctors");
        db.run(`
            CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            password TEXT NOT NULL,
            hospital TEXT,
            availability TEXT,
            experience_years INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
            if (err) {
                console.error('❌ Error creating doctors table:', err.message);
            } else {
                console.log('✅ Doctors table ready');
                // Seed doctors (Clear existing first to ensure update)
                db.run("DELETE FROM doctors", [], async (err) => {
                    if (!err) {
                        const saltRounds = 10;
                        const defaultPassword = await bcrypt.hash('Doctor@123', saltRounds);

                        const doctors = [
                            // Cardiologists (Karnataka)
                            {
                                name: "Dr. Devi Shetty",
                                specialization: "Cardiologist",
                                phone: "+91-80-27835000",
                                email: "dr.devi@narayana.health",
                                password: defaultPassword,
                                hospital: "Narayana Health City, Bangalore",
                                availability: "Mon-Thu, 10AM-4PM",
                                experience_years: 35
                            },
                            {
                                name: "Dr. C.N. Manjunath",
                                specialization: "Cardiologist",
                                phone: "+91-80-22977400",
                                email: "director@jayadevacardiology.com",
                                password: defaultPassword,
                                hospital: "Jayadeva Institute, Bangalore",
                                availability: "Tue-Fri, 9AM-2PM",
                                experience_years: 30
                            },
                            {
                                name: "Dr. Vivek Jawali",
                                specialization: "Cardiologist",
                                phone: "+91-80-40134013",
                                email: "dr.vivek@fortis.com",
                                password: defaultPassword,
                                hospital: "Fortis Hospital, Bannerghatta Rd",
                                availability: "Mon-Sat, 11AM-5PM",
                                experience_years: 28
                            },
                            // Ophthalmologists (Karnataka)
                            {
                                name: "Dr. Bhujang Shetty",
                                specialization: "Ophthalmologist",
                                phone: "+91-80-26620200",
                                email: "dr.bhujang@narayananethralaya.org",
                                password: defaultPassword,
                                hospital: "Narayana Nethralaya, Bangalore",
                                availability: "Mon-Fri, 9AM-6PM",
                                experience_years: 32
                            },
                            {
                                name: "Dr. Rohit Shetty",
                                specialization: "Ophthalmologist",
                                phone: "+91-80-66660655",
                                email: "dr.rohit@narayananethralaya.org",
                                password: defaultPassword,
                                hospital: "Narayana Nethralaya, Bangalore",
                                availability: "Wed-Sat, 10AM-4PM",
                                experience_years: 22
                            },
                            {
                                name: "Dr. K. Bhujang Rao",
                                specialization: "Ophthalmologist",
                                phone: "+91-80-23330000",
                                email: "contact@bwlionseye.org",
                                password: defaultPassword,
                                hospital: "Minto Eye Hospital, Bangalore",
                                availability: "Mon-Sat, 8AM-2PM",
                                experience_years: 25
                            }
                        ];

                        const insert = db.prepare("INSERT INTO doctors (name, specialization, phone, email, password, hospital, availability, experience_years) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        doctors.forEach(doc => {
                            insert.run(doc.name, doc.specialization, doc.phone, doc.email, doc.password, doc.hospital, doc.availability, doc.experience_years);
                        });
                        insert.finalize();
                        console.log('✅ Seeded doctors table');
                    }
                });
            }
        });

        // Create recommendations table
        db.run(`
        CREATE TABLE IF NOT EXISTS recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            risk_level TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            priority TEXT NOT NULL,
            category TEXT
        )
    `, (err) => {
            if (err) {
                console.error('❌ Error creating recommendations table:', err.message);
            } else {
                console.log('✅ Recommendations table ready');
            }
        });

        // Create email_alerts table
        db.serialize(() => {
            db.run("DROP TABLE IF EXISTS email_alerts");
            db.run(`
            CREATE TABLE IF NOT EXISTS email_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                patient_name TEXT,
                recipient_email TEXT NOT NULL,
                prediction_type TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `, (err) => {
                if (err) {
                    console.error('❌ Error creating email_alerts table:', err.message);
                } else {
                    console.log('✅ Email alerts table ready');
                }
            });
        });

        // Create predictions table
        db.run(`
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                prediction_type TEXT,
                input_data TEXT,
                result TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating predictions table:', err.message);
            } else {
                console.log('✅ Predictions table ready');
            }
        });
    });
});

module.exports = db;
