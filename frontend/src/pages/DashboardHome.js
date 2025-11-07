import React from 'react';
import '../components/Layout.css'; // Re-use layout CSS

function DashboardHome() {
    return (
        <div className="page-container">
            <h1>Welcome to FlightBooker</h1>
            <p>Use the navigation menu above to view flights, manage your bookings, or access admin controls.</p>
        </div>
    );
}

export default DashboardHome;