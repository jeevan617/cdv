# CDV - Cardiovascular & Diabetic Vision Health Prediction System

A comprehensive health prediction platform that uses machine learning to predict cardiovascular disease risk and detect diabetic retinopathy from retinal images. The system includes a patient portal, doctor dashboard, and automated email alert system.

## 🌟 Features

### Patient Features
- **User Authentication**: Secure registration and login system with JWT tokens
- **Cardiovascular Risk Prediction**: ML-based prediction using ResNet50 model
- **Diabetic Retinopathy Detection**: Retinal image analysis for diabetic complications
- **Doctor Consultation**: Browse and consult specialized doctors (Cardiologists & Ophthalmologists)
- **Email Alerts**: Send prediction results to doctors and family members
- **Prediction History**: Track all past predictions and results

### Doctor Features
- **Doctor Dashboard**: Real-time monitoring of patient predictions
- **Patient Activity Monitor**: View all patient predictions across the system
- **Email Alerts**: Receive consultation requests from patients
- **Specialization-based Access**: Cardiologists see cardiovascular cases, Ophthalmologists see diabetic cases
- **Auto-refresh**: Dashboard updates every 10 seconds

### Technical Features
- **Full-stack Application**: React frontend + Node.js backend + Python ML services
- **Database**: SQLite for data persistence
- **Email Service**: Gmail SMTP integration for alerts
- **Responsive Design**: Modern UI with glassmorphism and smooth animations
- **RESTful API**: Well-structured API endpoints for all operations

## 🏗️ Architecture

```
cdv/
├── src/                          # React Frontend
│   ├── pages/                    # Page components
│   │   ├── Home.tsx             # Landing page
│   │   ├── Login.tsx            # User login
│   │   ├── Signup.tsx           # User registration
│   │   ├── PredictionSelect.tsx # Choose prediction type
│   │   ├── DoctorConsultation.tsx # Doctor consultation page
│   │   ├── DoctorLogin.tsx      # Doctor login
│   │   └── DoctorDashboard.tsx  # Doctor dashboard
│   ├── components/              # Reusable components
│   └── App.tsx                  # Main app component
│
├── server/                       # Node.js Backend
│   ├── index.js                 # Express server
│   ├── db.js                    # Database setup & seeding
│   ├── emailService.js          # Email functionality
│   └── database.sqlite          # SQLite database
│
├── cardivascular/               # Python ML Service (Port 5001)
│   ├── app.py                   # Flask app for cardiovascular prediction
│   ├── templates/               # HTML templates
│   └── checkpoints/             # ML model weights
│
└── Diabetic/                    # Python ML Service (Port 5002)
    ├── app.py                   # Flask app for diabetic detection
    └── templates/               # HTML templates
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeevan617/cdv.git
   cd cdv
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Install Python Dependencies**
   ```bash
   # For Cardiovascular Service
   cd cardivascular
   pip install -r requirements.txt
   cd ..

   # For Diabetic Service
   cd Diabetic
   pip install -r requirements.txt
   cd ..
   ```

5. **Configure Environment Variables**
   
   Edit `server/.env`:
   ```env
   PORT=5003
   JWT_SECRET=dev_secret_key_123
   EMAIL_USER=retinal2207@gmail.com
   EMAIL_PASSWORD=g5G!J33t1RcDpyw
   EMAIL_SERVICE=gmail
   ```

### Running the Application

You need to run **three services** simultaneously:

**Terminal 1 - Backend Server (Port 5003)**
```bash
cd server
node index.js
```

**Terminal 2 - React Frontend (Port 3000)**
```bash
npm start
```

**Terminal 3 - Cardiovascular Service (Port 5001)**
```bash
cd cardivascular
python app.py
```

**Terminal 4 - Diabetic Service (Port 5002)** *(Optional)*
```bash
cd Diabetic
python app.py
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5003`
- Cardiovascular Service: `http://localhost:5001`
- Diabetic Service: `http://localhost:5002`

## 👥 Default Users

### Patient Accounts
Register a new account at `http://localhost:3000/signup`

### Doctor Accounts
All doctors use password: `Doctor@123`

**Cardiologists:**
- `dr.devi@narayana.health` - Dr. Devi Shetty
- `director@jayadevacardiology.com` - Dr. C.N. Manjunath
- `dr.vivek@fortis.com` - Dr. Vivek Jawali

**Ophthalmologists:**
- `dr.bhujang@narayananethralaya.org` - Dr. Bhujang Shetty
- `dr.rohit@narayananethralaya.org` - Dr. Rohit Shetty
- `contact@bwlionseye.org` - Dr. K. Bhujang Rao

## 📖 Usage Guide

### For Patients

1. **Register/Login**
   - Create an account at `/signup`
   - Login at `/login`

2. **Make a Prediction**
   - Choose prediction type (Cardiovascular or Diabetic)
   - Upload retinal image or enter health metrics
   - View prediction results with risk level

3. **Consult a Doctor**
   - Click "Consult Doctor" on results page
   - Browse specialized doctors
   - Send email alerts to doctors

### For Doctors

1. **Login**
   - Go to `/doctor-login`
   - Use doctor credentials

2. **View Dashboard**
   - **All Patient Predictions**: See all system predictions
   - **Email Alerts Only**: See patients who sent you emails
   - Auto-refreshes every 10 seconds

3. **Monitor Patients**
   - View patient name, email, prediction type, risk level
   - Track timestamps for all activities

## 🗄️ Database Schema

### Tables

**users**
- User authentication and profile information

**doctors**
- Doctor profiles with specialization and contact info

**predictions**
- All prediction records with input data and results

**email_alerts**
- Email alert history for doctor notifications

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/doctor-login` - Doctor login

### Predictions
- `POST /api/predictions/save` - Save prediction to database
- `GET /api/predictions/history` - Get user's prediction history

### Doctors
- `GET /api/doctors` - Get all doctors (optional specialization filter)
- `GET /api/doctor/alerts` - Get doctor's alerts and patient predictions

### Email
- `POST /api/send-alert` - Send email alert

## 🛠️ Development

### Adding Sample Data

To populate the database with sample predictions for testing:
```bash
cd server
node add_sample_predictions.js
```

### Checking Database

To view database contents:
```bash
cd server
node check_all_tables.js
```

## 📧 Email Configuration

The system uses Gmail SMTP for sending alerts. Make sure to:
1. Use an app-specific password (not your regular Gmail password)
2. Enable "Less secure app access" or use OAuth2
3. Configure credentials in `server/.env`

## 🎨 UI Features

- **Modern Design**: Glassmorphism, gradients, and smooth animations
- **Responsive**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: Color schemes optimized for readability
- **Interactive**: Hover effects, transitions, and micro-animations

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Environment variables for sensitive data
- CORS enabled for cross-origin requests

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 5003 is available
- Verify `.env` file exists in `server/` directory

**Frontend won't connect:**
- Ensure backend is running on port 5003
- Check CORS settings in `server/index.js`

**Predictions not saving:**
- Verify user is logged in
- Check auth token in localStorage
- Ensure backend `/api/predictions/save` endpoint is accessible

**Email not sending:**
- Verify Gmail credentials in `.env`
- Check if app password is correct
- Ensure Gmail SMTP is enabled

## 📝 License

This project is for educational purposes.

## 👨‍💻 Contributors

- Jeevan617 - [GitHub](https://github.com/jeevan617)

## 🙏 Acknowledgments

- ResNet50 model for image analysis
- React and Node.js communities
- Flask framework for Python services
