import React from "react";
import "./About.css";

export default function About() {
  return (
    <div className="about-container">
      <div className="about-background"></div>
      <div className="about-header">
        <h1 className="gradient-text">About Health Prediction</h1>
        <p className="about-intro">
          We help people make informed decisions with clear health risk insights.
          Understand trends, act early, and stay confident about your wellbeing.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card" style={{ animationDelay: '0.1s' }}>
          <div className="about-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3>About Me</h3>
          <p>Passionate about accessible, preventative health technology that empowers individuals to take control of their wellness journey.</p>
        </div>

        <div className="about-card" style={{ animationDelay: '0.2s' }}>
          <div className="about-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h3>Cardiovascular Prediction</h3>
          <p>Identify cardiovascular risk early with clear, actionable indicators based on advanced machine learning models.</p>
        </div>

        <div className="about-card" style={{ animationDelay: '0.3s' }}>
          <div className="about-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h3>Diabetic Prediction</h3>
          <p>Monitor diabetes risk trends and act sooner to stay in control with personalized insights and recommendations.</p>
        </div>
      </div>
    </div>
  );
}