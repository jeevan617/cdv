import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo-container">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h2 className="logo">Health Prediction</h2>
      </Link>
      <ul className="nav-links">
        <li><Link to="/" className={isActive("/") ? "active" : ""}>Home</Link></li>
        <li><Link to="/about" className={isActive("/about") ? "active" : ""}>About</Link></li>
        <li><Link to="/devs" className={isActive("/devs") ? "active" : ""}>Devs</Link></li>
        <li><Link to="/doctor-login" className={isActive("/doctor-login") ? "active" : ""}>Doctor Portal</Link></li>
        <li><Link to="/login" className={`nav-btn ${isActive("/login") ? "active" : ""}`}>Login</Link></li>
        <li><Link to="/signup" className={`nav-btn primary ${isActive("/signup") ? "active" : ""}`}>Sign Up</Link></li>
      </ul>
    </nav>
  );
}