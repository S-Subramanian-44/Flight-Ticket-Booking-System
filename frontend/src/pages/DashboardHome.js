import React from 'react';
import { useNavigate } from 'react-router-dom';
import FlightList from '../components/FlightList';
import '../components/Layout.css';

function DashboardHome() {
    const navigate = useNavigate();

    // This function will be passed to FlightList
    // It navigates to the booking page with the flight ID
    const handleBookClick = (flightId) => {
        navigate(`/book/${flightId}`);
    };

    return (
        <div className="page-container">
            <h1>Available Flights</h1>
            <p>Welcome! See a flight you like? Click "Book Now" to proceed.</p>
            <div className="component-section">
                {/* Pass the new 'onBookClick' prop. 
                  We'll also pass 'showAdminControls={false}'
                */}
                <FlightList 
                    onBookClick={handleBookClick}
                    showAdminControls={false} 
                />
            </div>
        </div>
    );
}

export default DashboardHome;