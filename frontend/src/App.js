import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import FlightList from './components/FlightList';
import BookFlight from './components/BookFlight';
import CancelBooking from './components/CancelBooking';
import MyBookings from './components/MyBookings';
import AdminPanel from './components/AdminPanel'; // <-- Import new component
import './App.css';

const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

function Dashboard() {
    const [alert, setAlert] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const { logout, isAdmin } = useAuth(); // <-- Get isAdmin status

    const handleAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleSuccess = (message) => {
        setRefreshKey(oldKey => oldKey + 1);
        handleAlert('success', message || 'Action successful!');
    };

    return (
        <div className="container">
            <button className="logout-btn" onClick={logout}>Logout</button>
            <h1>🚀 Flight Ticket Booking System</h1>
            
            {alert && (
                <div className={`alert alert-${alert.type}`}>
                    {alert.message}
                </div>
            )}

            {/* --- NEW: Show AdminPanel if user is admin --- */}
            {isAdmin && (
                <AdminPanel 
                    onActionSuccess={handleSuccess}
                    onError={(msg) => handleAlert('error', msg)}
                />
            )}

            <div className="component-section">
                <h2>✈️ Available Flights</h2>
                <FlightList key={`flights-${refreshKey}`} />
            </div>
            
            <div className="component-section">
                <h2>My Bookings</h2>
                <MyBookings key={`bookings-${refreshKey}`} />
            </div>

            <div className="component-section">
                <h2>🎟️ Book a Ticket</h2>
                <BookFlight 
                    onBookingSuccess={() => handleSuccess('Booking successful!')}
                    onError={(msg) => handleAlert('error', msg)} 
                />
            </div>

            <div className="component-section">
                <h2>❌ Cancel a Booking</h2>
                <CancelBooking 
                    onCancelSuccess={() => handleSuccess('Cancellation successful!')}
                    onError={(msg) => handleAlert('error', msg)}
                />
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route 
                    path="/" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />
            </Routes>
        </AuthProvider>
    );
}

export default App;