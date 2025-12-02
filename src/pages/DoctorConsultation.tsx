import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DoctorConsultation.css";

interface Doctor {
    id: number;
    name: string;
    specialization: string;
    phone: string;
    email: string;
    hospital: string;
    availability: string;
    experience_years: number;
}

interface Recommendation {
    title: string;
    description: string;
    priority: string;
}

export default function DoctorConsultation() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get params from URL query string or location state (fallback)
    const searchParams = new URLSearchParams(location.search);
    const riskLevel = searchParams.get("riskLevel") || location.state?.riskLevel || "medium";
    const predictionType = searchParams.get("predictionType") || location.state?.predictionType || "cardiovascular";

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [emailForm, setEmailForm] = useState({ email: "", additionalEmail: "", patientName: "" });
    const [emailStatus, setEmailStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentRecommendation, setCurrentRecommendation] = useState(0);

    useEffect(() => {
        fetchDoctors();
        loadRecommendations();

        // Auto-fill patient details if logged in
        const userEmail = localStorage.getItem("userEmail");
        const userName = localStorage.getItem("userName");

        if (userEmail || userName) {
            setEmailForm(prev => ({
                ...prev,
                email: userEmail || "",
                patientName: userName || ""
            }));
        }

        // Save prediction data to database
        savePredictionToDatabase();
    }, []);

    const savePredictionToDatabase = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const userEmail = localStorage.getItem("userEmail");

            if (!token || !userEmail) {
                console.log("User not logged in, skipping prediction save");
                return;
            }

            // Prepare prediction data
            const predictionData = {
                prediction_type: predictionType,
                input_data: {
                    source: "cardiovascular_service",
                    timestamp: new Date().toISOString()
                },
                result: {
                    risk_level: riskLevel,
                    prediction_type: predictionType
                }
            };

            const response = await fetch("http://localhost:5003/api/predictions/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(predictionData)
            });

            if (response.ok) {
                console.log("✅ Prediction saved to database successfully");
            } else {
                console.error("Failed to save prediction:", await response.text());
            }
        } catch (error) {
            console.error("Error saving prediction to database:", error);
        }
    };

    // Slideshow effect for recommendations
    useEffect(() => {
        if (recommendations.length > 0) {
            const interval = setInterval(() => {
                setCurrentRecommendation((prev) => (prev + 1) % recommendations.length);
            }, 5000); // Change every 5 seconds
            return () => clearInterval(interval);
        }
    }, [recommendations]);

    const fetchDoctors = async () => {
        try {
            // Determine specialization based on prediction type
            let specialization = "";
            if (predictionType === "cardiovascular") {
                specialization = "Cardiologist";
            } else if (predictionType === "diabetic") {
                specialization = "Ophthalmologist";
            }

            const url = specialization
                ? `http://localhost:5003/api/doctors?specialization=${encodeURIComponent(specialization)}`
                : "http://localhost:5003/api/doctors";

            const response = await fetch(url);
            const data = await response.json();
            setDoctors(data.doctors || []);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const loadRecommendations = () => {
        const recs = getRecommendationsByRisk(riskLevel);
        setRecommendations(recs);
    };

    const getRecommendationsByRisk = (risk: string): Recommendation[] => {
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
        return recommendations[risk as keyof typeof recommendations] || recommendations.medium;
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setEmailStatus("");

        try {
            const response = await fetch("http://localhost:5003/api/send-alert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailForm.email,
                    additionalEmail: emailForm.additionalEmail,
                    patientName: emailForm.patientName,
                    riskLevel,
                    predictionType
                })
            });

            const data = await response.json();
            if (response.ok) {
                setEmailStatus("Email sent successfully! Check your inbox.");
                setEmailForm({ email: "", additionalEmail: "", patientName: "" });
            } else {
                setEmailStatus(data.error || "Failed to send email");
            }
        } catch (error) {
            setEmailStatus("Error sending email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (risk: string) => {
        const colors = {
            high: "#ef4444",
            medium: "#f59e0b",
            low: "#10b981"
        };
        return colors[risk as keyof typeof colors] || colors.medium;
    };

    return (
        <div className="consultation-container">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

            {/* Risk Level Banner */}
            <div className="risk-banner" style={{ borderLeftColor: getRiskColor(riskLevel) }}>
                <div className="risk-icon">
                    {riskLevel === "high" && "⚠️"}
                    {riskLevel === "medium" && "⚡"}
                    {riskLevel === "low" && "✓"}
                </div>
                <div className="risk-content">
                    <h2>Your Risk Level: <span style={{ color: getRiskColor(riskLevel) }}>{riskLevel.toUpperCase()}</span></h2>
                    <p>Based on your {predictionType} prediction results</p>
                </div>
            </div>

            {/* Recommendations Slideshow */}
            <div className="recommendations-section">
                <h2>Health Recommendations</h2>
                <div className="slideshow-container">
                    {recommendations.map((rec, index) => (
                        <div
                            key={index}
                            className={`recommendation-slide ${index === currentRecommendation ? "active" : ""}`}
                        >
                            <div className={`priority-badge ${rec.priority}`}>{rec.priority}</div>
                            <h3>{rec.title}</h3>
                            <p>{rec.description}</p>
                        </div>
                    ))}
                    <div className="slideshow-dots">
                        {recommendations.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${index === currentRecommendation ? "active" : ""}`}
                                onClick={() => setCurrentRecommendation(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Doctors Section */}
            <div className="doctors-section">
                <h2>Consult Our Specialists</h2>
                <div className="doctors-grid">
                    {doctors.map((doctor) => (
                        <div key={doctor.id} className="doctor-card">
                            <div className="doctor-header">
                                <div className="doctor-avatar">
                                    {doctor.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div className="doctor-info">
                                    <h3>{doctor.name}</h3>
                                    <p className="specialization">{doctor.specialization}</p>
                                    <p className="experience">{doctor.experience_years} years experience</p>
                                </div>
                            </div>
                            <div className="doctor-details">
                                <p><strong>Hospital:</strong> {doctor.hospital}</p>
                                <p><strong>Availability:</strong> {doctor.availability}</p>
                                <p><strong>Phone:</strong> <a href={`tel:${doctor.phone}`}>{doctor.phone}</a></p>
                            </div>
                            <div className="doctor-actions">
                                <a href={`tel:${doctor.phone}`} className="btn-call">📞 Call Now</a>
                                <a href={`mailto:${doctor.email}`} className="btn-email">✉️ Email</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Email Alert Section */}
            <div className="email-alert-section">
                <h2>Send Results to Email</h2>
                <form onSubmit={handleSendEmail} className="email-form">
                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            value={emailForm.patientName}
                            onChange={(e) => setEmailForm({ ...emailForm, patientName: e.target.value })}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Email</label>
                        <input
                            type="email"
                            value={emailForm.email}
                            onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Additional Email (Optional)</label>
                        <input
                            type="email"
                            value={emailForm.additionalEmail}
                            onChange={(e) => setEmailForm({ ...emailForm, additionalEmail: e.target.value })}
                            placeholder="doctor.email@example.com"
                        />
                    </div>
                    <button type="submit" className="btn-send" disabled={loading}>
                        {loading ? "Sending..." : "Send Alert Email"}
                    </button>
                    {emailStatus && <p className="email-status">{emailStatus}</p>}
                </form>
            </div>
        </div>
    );
}
