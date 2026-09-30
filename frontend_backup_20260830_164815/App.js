import React from 'react';
import { BrowserRouter as Router, Routes, Route , Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import FlightSearch from './components/FlightSearch';
import TrainSearch from './components/TrainSearch';
import BusSearch from './components/BusSearch';
import PassportForm from './components/PassportForm';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import MyBookings from './components/MyBookings';
import MyPassportRequests from './components/MyPassportRequests';
import CustomerDashboard from './components/customer/CustomerDashboard';
import ContactUs from './components/ContactUs';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ADMIN DASHBOARD ERROR:', error);
    console.error('ADMIN DASHBOARD INFO:', info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '60px',
          margin: '40px auto',
          maxWidth: '1000px',
          background: '#fff',
          color: '#b00020',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          border: '2px solid #b00020',
          borderRadius: '12px'
        }}>
          <h1>Admin Dashboard Runtime Error ❌</h1>
          <p>{this.state.error?.toString()}</p>
          <hr />
          <p>Check the browser console for the full error.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function AdminRoute() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <AdminDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/flights" element={<div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}><FlightSearch /></div>} />
              <Route path="/trains" element={<div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}><TrainSearch /></div>} />
              <Route path="/buses" element={<div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}><BusSearch /></div>} />
              <Route path="/passport" element={<div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}><PassportForm /></div>} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/my-passport-requests" element={<MyPassportRequests />} />
              <Route
                path="/admin"
                element={
                  <AdminErrorBoundary>
                    <AdminRoute />
                  </AdminErrorBoundary>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;