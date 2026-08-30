import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaPlane,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaSuitcase,
  FaUserCircle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [travelOpen, setTravelOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const closeMenus = () => {
    setMenuOpen(false);
    setTravelOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/');
  };

  const travelLinks = [
    { path: '/flights', label: 'Flights' },
    { path: '/trains', label: 'Trains' },
    { path: '/buses', label: 'Buses' },
    { path: '/passport', label: 'Passport Services' }
  ];

  const travelActive = travelLinks.some(
    (link) => location.pathname === link.path
  );

  return (
    <header className="header">
      <div className="header-container">

        <Link to="/" className="logo" onClick={closeMenus}>
          <FaPlane className="logo-icon" />
          <div>
            <h1>Rasika Tours</h1>
            <p>Travel Made Simple</p>
          </div>
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setTravelOpen(false);
            setAccountOpen(false);
          }}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>

          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMenus}
          >
            Home
          </Link>

          <div className="nav-dropdown">
            <button
              className={`nav-dropdown-toggle ${travelActive ? 'active' : ''}`}
              onClick={() => {
                setTravelOpen(!travelOpen);
                setAccountOpen(false);
              }}
            >
              <FaSuitcase />
              Travel Services
              <FaChevronDown
                className={travelOpen ? 'rotate' : ''}
              />
            </button>

            <div className={`dropdown-menu ${travelOpen ? 'show' : ''}`}>
              {travelLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`dropdown-link ${
                    location.pathname === link.path ? 'active' : ''
                  }`}
                  onClick={closeMenus}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/contact"
            className={`nav-link ${
              location.pathname === '/contact' ? 'active' : ''
            }`}
            onClick={closeMenus}
          >
            Contact Us
          </Link>

          {isLoggedIn ? (
            <div className="nav-dropdown account-dropdown">

              <button
                className="account-toggle"
                onClick={() => {
                  setAccountOpen(!accountOpen);
                  setTravelOpen(false);
                }}
              >
                <FaUserCircle />
                <span>{user?.fullName?.split(' ')[0] || 'Account'}</span>
                <FaChevronDown
                  className={accountOpen ? 'rotate' : ''}
                />
              </button>

              <div className={`dropdown-menu account-menu ${accountOpen ? 'show' : ''}`}>

                {user?.role !== 'ADMIN' && (
                  <Link
                    to="/dashboard"
                    className="dropdown-link"
                    onClick={closeMenus}
                  >
                    My Dashboard
                  </Link>
                )}

                <Link
                  to="/my-bookings"
                  className="dropdown-link"
                  onClick={closeMenus}
                >
                  My Bookings
                </Link>

                <Link
                  to="/my-passport-requests"
                  className="dropdown-link"
                  onClick={closeMenus}
                >
                  Passport Requests
                </Link>

                {user?.role === 'ADMIN' && (
                  <button
                    className="dropdown-button admin-button"
                    onClick={() => {
                      closeMenus();
                      navigate('/admin');
                    }}
                  >
                    Admin Dashboard
                  </button>
                )}

                <button
                  className="dropdown-button logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>
            </div>
          ) : (
            <div className="auth-actions">
              <Link
                to="/login"
                className="nav-login"
                onClick={closeMenus}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-register"
                onClick={closeMenus}
              >
                Register
              </Link>
            </div>
          )}

        </nav>
      </div>
    </header>
  );
}

export default Header;
