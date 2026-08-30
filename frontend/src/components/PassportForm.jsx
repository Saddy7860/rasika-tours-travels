import React, { useState } from 'react';
import { FaPassport, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';
import './PassportForm.css';

function PassportForm() {
  const [formData, setFormData] = useState({
    serviceType: 'NEW',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    existingPassportNumber: ''
  });

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/passport', formData);
      setSuccess(true);

      setFormData({
        serviceType: 'NEW',
        fullName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        existingPassportNumber: ''
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      alert(error.userMessage || 'Error submitting request. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="passport-page">

      <section className="passport-hero">
        <div className="passport-hero-icon">
          <FaPassport />
        </div>

        <div>
          <span>PASSPORT SERVICES</span>
          <h1>Passport Assistance Made Simple</h1>
          <p>Submit your request and our team will help guide you through the process.</p>
        </div>
      </section>

      {success && (
        <div className="passport-success">
          <FaCheckCircle />
          Passport request submitted successfully! We will contact you soon.
        </div>
      )}

      <section className="passport-layout">

        <aside className="passport-info">
          <h2>How It Works</h2>

          <div className="passport-step">
            <span>01</span>
            <div>
              <h3>Submit Request</h3>
              <p>Fill in your personal details and service requirement.</p>
            </div>
          </div>

          <div className="passport-step">
            <span>02</span>
            <div>
              <h3>We Contact You</h3>
              <p>Our team will review your request and contact you.</p>
            </div>
          </div>

          <div className="passport-step">
            <span>03</span>
            <div>
              <h3>Get Assistance</h3>
              <p>Receive guidance for your passport application process.</p>
            </div>
          </div>
        </aside>

        <section className="passport-form-card">
          <div className="passport-form-heading">
            <h2>Submit Your Request</h2>
            <p>Complete the details below to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="passport-form">

            <div className="passport-field full">
              <label>Service Type</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
              >
                <option value="NEW">New Passport</option>
                <option value="RENEWAL">Passport Renewal</option>
              </select>
            </div>

            <div className="passport-field full">
              <label><FaUser /> Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="passport-field">
              <label><FaCalendarAlt /> Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="passport-field">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="passport-field">
              <label><FaEnvelope /> Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="passport-field">
              <label><FaPhone /> Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="passport-field full">
              <label><FaMapMarkerAlt /> Address</label>
              <textarea
                name="address"
                rows="4"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            {formData.serviceType === 'RENEWAL' && (
              <div className="passport-field full">
                <label>Existing Passport Number</label>
                <input
                  type="text"
                  name="existingPassportNumber"
                  value={formData.existingPassportNumber}
                  onChange={handleChange}
                />
              </div>
            )}

            <button type="submit" className="passport-submit">
              <FaPassport />
              Submit Passport Request
            </button>

          </form>
        </section>

      </section>
    </main>
  );
}

export default PassportForm;
