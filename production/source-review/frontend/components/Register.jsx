import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-wrapper">

        <div className="register-info">
          <span className="register-badge">
            JOIN RASIKA TOURS
          </span>

          <h1>
            Start Your Next
            <span> Adventure Today.</span>
          </h1>

          <p>
            Create your account and enjoy a simpler way to plan,
            search and book your journeys.
          </p>

          <div className="register-benefits">
            <div>
              <span className="benefit-icon">✓</span>
              Easy booking management
            </div>

            <div>
              <span className="benefit-icon">✓</span>
              Flights, trains and buses
            </div>

            <div>
              <span className="benefit-icon">✓</span>
              Track all your bookings
            </div>
          </div>
        </div>

        <div className="register-card">
          <div className="register-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="register-field">
              <label>Full Name</label>

              <div className="register-input">
                <FaUser />

                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label>Email Address</label>

              <div className="register-input">
                <FaEnvelope />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label>Phone Number</label>

              <div className="register-input">
                <FaPhone />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label>Password</label>

              <div className="register-input">
                <FaLock />

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  Create Account
                  <FaArrowRight />
                </>
              )}
            </button>

          </form>

          <p className="register-switch">
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Register;
