import React, { useState } from 'react';
import FlightList from '../components/FlightList';
import BookFlight from '../components/BookFlight';
import Alert from '../components/Alert'; // <-- NEW: Reusable Alert component
import '../components/Layout.css';

function ListFlightsPage() {
    const [alert, setAlert] = useState(null);
    // Key to force FlightList to re-render after a booking
    const [refreshKey, setRefreshKey] = useState(0); 

    const handleBookingSuccess = () => {
        setAlert({ type: 'success', message: 'Booking successful!' });
        setRefreshKey(key => key + 1); // Trigger re-render
    };

    return (
        <div className="page-container">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
            
            <div className="component-section">
                <h2>🎟️ Book a Ticket</h2>
                <BookFlight 
                    onBookingSuccess={handleBookingSuccess} 
                    onError={(msg) => setAlert({ type: 'error', message: msg })} 
                />
            </div>

            <div className="component-section">
                <h2>✈️ Available Flights</h2>
                <FlightList key={refreshKey} />
            </div>
        </div>
    );
}

export default ListFlightsPage;