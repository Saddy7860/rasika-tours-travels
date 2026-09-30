import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FaPlane,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        const redirectTo = location.state?.from || '/';
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data ||
        'Login failed. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        <div className="login-info-panel">
          <div className="login-brand">
            <div className="login-brand-icon">
              <FaPlane />
            </div>

            <div>
              <h2>Rasika Tours</h2>
              <p>Travel Made Simple</p>
            </div>
          </div>

          <div className="login-info-content">
            <span className="login-eyebrow">
              WELCOME BACK
            </span>

            <h1>
              Your next journey is
              <span> just a login away.</span>
            </h1>

            <p>
              Access your bookings, manage your travel plans and explore
              new destinations with Rasika Tours & Travels.
            </p>

            <div className="login-benefits">
              <div className="login-benefit">
                <span>✓</span>
                <div>
                  <strong>Manage Bookings</strong>
                  <small>View all your travel reservations</small>
                </div>
              </div>

              <div className="login-benefit">
                <span>✓</span>
                <div>
                  <strong>Quick & Secure</strong>
                  <small>Your account and bookings stay protected</small>
                </div>
              </div>

              <div className="login-benefit">
                <span>✓</span>
                <div>
                  <strong>Travel Made Easy</strong>
                  <small>Flights, trains, buses and more</small>
                </div>
              </div>
            </div>
          </div>

          <div className="login-decoration decoration-one"></div>
          <div className="login-decoration decoration-two"></div>
        </div>

        <div className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>

            <div className="login-form-header">
              <span className="form-welcome">WELCOME BACK</span>

              <h2>Login to your account</h2>

              <p>
                Enter your details to continue your journey.
              </p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="login-input-group">
              <label>Email Address</label>

              <div className="input-with-icon">
                <FaEnvelope />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-input-group">
              <label>Password</label>

              <div className="input-with-icon">
                <FaLock />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              <span>
                {loading ? 'Logging in...' : 'Login to Account'}
              </span>

              {!loading && <FaArrowRight />}
            </button>

            <div className="login-divider">
              <span>NEW TO RASIKA TOURS?</span>
            </div>

            <p className="auth-switch">
              Don't have an account?
              <Link to="/register">
                Create Account
              </Link>
            </p>

          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;
