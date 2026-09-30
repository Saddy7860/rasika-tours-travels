import React, { useState } from 'react';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane
} from 'react-icons/fa';
import api from '../services/api';
import './ContactUs.css';

function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSubmitted(false);

    try {
      await api.post('/contact', formData);

      setSubmitted(true);

      setFormData({
        fullName: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);

    } catch (error) {
      console.error('Contact message error:', error);

      alert(
        error.userMessage ||
        'Unable to send your message. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">

      <section className="contact-hero">
        <div className="contact-container">
          <span className="contact-eyebrow">CONTACT RASIKA TOURS</span>

          <h1>We're Here To Help You Travel Better</h1>

          <p>
            Have a question about bookings, travel services or passport
            assistance? Our team is ready to help.
          </p>
        </div>
      </section>

      <section className="contact-content">
        <div className="contact-container contact-grid">

          <div className="contact-info">

            <h2>Get In Touch</h2>

            <p className="contact-description">
              Reach out to us anytime and our travel team will get back to you.
            </p>

            <div className="contact-info-card">
              <div className="contact-icon">
                <FaPhone />
              </div>

              <div>
                <h3>Call Us</h3>
                <p>+91 XXXXX XXXXX</p>
                <span>Available for travel assistance</span>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-icon">
                <FaEnvelope />
              </div>

              <div>
                <h3>Email Us</h3>
                <p>support@rasikatours.com</p>
                <span>We usually respond quickly</span>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <h3>Visit Us</h3>
                <p>Kolhapur, Maharashtra</p>
                <span>India</span>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-icon">
                <FaClock />
              </div>

              <div>
                <h3>Working Hours</h3>
                <p>Monday - Saturday</p>
                <span>9:00 AM - 8:00 PM</span>
              </div>
            </div>

          </div>

          <div className="contact-form-card">

            <h2>Send Us A Message</h2>

            <p>
              Fill in the details below and we'll get back to you soon.
            </p>

            {submitted && (
              <div className="contact-success">
                ✓ Your message has been sent successfully!
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="contact-form-row">

                <div className="contact-form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label>Phone Number</label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone"
                    required
                  />
                </div>

              </div>

              <div className="contact-form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="contact-form-group">
                <label>Subject</label>

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="Flight Booking">Flight Booking</option>
                  <option value="Train Booking">Train Booking</option>
                  <option value="Bus Booking">Bus Booking</option>
                  <option value="Passport Services">Passport Services</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div className="contact-form-group">
                <label>Your Message</label>

                <textarea
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                />
              </div>

              <button
                type="submit"
                className="contact-submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}

                <FaPaperPlane />
              </button>

            </form>

          </div>

        </div>
      </section>

    </div>
  );
}

export default ContactUs;
