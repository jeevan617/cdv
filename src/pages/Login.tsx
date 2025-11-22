import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Dummy credentials
  const DUMMY_EMAIL = "demo@health.com";
  const DUMMY_PASSWORD = "demo123";

  const handleGoogleLogin = () => {
    alert("Google OAuth Sign-In\n\nTo implement:\n1. Set up Google OAuth credentials in Google Cloud Console\n2. Install firebase or @react-oauth/google package\n3. Configure OAuth client ID\n4. Implement OAuth flow\n\nThis will redirect to Google's authentication page.");
  };

  const handleGithubLogin = () => {
    alert("GitHub OAuth Sign-In\n\nTo implement:\n1. Create OAuth App in GitHub Settings\n2. Install @octokit/oauth-app or similar package\n3. Configure client ID and secret\n4. Implement OAuth flow\n\nThis will redirect to GitHub's authentication page.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check dummy credentials
    if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      // Store login state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);

      // Redirect to prediction selection
      navigate("/prediction-select");
    } else {
      setError("Invalid credentials. Use: demo@health.com / demo123");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      <div className="auth-container">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue to Health Prediction</p>

        {/* Demo Credentials Info */}
        <div className="demo-info">
          <strong>Demo Credentials:</strong><br />
          Email: demo@health.com<br />
          Password: demo123
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email" className={email ? "filled" : ""}>Email Address</label>
            <div className="input-border"></div>
          </div>

          <div className="input-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password" className={password ? "filled" : ""}>Password</label>
            <div className="input-border"></div>
          </div>

          <div className="auth-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#forgot" className="forgot-link">Forgot password?</a>
          </div>

          <button className="btn btn-primary" type="submit">
            Sign In
            <span className="btn-shine"></span>
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-buttons">
          <button className="social-btn" onClick={handleGoogleLogin} type="button">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button className="social-btn" onClick={handleGithubLogin} type="button">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>
        </div>

        <p className="auth-footer">
          Don't have an account? <a href="/signup" className="auth-link">Sign up</a>
        </p>
      </div>
    </div>
  );
}