import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout'; // <-- NEW: Main app shell
import DashboardHome from './pages/DashboardHome'; // <-- NEW
import ListFlightsPage from './pages/ListFlightsPage'; // <-- NEW
import MyBookingsPage from './pages/MyBookingsPage'; // <-- NEW
import AdminAddFlightPage from './pages/AdminAddFlightPage'; // <-- NEW
import AdminManageFlightsPage from './pages/AdminManageFlightsPage'; // <-- NEW
import './App.css';

// --- NEW: Protected route for all users ---
const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

// --- NEW: Protected route for admins only ---
const AdminRoute = ({ children }) => {
    const { token, isAdmin } = useAuth();
    if (!token) {
        return <Navigate to="/login" />;
    }
    return isAdmin ? children : <Navigate to="/" />; // Redirect non-admins to home
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public login page */}
                <Route path="/login" element={<AuthPage />} />

                {/* --- NEW: Logged-in user routes --- */}
                <Route 
                    path="/" 
                    element={<PrivateRoute><Layout /></PrivateRoute>}
                >
                    {/* Child pages that render inside the Layout's <Outlet> */}
                    <Route index element={<DashboardHome />} />
                    <Route path="flights" element={<ListFlightsPage />} />
                    <Route path="bookings" element={<MyBookingsPage />} />

                    {/* --- NEW: Admin-only child pages --- */}
                    <Route path="admin/add-flight" element={
                        <AdminRoute><AdminAddFlightPage /></AdminRoute>
                    } />
                    <Route path="admin/manage-flights" element={
                        <AdminRoute><AdminManageFlightsPage /></AdminRoute>
                    } />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;