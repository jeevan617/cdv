import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';

interface Alert {
    id: number;
    patient_name: string;
    recipient_email: string;
    prediction_type: string;
    risk_level: string;
    sent_at: string;
}

interface PredictionActivity {
    id: number;
    patient_name: string;
    patient_email: string;
    prediction_type: string;
    result: string;
    created_at: string;
}

interface Doctor {
    name: string;
    specialization: string;
    hospital: string;
    email: string;
}

export default function DoctorDashboard() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [allPredictions, setAllPredictions] = useState<PredictionActivity[]>([]);
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'alerts' | 'all'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('token');

        if (!token || role !== 'doctor' || !userStr) {
            navigate('/doctor-login');
            return;
        }

        setDoctor(JSON.parse(userStr));
        fetchData(token);

        // Auto-refresh every 10 seconds
        const interval = setInterval(() => {
            fetchData(token);
        }, 10000);

        return () => clearInterval(interval);
    }, [navigate]);

    const fetchData = async (token: string) => {
        try {
            const response = await fetch('http://localhost:5003/api/doctor/alerts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setAlerts(data.alerts || []);
            setAllPredictions(data.allPredictions || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoading(true);
            fetchData(token);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        navigate('/doctor-login');
    };

    const getRiskLevel = (result: string) => {
        try {
            const parsed = JSON.parse(result);
            return parsed.risk_level || 'unknown';
        } catch (e) {
            return 'unknown';
        }
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Doctor Dashboard</h1>
                    <div className="doctor-profile">
                        <div className="avatar">
                            {doctor?.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="info">
                            <h3>{doctor?.name}</h3>
                            <p>{doctor?.specialization} • {doctor?.hospital}</p>
                        </div>
                        <button onClick={handleRefresh} className="action-btn" style={{ marginRight: '10px' }}>Refresh</button>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <section className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Consultations</h3>
                        <p className="stat-value">{alerts.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Predictions</h3>
                        <p className="stat-value">{allPredictions.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Today's Activity</h3>
                        <p className="stat-value">
                            {allPredictions.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                </section>

                <section className="alerts-section">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>Patient Activity Monitor</h2>
                        <div className="tab-buttons">
                            <button
                                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                                style={{ padding: '8px 16px', marginRight: '10px', borderRadius: '4px', border: 'none', background: activeTab === 'all' ? '#2563eb' : '#e5e7eb', color: activeTab === 'all' ? 'white' : 'black', cursor: 'pointer' }}
                            >
                                All Patient Predictions
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('alerts')}
                                style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: activeTab === 'alerts' ? '#2563eb' : '#e5e7eb', color: activeTab === 'alerts' ? 'white' : 'black', cursor: 'pointer' }}
                            >
                                Email Alerts Only
                            </button>
                        </div>
                    </div>

                    {activeTab === 'all' ? (
                        allPredictions.length === 0 ? (
                            <div className="empty-state"><p>No patient activity recorded yet.</p></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="alerts-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Patient Name</th>
                                            <th>Patient Email</th>
                                            <th>Prediction Type</th>
                                            <th>Risk Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allPredictions.map(pred => {
                                            const riskLevel = getRiskLevel(pred.result);
                                            return (
                                                <tr key={pred.id}>
                                                    <td>{new Date(pred.created_at).toLocaleDateString()} {new Date(pred.created_at).toLocaleTimeString()}</td>
                                                    <td>{pred.patient_name || 'Unknown'}</td>
                                                    <td>{pred.patient_email}</td>
                                                    <td className="capitalize">{pred.prediction_type}</td>
                                                    <td>
                                                        <span className={`risk-badge ${riskLevel}`}>
                                                            {riskLevel.toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        alerts.length === 0 ? (
                            <div className="empty-state"><p>No patient alerts received yet.</p></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="alerts-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Patient Name</th>
                                            <th>Patient Email</th>
                                            <th>Prediction Type</th>
                                            <th>Risk Level</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alerts.map(alert => (
                                            <tr key={alert.id}>
                                                <td>{new Date(alert.sent_at).toLocaleDateString()} {new Date(alert.sent_at).toLocaleTimeString()}</td>
                                                <td>{alert.patient_name || 'Anonymous'}</td>
                                                <td>{alert.recipient_email}</td>
                                                <td className="capitalize">{alert.prediction_type}</td>
                                                <td>
                                                    <span className={`risk-badge ${alert.risk_level}`}>
                                                        {alert.risk_level.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="action-btn">View Details</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </section>
            </main>
        </div>
    );
}
