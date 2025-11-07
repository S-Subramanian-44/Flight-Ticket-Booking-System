import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import DashboardHome from './pages/DashboardHome'; // <-- Will be modified
import BookTicketPage from './pages/BookTicketPage'; // <-- NEW
import MyBookingsPage from './pages/MyBookingsPage';
import AdminAddFlightPage from './pages/AdminAddFlightPage';
import AdminManageFlightsPage from './pages/AdminManageFlightsPage';
import './App.css';

const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { token, isAdmin } = useAuth();
    if (!token) {
        return <Navigate to="/login" />;
    }
    return isAdmin ? children : <Navigate to="/" />;
};

function App() {
    return (
        // AuthProvider is already here from previous step
        <Routes>
            <Route path="/login" element={<AuthPage />} />

            <Route 
                path="/" 
                element={<PrivateRoute><Layout /></PrivateRoute>}
            >
                <Route index element={<DashboardHome />} />
                
                {/* --- NEW/MODIFIED BOOKING ROUTES --- */}
                {/* /book will be for manual entry */}
                <Route path="book" element={<BookTicketPage />} /> 
                {/* /book/:flightId will be for pre-filled entry */}
                <Route path="book/:flightId" element={<BookTicketPage />} /> 

                <Route path="bookings" element={<MyBookingsPage />} />

                {/* --- Admin Routes (Unchanged) --- */}
                <Route path="admin/add-flight" element={
                    <AdminRoute><AdminAddFlightPage /></AdminRoute>
                } />
                <Route path="admin/manage-flights" element={
                    <AdminRoute><AdminManageFlightsPage /></AdminRoute>
                } />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

// We remove the old Dashboard component from App.js, as its
// contents are now in the new page components.

// Make sure AuthProvider is now wrapping <Routes>
// In your case, it's wrapping App in index.js, which is perfect.



export default App;