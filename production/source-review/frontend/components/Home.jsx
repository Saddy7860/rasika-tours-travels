import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlane,
  FaTrain,
  FaBus,
  FaPassport,
  FaArrowRight,
  FaShieldAlt,
  FaHeadset,
  FaCheckCircle,
  FaStar,
  FaPhoneAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';

import './Home.css';

function Home() {
  const navigate = useNavigate();

  const services = [
    {
      icon: <FaPlane />,
      title: 'Flight Booking',
      description: 'Find convenient domestic and international flight options.',
      path: '/flights'
    },
    {
      icon: <FaTrain />,
      title: 'Train Booking',
      description: 'Search and book train journeys with ease.',
      path: '/trains'
    },
    {
      icon: <FaBus />,
      title: 'Bus Booking',
      description: 'Explore comfortable bus travel for your next trip.',
      path: '/buses'
    },
    {
      icon: <FaPassport />,
      title: 'Passport Services',
      description: 'Get assistance with passport applications and renewals.',
      path: '/passport'
    }
  ];

  const features = [
    {
      icon: <FaShieldAlt />,
      title: 'Secure Experience',
      description: 'Your booking information is handled securely.'
    },
    {
      icon: <FaHeadset />,
      title: 'Customer Support',
      description: 'Get help whenever you need assistance.'
    },
    {
      icon: <FaCheckCircle />,
      title: 'Easy Booking',
      description: 'Simple steps designed for a smooth booking experience.'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      review: 'Easy to use and the booking process was smooth and simple.'
    },
    {
      name: 'Priya Sharma',
      review: 'A convenient platform for managing different travel services.'
    },
    {
      name: 'Amit Patel',
      review: 'Professional experience and a clean booking process.'
    }
  ];

  return (
    <main className="home-container">

      {/* HERO */}
      <section className="new-hero">
        <div className="hero-bg-shape hero-shape-one"></div>
        <div className="hero-bg-shape hero-shape-two"></div>

        <div className="home-wrapper hero-grid">

          <div className="hero-left">
            <div className="hero-badge">
              <span></span>
              ALL-IN-ONE TRAVEL PLATFORM
            </div>

            <h1>
              Travel Smarter.
              <br />
              <span>Journey Better.</span>
            </h1>

            <p>
              Plan your journey from one convenient place. Explore flights,
              trains, buses and passport services with Rasika Tours & Travels.
            </p>

            <div className="hero-actions">
              <button
                className="hero-primary-btn"
                onClick={() => navigate('/flights')}
              >
                Explore Flights
                <FaArrowRight />
              </button>

              <button
                className="hero-secondary-btn"
                onClick={() => navigate('/passport')}
              >
                <FaPassport />
                Passport Services
              </button>
            </div>

            <div className="hero-trust-row">
              <div>
                <FaCheckCircle />
                <span>Easy Booking</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Multiple Services</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Secure Platform</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="travel-card main-travel-card">

              <div className="travel-card-top">
                <div className="plane-icon">
                  <FaPlane />
                </div>

                <span>EXPLORE YOUR JOURNEY</span>
              </div>

              <h3>Your next destination awaits.</h3>

              <p>
                Choose your travel service and begin planning your journey today.
              </p>

              <div className="journey-options">

                <button onClick={() => navigate('/flights')}>
                  <FaPlane />
                  <span>
                    <strong>Flights</strong>
                    <small>Travel by air</small>
                  </span>
                  <FaArrowRight />
                </button>

                <button onClick={() => navigate('/trains')}>
                  <FaTrain />
                  <span>
                    <strong>Trains</strong>
                    <small>Travel by rail</small>
                  </span>
                  <FaArrowRight />
                </button>

                <button onClick={() => navigate('/buses')}>
                  <FaBus />
                  <span>
                    <strong>Buses</strong>
                    <small>Road journeys</small>
                  </span>
                  <FaArrowRight />
                </button>

              </div>

            </div>

            <div className="floating-location">
              <FaMapMarkerAlt />
              <div>
                <strong>Start Exploring</strong>
                <span>Plan your next journey</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SERVICES */}
      <section className="services-section-new">
        <div className="home-wrapper">

          <div className="section-heading">
            <div>
              <span className="section-eyebrow">OUR SERVICES</span>
              <h2>Everything You Need For Travel</h2>
              <p>
                Explore our travel and documentation services from one platform.
              </p>
            </div>
          </div>

          <div className="services-grid-new">
            {services.map((service, index) => (
              <article
                className="service-card-new"
                key={index}
                onClick={() => navigate(service.path)}
              >
                <div className="service-number">
                  0{index + 1}
                </div>

                <div className="service-icon-new">
                  {service.icon}
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <button>
                  Explore Service
                  <FaArrowRight />
                </button>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-section">
        <div className="home-wrapper why-grid">

          <div className="why-content">
            <span className="section-eyebrow light">
              WHY CHOOSE US
            </span>

            <h2>
              Travel Planning Made
              <span> Simple.</span>
            </h2>

            <p>
              Rasika Tours & Travels brings important travel services together
              in one convenient place.
            </p>

            <button
              className="why-button"
              onClick={() => navigate('/flights')}
            >
              Start Exploring
              <FaArrowRight />
            </button>
          </div>

          <div className="why-features">
            {features.map((feature, index) => (
              <div className="why-feature-card" key={index}>
                <div className="why-feature-icon">
                  {feature.icon}
                </div>

                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* STATS */}
      <section className="stats-section-new">
        <div className="home-wrapper stats-grid-new">

          <div className="stat-new">
            <strong>All-in-One</strong>
            <span>Travel Services</span>
          </div>

          <div className="stat-new">
            <strong>Easy</strong>
            <span>Booking Process</span>
          </div>

          <div className="stat-new">
            <strong>24/7</strong>
            <span>Support Availability</span>
          </div>

          <div className="stat-new">
            <strong>Secure</strong>
            <span>Platform Experience</span>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section-new">
        <div className="home-wrapper">

          <div className="section-heading centered">
            <span className="section-eyebrow">CUSTOMER EXPERIENCE</span>
            <h2>What Our Customers Say</h2>
            <p>
              Feedback from people who have used our travel services.
            </p>
          </div>

          <div className="testimonials-grid-new">
            {testimonials.map((testimonial, index) => (
              <article className="testimonial-card-new" key={index}>

                <div className="stars-new">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <p>
                  "{testimonial.review}"
                </p>

                <div className="testimonial-user-new">
                  <div className="testimonial-avatar-new">
                    {testimonial.name.charAt(0)}
                  </div>

                  <div>
                    <h4>{testimonial.name}</h4>
                    <span>Customer</span>
                  </div>
                </div>

              </article>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="home-wrapper final-cta-content">

          <div>
            <span>READY TO TRAVEL?</span>
            <h2>Your Next Journey Starts Here.</h2>
            <p>
              Explore available travel services and start planning today.
            </p>
          </div>

          <div className="final-cta-actions">
            <button
              onClick={() => navigate('/flights')}
            >
              Start Your Journey
              <FaPlane />
            </button>

            <button
              className="contact-outline-btn"
              type="button"
            >
              <FaPhoneAlt />
              Contact Us
            </button>
          </div>

        </div>
      </section>

    </main>
  );
}

export default Home;
