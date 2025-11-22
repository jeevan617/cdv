import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./PredictionSelect.css";

export default function PredictionSelect() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        navigate("/login");
    };

    return (
        <div className="prediction-select-container">
            <div className="prediction-header">
                <h1 className="gradient-text">Choose Your Prediction</h1>
                <p className="prediction-subtitle">Select the type of health prediction you want to perform</p>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            <div className="prediction-grid">
                <a href="http://127.0.0.1:5005" className="prediction-card">
                    <div className="prediction-icon cardiovascular-icon">
                        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <h2>Cardiovascular Prediction</h2>
                    <p>Analyze cardiovascular health risk factors and get detailed predictions about heart disease probability.</p>
                    <div className="card-footer">
                        <span className="card-link">Start Prediction →</span>
                    </div>
                </a>

                <a href="http://127.0.0.1:5003" className="prediction-card">
                    <div className="prediction-icon diabetic-icon">
                        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <h2>Diabetic Retinopathy Detection</h2>
                    <p>Upload retinal images to detect diabetic retinopathy and assess severity levels with clustering analysis.</p>
                    <div className="card-footer">
                        <span className="card-link">Start Detection →</span>
                    </div>
                </a>
            </div>
        </div>
    );
}
