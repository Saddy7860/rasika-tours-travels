import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Rasika Tours & Travels</h3>
          <p>Your trusted travel partner for all your journey needs. Making travel simple and affordable since 2020.</p>
          <div className="social-links">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/flights">Flights</a></li>
            <li><a href="/trains">Trains</a></li>
            <li><a href="/buses">Buses</a></li>
            <li><a href="/passport">Passport</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Services</h3>
          <ul>
            <li>Flight Booking</li>
            <li>Train Reservation</li>
            <li>Bus Tickets</li>
            <li>Passport Assistance</li>
            <li>Travel Insurance</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <div className="contact-item"><FaPhone /> +91 1234567890</div>
          <div className="contact-item"><FaEnvelope /> info@rasikatravels.com</div>
          <div className="contact-item"><FaMapMarkerAlt /> Mumbai, Maharashtra, India</div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Rasika Tours & Travels. All Rights Reserved.</p>
        <div className="footer-links">
          <a href="/contact">Privacy Policy</a>
          <a href="/contact">Terms of Service</a>
          <a href="/contact">Refund Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
