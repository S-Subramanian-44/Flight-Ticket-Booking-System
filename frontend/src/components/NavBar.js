import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavBar.css'; // <-- New CSS file

function NavBar() {
    const { isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login on logout
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="nav-logo">🚀 FlightBooker</Link>
                <Link to="/flights" className="nav-item">View Flights</Link>
                <Link to="/bookings" className="nav-item">My Bookings</Link>
                
                {/* --- Admin-Only Links --- */}
                {isAdmin && (
                    <div className="nav-admin-menu">
                        <span className="nav-item admin-link">Admin</span>
                        <div className="nav-admin-dropdown">
                            <Link to="/admin/add-flight">Add Flight</Link>
                            <Link to="/admin/manage-flights">Manage Flights</Link>
                        </div>
                    </div>
                )}
            </div>
            <div className="navbar-right">
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </nav>
    );
}

export default NavBar;